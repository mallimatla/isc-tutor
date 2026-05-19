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
    throw new UnauthorizedError("Invalid or expired ID token", {
      cause: err,
    });
  }
}
