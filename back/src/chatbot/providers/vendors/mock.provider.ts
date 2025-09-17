import { LLMProvider } from '../llm.provider';

export class MockProvider implements LLMProvider {
  async complete(messages: { role: string; content: string }[]): Promise<string> {
    const last = messages[messages.length - 1]?.content ?? '';
    return `Echo (mock): ${last}`;
  }

  async stream(messages: { role: string; content: string }[], onChunk: (c: string) => void): Promise<void> {
    const text = await this.complete(messages);
    for (const ch of text) {
      await new Promise(r => setTimeout(r, 2));
      onChunk(ch);
    }
  }
}