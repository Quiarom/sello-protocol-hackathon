export const APPWRITE_DEFAULTS = {
  endpoint: "https://nyc.cloud.appwrite.io/v1",
  projectId: "sello-protocol",
  functionId: "fn-narrate",
  databaseId: "sello-db",
  audioBucketId: "narrations",
} as const;

export function getAppwriteRuntimeConfig() {
  const endpoint = process.env.APPWRITE_ENDPOINT ?? APPWRITE_DEFAULTS.endpoint;
  const projectId = process.env.APPWRITE_PROJECT_ID ?? APPWRITE_DEFAULTS.projectId;
  const apiKey = process.env.APPWRITE_API_KEY ?? "";
  const functionId = process.env.APPWRITE_FUNCTION_ID ?? APPWRITE_DEFAULTS.functionId;
  const databaseId = process.env.APPWRITE_DB_ID ?? APPWRITE_DEFAULTS.databaseId;
  const audioBucketId =
    process.env.APPWRITE_AUDIO_BUCKET_ID ?? APPWRITE_DEFAULTS.audioBucketId;

  return {
    endpoint,
    projectId,
    apiKey,
    functionId,
    databaseId,
    audioBucketId,
  };
}

export function getMissingAppwriteServerEnv(config = getAppwriteRuntimeConfig()) {
  const missing: string[] = [];

  if (!config.apiKey) {
    missing.push("APPWRITE_API_KEY");
  }

  return missing;
}
