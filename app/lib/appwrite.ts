import { Client, Databases, Query, Storage } from "node-appwrite";
import { getAppwriteRuntimeConfig } from "@/app/lib/appwrite-config";

function getAppwriteClient(): Client | null {
  const config = getAppwriteRuntimeConfig();
  if (!config.apiKey) return null;

  return new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);
}

export type NarrationFile = {
  id: string;
  name: string;
  audioUrl: string;
  createdAt: string;
  sizeOriginal: number;
};

export type CreatorDoc = {
  authorPubkey: string;
  contactEmail: string | null;
  publicProfileUrl: string | null;
  domain: string;
  totalArticles: number;
  publisher: string;
};

export async function getCreatorByDomain(
  domain: string
): Promise<CreatorDoc | null> {
  const client = getAppwriteClient();
  if (!client) return null;

  const { databaseId } = getAppwriteRuntimeConfig();
  if (!databaseId) return null;

  try {
    const db = new Databases(client);
    const result = await db.listDocuments(databaseId, "creators", [
      Query.equal("domain", domain),
      Query.limit(1),
    ]);
    if (result.documents.length === 0) return null;
    const doc = result.documents[0];
    return {
      authorPubkey: doc.authorPubkey as string,
      contactEmail: (doc.contactEmail as string) ?? null,
      publicProfileUrl: (doc.publicProfileUrl as string) ?? null,
      domain: doc.domain as string,
      totalArticles: (doc.totalArticles as number) ?? 0,
      publisher: (doc.publisher as string) ?? "",
    };
  } catch {
    return null;
  }
}

export async function listNarrationFiles(limit = 10): Promise<NarrationFile[]> {
  const client = getAppwriteClient();
  if (!client) return [];

  const { endpoint, projectId, audioBucketId } = getAppwriteRuntimeConfig();

  try {
    const storage = new Storage(client);
    const result = await storage.listFiles(audioBucketId, [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);

    return result.files.map((file) => ({
      id: file.$id,
      name: file.name,
      audioUrl: `${endpoint}/storage/buckets/${audioBucketId}/files/${file.$id}/view?project=${projectId}`,
      createdAt: file.$createdAt,
      sizeOriginal: file.sizeOriginal,
    }));
  } catch {
    return [];
  }
}
