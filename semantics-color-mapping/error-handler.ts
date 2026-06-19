/*
Copyright (c) 2026 1abcdefggs (takaer)
Licensed under the MIT License
See LICENSE file in the project root for full license information
*/

// Custom Error Handler — Syntax Highlighting Demo

type ErrorLevel = "fatal" | "warning" | "info";

interface AppError {
  code: number;
  message: string;
  level: ErrorLevel;
  timestamp: Date;
}

class NetworkError extends Error {
  readonly statusCode: number;
  readonly endpoint: string;

  constructor(status: number, endpoint: string) {
    super(`Request failed: ${endpoint} [${status}]`);
    this.statusCode = status;
    this.endpoint = endpoint;
  }

  get isCritical(): boolean {
    return this.statusCode >= 500;
  }
}

const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: NetworkError | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new NetworkError(response.status, url);
      }

      return response;
    } catch (error) {
      lastError = error instanceof NetworkError
        ? error
        : new NetworkError(0, url);

      console.warn(`Attempt ${attempt}/${MAX_RETRIES} failed`);
    }
  }

  throw lastError ?? new Error("Unknown failure");
}

function logError(error: AppError): void {
  const prefix = {
    fatal: "💀 FATAL",
    warning: "⚠️  WARN",
    info: "ℹ️  INFO",
  }[error.level];

  const output = `[${prefix}] ${error.code}: ${error.message}`;
  console.error(output);
}

// Usage
const result = await fetchWithRetry("https://api.example.com/data");
