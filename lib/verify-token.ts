import { adminAuth } from "@/lib/firebase-admin";

export class UnauthorizedError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UnauthorizedError";
  }
}

interface VerifiedUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export async function verifyRequest(req: Request): Promise<VerifiedUser> {
  const header = req.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError(
      "Missing or malformed Authorization header. Expected: Bearer <id-token>"
    );
  }

  const token = header.slice(7);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name,
      photoURL: decoded.picture,
    };
  } catch (err) {
    // Parse JWT payload for diagnostic context (never log the full token)
    let tokenAud: string | undefined;
    try {
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString());
        tokenAud = payload.aud;
      }
    } catch {
      // JWT parsing failed — not critical for diagnostics
    }

    const firebaseCode =
      err instanceof Error && "code" in err
        ? (err as Error & { code: string }).code
        : undefined;

    console.error("[verify-token] ID token verification failed", {
      firebaseCode,
      errorMessage: err instanceof Error ? err.message : String(err),
      tokenPrefix: token.slice(0, 30),
      expectedProjectId: process.env.FIREBASE_PROJECT_ID,
      tokenAud,
    });

    let message: string;
    switch (firebaseCode) {
      case "auth/id-token-expired":
        message = "Token expired";
        break;
      case "auth/argument-error":
        message = "Token malformed";
        break;
      case "auth/id-token-revoked":
        message = "Token revoked";
        break;
      default:
        message = "Token verification failed";
    }

    throw new UnauthorizedError(message, { cause: err });
  }
}
