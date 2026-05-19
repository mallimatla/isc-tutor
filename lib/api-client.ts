"use client";

import { auth } from "@/lib/firebase";

export class NotAuthenticatedError extends Error {
  constructor() {
    super("User is not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(body.error ? String(body.error) : `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new NotAuthenticatedError();

  const token = await user.getIdToken();

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json);
  }

  return json as T;
}
