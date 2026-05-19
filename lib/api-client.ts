"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
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

async function waitForAuthReady(): Promise<User> {
  const current = auth.currentUser;
  if (current) return current;

  return new Promise<User>((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new NotAuthenticatedError());
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject(new NotAuthenticatedError());
      }
    }, (err) => {
      clearTimeout(timeout);
      unsubscribe();
      reject(err);
    });
  });
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const user = await waitForAuthReady();
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
