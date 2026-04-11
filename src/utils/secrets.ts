import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

type LoadSecretsResult = {
  success: boolean;
  message: string;
  data: Record<string, string> | null;
};

let cachedSecrets: Record<string, string> | null = null;

export async function loadSecrets(
  secretName: string,
  region: string = "ap-south-1"
): Promise<LoadSecretsResult> {
  // ✅ Return from cache (important for performance)
  if (cachedSecrets) {
    return {
      success: true,
      message: "Secrets loaded from cache",
      data: cachedSecrets,
    };
  }

  const client = new SecretsManagerClient({
    region,
    maxAttempts: 3, // retry strategy
  });

  try {
    console.log(`📡 Fetching secrets from AWS: ${secretName}`);

    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error("SecretString is empty");
    }

    let parsed: Record<string, string>;

    try {
      parsed = JSON.parse(response.SecretString);
    } catch {
      throw new Error("Invalid JSON format in secret");
    }

    // ✅ Inject into process.env safely
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "string") {
        console.warn(`⚠️ Skipping non-string secret: ${key}`);
        continue;
      }
      process.env[key] = value;
    }

    // ✅ Cache secrets
    cachedSecrets = parsed;

    console.log("✅ Secrets loaded successfully");

    return {
      success: true,
      message: "Secrets loaded successfully",
      data: parsed,
    };
  } catch (error: any) {
    console.warn(`⚠️ AWS Secrets failed: ${error.message}`);
    console.warn("💡 Falling back to .env");

    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
}

/**
 * Validates that all required environment variables are present.
 * Throws an error if any are missing.
 */
export function validateEnv(required: string[]) {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
  }
}