import { createAnthropic } from '@ai-sdk/anthropic';
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
  };

  if (!modelId || !(provider in apiKeys)) {
    throw new Error(
      'AI_MODEL must use a supported provider:model-id value (openai, anthropic, or google).',
    );
  }
  if (!apiKeys[provider]) {
    const keyName =
      provider === 'openai'
        ? 'OPENAI_API_KEY'
        : provider === 'anthropic'
          ? 'ANTHROPIC_API_KEY'
          : 'GOOGLE_GENERATIVE_AI_API_KEY';
    throw new Error(`Missing ${keyName} for AI_MODEL=${configuredModel}.`);
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
