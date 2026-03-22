import { APIGatewayProxyResult } from "aws-lambda";
import { ZodError } from "zod";

export const headers = {
  "Content-Type": "application/json",
};

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public readonly payload: Record<string, unknown>,
  ) {
    super(JSON.stringify(payload));
    this.name = "HttpError";
  }
}

export const handleError = (error: unknown): APIGatewayProxyResult => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify(error.payload),
      headers,
    };
  }
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Validation failed", details: error?.issues }),
    };
  }
  throw error;
};
