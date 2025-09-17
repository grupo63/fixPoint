export type FAQItem = {
  q: string;
  a: string;
  tags?: string[];
};

export const FAQ_DATA: FAQItem[] = [
  {
    q: '¿Qué es FixPoint?',
    a: 'FixPoint conecta clientes con profesionales verificados (plomería, cerrajería, electricidad, carpintería, pintura, etc.).',
    tags: ['que', 'es', 'fixpoint', 'servicios'],
  },
  {
    q: 'What is FixPoint?',
    a: 'FixPoint connects clients with verified professionals (plumbing, locksmith, electricity, carpentry, painting, etc.).',
    tags: ['what', 'is', 'fixpoint', 'services'],
  },
  {
    q: '¿Cómo contrato un plomero cerca de mí?',
    a: 'En la app, busca “Plomería”, filtra por ubicación y disponibilidad, y solicita una cotización. El profesional te contactará.',
    tags: ['plomeria', 'cerca', 'contratar', 'servicio'],
  },
  {
    q: 'How do I hire a plumber near me?',
    a: 'In the app, search for "Plumbing", filter by location and availability, and request a quote. The professional will contact you.',
    tags: ['plumbing', 'near', 'hire', 'service'],
  },
  {
    q: '¿Qué categorías están disponibles?',
    a: 'Ejemplos: Plomería, Cerrajería, Electricidad, Carpintería, Pintura. (La lista puede variar por ciudad).',
    tags: ['categorias', 'servicios', 'disponibles'],
  },
  {
    q: 'What categories are available?',
    a: 'Examples: Plumbing, Locksmith, Electricity, Carpentry, Painting. (The list may vary by city).',
    tags: ['categories', 'services', 'available'],
  },
  {
    q: '¿Cómo registro mi perfil como profesional?',
    a: 'Crea una cuenta, completa tu perfil, añade especialidades y documentación requerida. Luego espera la verificación.',
    tags: ['profesional', 'registro', 'perfil', 'verificacion'],
  },
  {
    q: 'How do I register as a professional?',
    a: 'Create an account, complete your profile, add your specialties and required documents. Then wait for verification.',
    tags: ['professional', 'register', 'profile', 'verification'],
  },
  {
    q: 'Política de cancelación',
    a: 'Puedes cancelar desde tu perfil con anticipación. Se aplican condiciones según el estado de la reserva y políticas locales.',
    tags: ['cancelacion', 'reserva', 'politica'],
  },
  {
    q: 'Cancellation policy',
    a: 'You can cancel from your profile in advance. Conditions apply depending on the booking status and local policies.',
    tags: ['cancellation', 'booking', 'policy'],
  },
];