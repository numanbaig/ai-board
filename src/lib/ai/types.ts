export type AiProviderId = "openai" | "anthropic" | "gemini";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiCompletionParams = {
  system: string;
  messages: ChatMessage[];
  model?: string;
};

export type AiCompletionResult = {
  text: string;
};

export interface AiProvider {
  readonly id: AiProviderId;
  complete(params: AiCompletionParams): Promise<AiCompletionResult>;
}
