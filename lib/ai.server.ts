import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry } from 'ai';

const registry = createProviderRegistry({
  openai: createOpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  anthropic: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  google: createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }),
});

// Foundry *project* endpoints (https://<res>.services.ai.azure.com/api/projects/<name>)
// reject OpenAI-compatible chat calls without an api-version. The resource's
// versioned OpenAI v1 endpoint serves the same deployments without one.
function azureBaseUrl(raw: string | undefined) {
  if (!raw) {
    return undefined;
  }
  try {
    const url = new URL(raw);
    if (url.hostname.endsWith('.services.ai.azure.com') && url.pathname.startsWith('/api/projects/')) {
      return `${url.origin}/openai/v1`;
    }
  } catch {
    // Let the Azure provider report malformed URLs.
  }
  return raw;
}

function createAzureProvider() {
  const baseURL = azureBaseUrl(process.env.AZURE_BASE_URL);
  return createAzure({
    apiKey: process.env.AZURE_API_KEY,
    ...(baseURL ? { baseURL } : { resourceName: process.env.AZURE_RESOURCE_NAME }),
  });
}

export function getAiModel() {
  const configuredModel = process.env.AI_MODEL;
  if (!configuredModel) {
    throw new Error(
      'AI_MODEL is not configured. Set it to provider:model-id, such as openai:your-model.',
    );
  }

  const separator = configuredModel.indexOf(':');
  const provider = configuredModel.slice(0, separator);
  const modelId = configuredModel.slice(separator + 1);
  const apiKeys: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    azure: process.env.AZURE_API_KEY,
  };
  const keyNames: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    azure: 'AZURE_API_KEY',
  };

  if (!modelId || !(provider in apiKeys)) {
    throw new Error(
      'AI_MODEL must use a supported provider:model-id value (azure, openai, anthropic, or google).',
    );
  }
  if (!apiKeys[provider]) {
    throw new Error(`Missing ${keyNames[provider]} for AI_MODEL=${configuredModel}.`);
  }
  if (provider === 'azure') {
    if (!process.env.AZURE_BASE_URL && !process.env.AZURE_RESOURCE_NAME) {
      throw new Error(
        'Azure AI requires either AZURE_BASE_URL or AZURE_RESOURCE_NAME for AI_MODEL=' +
          `${configuredModel}.`,
      );
    }
    return createAzureProvider().chat(modelId);
  }

  return registry.languageModel(
    `${provider}:${modelId}` as 'openai:string' | 'anthropic:string' | 'google:string',
  );
}

export function imagePrompt(
  imageBase64: string,
  mimeType: string,
  instruction: string,
) {
  return {
    role: 'user' as const,
    content: [
      { type: 'text' as const, text: instruction },
      {
        type: 'image' as const,
        image: `data:${mimeType};base64,${imageBase64}`,
      },
    ],
  };
}
