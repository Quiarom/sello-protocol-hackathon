import { NextResponse } from "next/server";
import {
  getAppwriteRuntimeConfig,
  getMissingAppwriteServerEnv,
} from "@/app/lib/appwrite-config";

type AppwriteExecution = {
  responseBody?: string;
  responseStatusCode?: number;
  responseHeaders?: Array<{ name: string; value: string }>;
  errors?: string;
};

export async function POST(request: Request) {
  const body = await request.text();
  const paymentPayload = request.headers.get("x-payment-payload");
  const config = getAppwriteRuntimeConfig();
  const missingEnv = getMissingAppwriteServerEnv(config);

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: `Appwrite server config missing: ${missingEnv.join(", ")}. Add it to Frontend/sello-colosseum-clean/.env.local before running narration.`,
      },
      { status: 503 }
    );
  }

  const executionRes = await fetch(
    `${config.endpoint}/functions/${config.functionId}/executions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": config.projectId,
        "X-Appwrite-Key": config.apiKey,
      },
      body: JSON.stringify({
        path: "/",
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(paymentPayload ? { "x-payment-payload": paymentPayload } : {}),
        },
        body,
        async: false,
      }),
    }
  );

  if (!executionRes.ok) {
    const err = await executionRes.text();
    return NextResponse.json(
      {
        error:
          `Appwrite execution failed via project ${config.projectId} and function ${config.functionId}. ` +
          `Check APPWRITE_PROJECT_ID / APPWRITE_FUNCTION_ID / APPWRITE_API_KEY. Raw response: ${err}`,
      },
      { status: 500 }
    );
  }

  const execution = (await executionRes.json()) as AppwriteExecution;
  const statusCode = execution.responseStatusCode ?? 500;

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(execution.responseBody ?? "{}");
  } catch {
    parsedBody = { raw: execution.responseBody };
  }

  const headers: Record<string, string> = { "Access-Control-Allow-Origin": "*" };
  for (const h of execution.responseHeaders ?? []) {
    headers[h.name.toLowerCase()] = h.value;
  }

  return NextResponse.json(parsedBody, { status: statusCode, headers });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, x-payment-payload",
    },
  });
}
