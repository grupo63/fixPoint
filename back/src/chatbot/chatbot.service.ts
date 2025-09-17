import { Injectable } from '@nestjs/common';
import { LLMFactory } from './providers/llm.factory';
import { MessageDto } from './dto/message.dto';
import { FAQ_DATA } from './faq/faq.data';

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\sáéíóúüñ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccard(a: string, b: string): number {
  const A = new Set(normalize(a).split(' '));
  const B = new Set(normalize(b).split(' '));
  const inter = new Set([...A].filter(x => B.has(x)));
  const union = new Set([...A, ...B]);
  return inter.size / Math.max(1, union.size);
}

@Injectable()
export class ChatbotService {
  constructor(private readonly llmFactory: LLMFactory) {}

  private matchFAQ(userText: string) {
    let best = { score: 0, item: null as null | (typeof FAQ_DATA)[number] };
    for (const item of FAQ_DATA) {
      const base = jaccard(userText, item.q);
      const tagBoost = (item.tags ?? []).reduce((acc, t) => Math.max(acc, jaccard(userText, t)), 0);
      const score = base * 0.8 + tagBoost * 0.2;
      if (score > best.score) best = { score, item };
    }
    return best.score >= 0.35 ? best.item : null; // ajusta umbral si quieres
  }

  async answer(messages: MessageDto[]): Promise<{ reply: string; source: 'faq' | 'llm' }> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    const faq = this.matchFAQ(lastUser);
    if (faq) return { reply: faq.a, source: 'faq' };

    const llm = this.llmFactory.build();
    const reply = await llm.complete(messages);
    return { reply, source: 'llm' };
  }

  async answerStream(messages: MessageDto[], onChunk: (c: string) => void): Promise<{ source: 'faq' | 'llm' }> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    const faq = this.matchFAQ(lastUser);
    if (faq) {
      for (const ch of faq.a) {
        await new Promise(r => setTimeout(r, 1));
        onChunk(ch);
      }
      return { source: 'faq' };
    }
    const llm = this.llmFactory.build();
    await llm.stream(messages, onChunk);
    return { source: 'llm' };
  }
}