import { NextRequest, NextResponse } from "next/server";
import { getApp } from "firebase-admin/app";
import { adminApp, adminAuth, adminDb, col, parsePrivateKey } from "@/lib/firebase-admin";

interface TestResult {
  status: "pass" | "FAIL";
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  // Gate access behind DEBUG_ENDPOINT_KEY
  const expectedKey = process.env.DEBUG_ENDPOINT_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const providedKey = req.nextUrl.searchParams.get("key");
  if (providedKey !== expectedKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const tests: Record<string, TestResult> = {};
  let passed = 0;

  // Test 1 — Env vars
  try {
    const vars: Record<string, string> = {};
    for (const name of [
      "ANTHROPIC_API_KEY",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "FIRESTORE_COLLECTION_PREFIX",
    ]) {
      vars[name] = process.env[name] ? "present" : "missing";
    }
    const allPresent = Object.values(vars).every((v) => v === "present");
    tests.env_vars = { status: allPresent ? "pass" : "FAIL", details: vars };
    if (allPresent) passed++;
  } catch (err) {
    tests.env_vars = {
      status: "FAIL",
      error_message: err instanceof Error ? err.message : String(err),
    };
  }

  // Test 2 — Private key shape
  try {
    const key = parsePrivateKey();
    const newlineCount = (key.match(/\n/g) || []).length;
    tests.private_key_shape = {
      status: "pass",
      details: {
        length: key.length,
        newlineCount,
        hasBeginMarker: key.includes("-----BEGIN PRIVATE KEY-----"),
        hasEndMarker: key.includes("-----END PRIVATE KEY-----"),
        first30: key.slice(0, 30),
        last30: key.slice(-30),
      },
    };
    passed++;
  } catch (err) {
    tests.private_key_shape = {
      status: "FAIL",
      error_message: err instanceof Error ? err.message : String(err),
    };
  }

  // Test 3 — Admin SDK init
  try {
    // Access adminApp to trigger init if needed
    const app = getApp();
    const options = app.options;
    tests.admin_sdk_init = {
      status: "pass",
      details: {
        appExists: !!app,
        projectId: options.projectId,
        clientEmail: options.credential
          ? "present (credential object exists)"
          : "missing",
      },
    };
    passed++;
  } catch (err) {
    // Try via our export as fallback
    try {
      void adminApp;
      tests.admin_sdk_init = {
        status: "FAIL",
        error_message: err instanceof Error ? err.message : String(err),
        note: "adminApp export exists but getApp() failed",
      };
    } catch (err2) {
      tests.admin_sdk_init = {
        status: "FAIL",
        error_message: err instanceof Error ? err.message : String(err),
        proxy_error: err2 instanceof Error ? err2.message : String(err2),
      };
    }
  }

  // Test 4 — Auth.verifyIdToken with dummy token
  try {
    await adminAuth.verifyIdToken("test");
    // Should not succeed
    tests.verify_dummy_token = {
      status: "pass",
      note: "Unexpectedly succeeded — this is suspicious",
    };
    passed++;
  } catch (err) {
    const code =
      err instanceof Error && "code" in err
        ? (err as Error & { code: string }).code
        : undefined;
    // auth/argument-error means verifyIdToken is working (it rejected the bad token)
    const isExpected = code === "auth/argument-error";
    tests.verify_dummy_token = {
      status: isExpected ? "pass" : "FAIL",
      error_code: code ?? "unknown",
      error_message: err instanceof Error ? err.message : String(err),
    };
    if (isExpected) passed++;
  }

  // Test 5 — Firestore raw read
  try {
    const docRef = adminDb
      .collection(col("sessions"))
      .doc("definitely-does-not-exist-debug-doc");
    const snap = await docRef.get();
    tests.firestore_read = {
      status: "pass",
      details: {
        docExists: snap.exists,
        collectionPath: col("sessions"),
      },
    };
    passed++;
  } catch (err) {
    const code =
      err instanceof Error && "code" in err
        ? (err as Error & { code: unknown }).code
        : undefined;
    const stack = err instanceof Error ? err.stack?.split("\n")[0] : undefined;
    tests.firestore_read = {
      status: "FAIL",
      error_code: code != null ? String(code) : "unknown",
      error_message: err instanceof Error ? err.message : String(err),
      stack_first_line: stack,
    };
  }

  // Test 6 — Service account token mint
  try {
    const app = getApp();
    const credential = app.options.credential;
    if (credential && "getAccessToken" in credential) {
      const tokenResult = await (
        credential as { getAccessToken: () => Promise<{ access_token: string; expires_in: number }> }
      ).getAccessToken();
      tests.token_mint = {
        status: "pass",
        details: {
          tokenPrefix: tokenResult.access_token.slice(0, 20) + "...",
          expiresIn: tokenResult.expires_in,
        },
      };
      passed++;
    } else {
      tests.token_mint = {
        status: "FAIL",
        error_message: "credential object does not have getAccessToken method",
      };
    }
  } catch (err) {
    tests.token_mint = {
      status: "FAIL",
      error_message: err instanceof Error ? err.message : String(err),
    };
  }

  return NextResponse.json({
    tests,
    summary: `${passed} of 6 tests passed`,
  });
}
