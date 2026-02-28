import { NextRequest } from "next/server";
import { verifyAccessToken, TokenPayload } from "./jwt";

export interface AuthenticatedUser extends TokenPayload {
  userId: string;
  email: string;
}

export function authenticate(request: NextRequest): AuthenticatedUser {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, email: payload.email };
  } catch {
    throw new AuthError("Invalid or expired token");
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
