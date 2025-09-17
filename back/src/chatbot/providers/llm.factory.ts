import { Injectable } from '@nestjs/common';
import { LLMProvider } from './llm.provider';
import { MockProvider } from './vendors/mock.provider';

@Injectable()
export class LLMFactory {
  build(): LLMProvider {
    // En versión simple siempre mock.
    return new MockProvider();
  }
}