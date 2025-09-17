export type LLMChunkHandler = (chunk: string) => void;

export interface LLMProvider {
  complete(messages: { role: string; content: string }[]): Promise<string>;
  stream(messages: { role: string; content: string }[], onChunk: LLMChunkHandler): Promise<void>;
}