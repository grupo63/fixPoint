import { Injectable } from '@nestjs/common';
import { FAQ_DATA, FAQEntry } from './faq/faq.data';

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// Auto-detección muy simple (heurística)
function detectLang(q: string): 'es' | 'en' {
  const n = normalize(q);
  const hitsEs = ['que','cómo','como','dónde','donde','política','perfil','reserva','plomeria','cerrajer','electricidad','pintura']
    .filter(w => n.includes(w)).length;
  const hitsEn = ['what','how','where','policy','profile','booking','plumbing','locksmith','electrical','painting']
    .filter(w => n.includes(w)).length;
  return hitsEs >= hitsEn ? 'es' : 'en';
}

@Injectable()
export class ChatbotService {
  private readonly data: FAQEntry[] = FAQ_DATA;

  // 👉 faltaba este método
  list(lang?: 'es' | 'en') {
    if (!lang) return this.data;
    // salida plana por idioma para el front
    return this.data.map(e => ({
      id: e.id,
      category: e.category,
      tags: e.tags,
      q: e.i18n[lang].q,
      a: e.i18n[lang].a,
    }));
  }

  ask(message: string, lang: 'auto' | 'es' | 'en' = 'auto') {
    const targetLang: 'es' | 'en' = lang === 'auto' ? detectLang(message) : lang;
    const nQ = normalize(message);

    const stripPunct = (s: string) =>
      normalize(s).replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    const words = (s: string) =>
      stripPunct(s).split(/\s+/).filter(Boolean);

    const qWords = new Set(words(message));
    const candidates = this.data;

    // 1) Exact match (pregunta)
    let best = candidates.find(
      f => stripPunct(f.i18n[targetLang].q) === stripPunct(message),
    );
    if (best) return pack(best);

    // 2) Substring sobre la pregunta (no answer)
    best = candidates.find(f =>
      normalize(f.i18n[targetLang].q).includes(nQ),
    );
    if (best) return pack(best);

    // 3) Overlap de tags
    const byTag = candidates
      .map(f => {
        const overlap = f.tags.reduce(
          (acc, t) => acc + (qWords.has(normalize(t)) ? 1 : 0),
          0,
        );
        return { f, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap);
    if (byTag[0]?.overlap > 0) return pack(byTag[0].f);

    // 4) Scoring por palabras contra PREGUNTA + tags (no incluir answer)
    let maxScore = 0;
    let scored: FAQEntry | undefined;
    for (const f of candidates) {
      const hay = new Set(words(f.i18n[targetLang].q + ' ' + f.tags.join(' ')));
      let s = 0;
      qWords.forEach(w => { if (hay.has(w)) s++; });
      if (s > maxScore) { maxScore = s; scored = f; }
    }
    if (maxScore > 0 && scored) return pack(scored);

    // 5) Fallback
    return {
      answer:
        targetLang === 'es'
          ? 'Lo siento, aún no tengo una respuesta para eso.'
          : "Sorry, I don't have an answer for that yet.",
      matchedQuestion: null,
      lang: targetLang,
      confidence: 0.2,
      related: [],
    };

    // helper: empaquetar con sugerencias
    function pack(chosen: FAQEntry) {
      const related = candidates
        .filter(
          f =>
            f.id !== chosen.id &&
            (f.category === chosen.category ||
              f.tags.some(t => chosen.tags.includes(t))),
        )
        .slice(0, 3)
        .map(f => ({ id: f.id, q: f.i18n[targetLang].q }));

      return {
        answer: chosen.i18n[targetLang].a,
        matchedQuestion: chosen.i18n[targetLang].q,
        lang: targetLang,
        confidence: 0.9,
        related,
      };
    }
  }
}