export type LocalizedQA = { q: string; a: string };
export type FAQEntry = {
  id: string;
  tags: string[]; // palabras clave comunes
  category?: string; // opcional (e.g. "booking", "payments")
  i18n: {
    es: LocalizedQA;
    en: LocalizedQA;
  };
};

export const FAQ_DATA: FAQEntry[] = [
  {
    id: 'about.fixpoint',
    category: 'about',
    tags: ['fixpoint', 'what', 'que', 'app', 'servicios', 'services', 'info'],
    i18n: {
      es: {
        q: '¿Qué es FixPoint?',
        a: 'FixPoint conecta clientes con profesionales verificados en servicios para el hogar y oficios (plomería, cerrajería, electricidad, carpintería, pintura, etc.). Verificamos la identidad y reputación de los profesionales, mostramos reseñas reales y facilitamos la comunicación y la reserva desde un solo lugar. Consejo: crea tu perfil y activa la ubicación para ver resultados relevantes.',
      },
      en: {
        q: 'What is FixPoint?',
        a: 'FixPoint connects customers with vetted home-service professionals (plumbing, locksmithing, electrical, carpentry, painting, and more). We verify professional identity and reputation, surface real reviews, and make booking & messaging easy in one place. Tip: complete your profile and enable location for better results.',
      },
    },
  },
  {
    id: 'hire.plumber.nearby',
    category: 'booking',
    tags: [
      'plomeria',
      'plumbing',
      'near',
      'cerca',
      'hire',
      'contratar',
      'quote',
      'cotizacion',
    ],
    i18n: {
      es: {
        q: '¿Cómo contrato un profesional cerca de mí?',
        a: 'En la app, busca por categoria, por ejemplo “Plomería” y solicita una cotización. El profesional te confirmará precio y horario. Sugerencia: describe el problema, sube fotos y elige 2–3 franjas horarias posibles para acelerar la confirmación.',
      },
      en: {
        q: 'How do I hire a professional near me?',
        a: 'In the app, search the category you are looking for, like “Plumbing” and request a quote. The professional will confirm price and time. Pro tip: describe your issue, add photos, and propose 2–3 time windows to speed up confirmation.',
      },
    },
  },
  {
    id: 'categories.available',
    category: 'catalog',
    tags: [
      'categorias',
      'categories',
      'services',
      'servicios',
      'available',
      'disponibles',
      'coverage',
    ],
    i18n: {
      es: {
        q: '¿Qué categorías están disponibles?',
        a: 'Ejemplos: Plomería, Cerrajería, Electricidad, Carpintería, Pintura y más. La disponibilidad puede variar según tu ciudad. Revisa “Explorar” para ver categorías activas cerca de ti.',
      },
      en: {
        q: 'What categories are available?',
        a: 'Examples include Plumbing, Locksmith, Electrical, Carpentry, Painting, and more. Availability can vary by city. Check “Browse” to see categories active near you.',
      },
    },
  },
  {
    id: 'pro.signup',
    category: 'professionals',
    tags: ['register', 'registro', 'verificacion', 'verification', 'profile'],
    i18n: {
      es: {
        q: '¿Cómo registro mi perfil como profesional?',
        a: 'Crea una cuenta, completa tu perfil (especialidades, zona, fotos de trabajos) y sube la documentación requerida. Nuestro equipo revisa la información (generalmente en 24–72 h). Consejo: agrega fotos nítidas y una descripción clara de tus servicios para mejorar tu posicionamiento.',
      },
      en: {
        q: 'How do I register as a professional?',
        a: 'Create an account, complete your profile (specialties, service area, job photos), and upload the required documents. Our team reviews submissions (typically 24–72h). Tip: add clear photos and a concise service description to improve ranking.',
      },
    },
  },
  {
    id: 'payments.methods',
    category: 'payments',
    tags: ['pago', 'pagos', 'payments', 'cards', 'tarjeta', 'metodos'],
    i18n: {
      es: {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjeta y otros métodos locales según tu país. El pago puede procesarse en la app o directamente con el profesional (según la categoría). Verifica las opciones al confirmar tu reserva.',
      },
      en: {
        q: 'What payment methods are accepted?',
        a: 'We accept cards and local methods depending on your country. Payments may be processed in-app or directly with the pro (category-dependent). Check options when confirming your booking.',
      },
    },
  },
  {
    id: 'booking.reschedule.cancel',
    category: 'booking',
    tags: [
      'cancel',
      'reschedule',
      'cambiar',
      'cancelar',
      'reservation',
      'reserva',
      'policy',
      'politica',
    ],
    i18n: {
      es: {
        q: '¿Puedo reprogramar o cancelar una reserva?',
        a: 'Sí. Desde tu perfil puedes reprogramar o cancelar con anticipación. Las condiciones (penalizaciones o reembolsos) dependen del estado de la reserva y las políticas locales. Recomendación: verifica siempre los tiempos límite en el resumen de la reserva.',
      },
      en: {
        q: 'Can I reschedule or cancel a booking?',
        a: 'Yes. You can reschedule or cancel in advance from your profile. Fees or refunds depend on booking status and local policies. Tip: always check time limits in your booking summary.',
      },
    },
  },
  {
    id: 'safety.verification',
    category: 'safety',
    tags: [
      'seguridad',
      'safety',
      'verificado',
      'verified',
      'background',
      'identidad',
      'identity',
    ],
    i18n: {
      es: {
        q: '¿Cómo garantizan la seguridad y verificación?',
        a: 'Validamos identidad, datos de contacto y señales de reputación (reseñas verificadas y actividad en la plataforma). Además, promovemos el pago seguro y la mensajería en la app. Reporta cualquier incidente desde la sección de ayuda.',
      },
      en: {
        q: 'How do you ensure safety and verification?',
        a: 'We validate identity, contact info, and reputation signals (verified reviews, platform activity). We also encourage secure payments and in-app messaging. Report incidents via the Help section.',
      },
    },
  },
  {
    id: 'profiles.reviews.ratings',
    category: 'trust',
    tags: [
      'reviews',
      'reseñas',
      'calificaciones',
      'ratings',
      'perfil',
      'profile',
    ],
    i18n: {
      es: {
        q: '¿Cómo funcionan las reseñas y calificaciones?',
        a: 'Solo los clientes que completaron un servicio pueden calificar y dejar reseñas. Esto ayuda a mantener la confianza y calidad en la comunidad. Consejo: lee reseñas recientes y mira fotos del portafolio antes de contratar.',
      },
      en: {
        q: 'How do reviews and ratings work?',
        a: 'Only customers who completed a service can rate and review. This keeps quality and trust high. Tip: read recent reviews and check portfolio photos before hiring.',
      },
    },
  },
  {
    id: 'coverage.locations',
    category: 'coverage',
    tags: [
      'ciudades',
      'cities',
      'coverage',
      'disponibilidad',
      'donde',
      'where',
    ],
    i18n: {
      es: {
        q: '¿En qué ciudades opera FixPoint?',
        a: 'La cobertura crece continuamente. Abre la app, activa la ubicación o busca por ciudad para ver disponibilidad actual y profesionales cercanos.',
      },
      en: {
        q: 'Which cities does FixPoint cover?',
        a: 'Coverage is expanding. Open the app, enable location or search by city to see current availability and nearby professionals.',
      },
    },
  },
  {
    id: 'support.contact',
    category: 'support',
    tags: ['soporte', 'support', 'ayuda', 'contacto', 'help', 'report'],
    i18n: {
      es: {
        q: '¿Cómo contacto soporte?',
        a: 'Desde la app, ve a “Ayuda y Soporte” para chatear con nuestro equipo o reportar un problema. Incluye capturas o el ID de la reserva para una atención más rápida.',
      },
      en: {
        q: 'How can I contact support?',
        a: 'In the app, go to “Help & Support” to chat with our team or file a report. Include screenshots or your booking ID for faster assistance.',
      },
    },
  },
];
