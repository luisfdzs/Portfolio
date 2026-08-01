import type { ProjectEntry } from './types'

/**
 * PROYECTOS PROPIOS
 *
 * Todos existen en `C:\Proyectos`, todos están desplegados y todos tienen su repositorio
 * público en github.com/luisfdzs. Los `highlights` son decisiones técnicas comprobables
 * en el código, no adjetivos: es la diferencia entre un portfolio que se lee y uno que
 * se cree.
 *
 * Orden: por lo que mejor representa el trabajo, no por fecha. Los cuatro primeros
 * (`featured`) son los que salen en la portada; el resto viven en `/projects`.
 *
 * Quedan fuera a propósito los directorios de `C:\Proyectos` que no son proyectos:
 * `Swiftmet-worktrees`, `manfisa-claude`, `sangil-claude` y `sangilstudio-urls` son
 * worktrees de git del mismo repo, `manfisa-imagenes` es material gráfico, y `Porfolio`
 * es el portfolio anterior en Astro al que esta web sustituye.
 */
export const projects: ProjectEntry[] = [
  {
    slug: 'swiftmet',
    name: 'Swiftmet',
    tagline: {
      es: 'Catálogo técnico trilingüe para un fabricante indio de hilo de aluminio',
      en: 'Trilingual technical catalogue for an Indian aluminium wire manufacturer',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de catálogo para Swiftmet Wire & Resin, fabricante de hilo y varilla de aluminio de alta pureza para metalizado al vacío, con planta en Haryana (India). Se construyó como competidor directo del referente del sector.',
        'La tesis del proyecto es de negocio antes que técnica: la competencia despacha el embalaje con media frase, y Swiftmet tenía catorce formatos de bobina medidos —con las cinco cotas que deciden si la bobina entra en la metalizadora del cliente— sin publicar. Toda la arquitectura de la web existe para poner esa tabla en el centro.',
      ],
      en: [
        'Catalogue site for Swiftmet Wire & Resin, a manufacturer of high-purity aluminium wire and rod for vacuum metallising, with a plant in Haryana, India. Built as a direct competitor to the sector benchmark.',
        'The premise is commercial before it is technical: competitors dismiss packaging in half a sentence, while Swiftmet had fourteen measured spool formats — with the five dimensions that decide whether a spool fits the customer\u2019s metalliser — sitting unpublished. The whole architecture exists to put that table at the centre.',
      ],
    },
    highlights: [
      {
        es: 'Trilingüe (inglés, hindi y español) con negociación de idioma en el borde: 50 rutas prerrenderizadas y sólo dos funciones en servidor.',
        en: 'Trilingual (English, Hindi, Spanish) with locale negotiation at the edge: 50 prerendered routes and only two server functions.',
      },
      {
        es: 'Panel de Sanity dentro de la propia web, en /admin: publicar una bobina nueva actualiza la tabla en 9 segundos sin desplegar, vía webhook de revalidación por etiquetas.',
        en: 'Sanity Studio served inside the site at /admin: publishing a new spool updates the table in 9 seconds without a deploy, through a tag-based revalidation webhook.',
      },
      {
        es: 'Las bobinas no llevan foto: se dibujan en SVG a escala desde sus propias cotas, así que el plano nunca puede contradecir la ficha.',
        en: 'Spools carry no photograph: they are drawn to scale in SVG from their own dimensions, so the diagram can never contradict the spec.',
      },
      {
        es: 'Contenido validado con zod documento a documento: una ficha incompleta se descarta con un aviso en el build en vez de tumbar la web.',
        en: 'Content validated with zod document by document: an incomplete entry is dropped with a build warning instead of taking the site down.',
      },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'zod', 'Vercel', 'Playwright'],
    liveUrl: 'https://swiftmet.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Swiftmet',
    image: {
      src: '/projects/swiftmet.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Portada de Swiftmet: el titular «Hilo de aluminio de alta pureza, bobinado sin empalmes en catorce formatos» sobre el montaje de vídeo, con las cuatro cifras del producto debajo.',
        en: 'Swiftmet homepage: the headline about high-purity aluminium wire jointlessly wound in fourteen formats over the video montage, with the four product figures below.',
      },
    },
    featured: true,
  },
  {
    slug: 'manfisa',
    name: 'Manfisa',
    tagline: {
      es: 'Web corporativa trilingüe para un trefilador navarro con medio siglo de historia',
      en: 'Trilingual corporate site for a Navarrese wire drawer with half a century of history',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de Manfisa (Manfisa Wire / Manufacturas Irular), fabricante de hilo de aluminio trefilado en Irurtzun, Navarra, desde 1973: metalización, soldadura, aplicaciones mecánicas, fundición y aplicaciones eléctricas.',
        'El reto aquí no era enseñar un producto, sino cinco líneas de negocio distintas sin que la web se convierta en un índice: cada aplicación del hilo tiene un comprador diferente y ninguno quiere leer las de los otros cuatro.',
      ],
      en: [
        'Site for Manfisa (Manfisa Wire / Manufacturas Irular), a drawn aluminium wire manufacturer in Irurtzun, Navarre, since 1973: metallising, welding, mechanical applications, casting and electrical applications.',
        'The challenge was not showcasing one product but five distinct business lines without turning the site into an index: each application has a different buyer, and none of them wants to read about the other four.',
      ],
    },
    highlights: [
      {
        es: 'Trilingüe español, inglés y francés — el francés porque el mercado natural de exportación desde Navarra cruza la frontera, no por completar la terna.',
        en: 'Trilingual Spanish, English and French — French because the natural export market from Navarre is across the border, not to round out the set.',
      },
      {
        es: 'Contenido íntegramente editable desde /admin, incluidas las cinco familias de aplicación y sus especificaciones.',
        en: 'Content fully editable from /admin, including the five application families and their specifications.',
      },
      {
        es: 'El contexto del proyecto vive en una rama huérfana de git (`claude`) que se monta como worktree: la documentación de decisiones no ensucia el historial del código.',
        en: 'Project context lives in an orphan git branch (`claude`) mounted as a worktree: the decision log never pollutes the code history.',
      },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'zod', 'Vercel'],
    liveUrl: 'https://manfisa.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Manfisa',
    image: {
      src: '/projects/manfisa.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Portada de Manfisa: el titular «Hilo de aluminio de alta pureza, trefilado en Navarra desde 1973» a la izquierda y un mosaico de fotografías de bobina, lingote y embalaje a la derecha.',
        en: 'Manfisa homepage: the headline about high-purity aluminium wire drawn in Navarre since 1973 on the left, and a mosaic of coil, ingot and packaging photographs on the right.',
      },
    },
    featured: true,
  },
  {
    slug: 'sangil-studio',
    name: 'Sangil Studio',
    tagline: {
      es: 'Portfolio de un estudio de arquitectura, donde la obra manda y la web desaparece',
      en: 'Portfolio for an architecture studio, where the work leads and the site gets out of the way',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de portfolio para Sangil Studio, estudio de arquitectura en Pamplona. Es el proyecto del que salió la metodología que después reutilicé en Manfisa y en Swiftmet: modelo de ramas por entorno, contenido en Sanity y una arquitectura estática con revalidación por webhook.',
        'En una web de arquitectura la tipografía y el aire son el 90 % del trabajo: cualquier elemento de interfaz que compita con una fotografía de obra está de más.',
      ],
      en: [
        'Portfolio site for Sangil Studio, an architecture practice in Pamplona. This is the project the methodology came from, later reused in Manfisa and Swiftmet: one branch per environment, content in Sanity, and a static architecture with webhook revalidation.',
        'On an architecture site, typography and whitespace are 90 % of the work: any interface element competing with a photograph of the built work is one element too many.',
      ],
    },
    highlights: [
      {
        es: 'Orden de los proyectos editable arrastrando en el panel, con lexorank: reordenar veinte obras no reescribe veinte documentos.',
        en: 'Project order editable by drag-and-drop in the panel, using lexorank: reordering twenty works does not rewrite twenty documents.',
      },
      {
        es: 'Las imágenes las sirve y transforma la CDN de Sanity mediante un loader propio de next/image: una foto de obra de 25 MB llega ligera sin que nadie la prepare, y no consume cuota de optimización de Vercel.',
        en: 'Images are served and transformed by Sanity\u2019s CDN through a custom next/image loader: a 25 MB photograph arrives light without anyone preparing it, and it consumes no Vercel optimisation quota.',
      },
      {
        es: 'Dos entornos separados en Vercel (test y producción) con indexación restringida a la rama main, para que la copia de test no compita en Google con el dominio del cliente.',
        en: 'Two separate Vercel environments (test and production) with indexing restricted to the main branch, so the test copy never competes in Google with the client domain.',
      },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'lexorank', 'Vercel'],
    liveUrl: 'https://sangilstudiotest.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/sangilstudio',
    image: {
      src: '/projects/sangil-studio.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Web de Sangil Studio: el rótulo «Obra seleccionada» sobre una fotografía a sangre de un interior oscuro perforado con puntos de luz.',
        en: 'Sangil Studio site: the «Selected work» label above a full-bleed photograph of a dark interior perforated with points of light.',
      },
    },
    note: {
      es: 'El enlace apunta al entorno de test, que es donde está la web terminada: sangilstudio.com sirve todavía la página de «en proceso» hasta que el estudio dé el visto bueno para lanzar.',
      en: 'The link points to the test environment, which is where the finished site lives: sangilstudio.com still serves a holding page until the studio approves the launch.',
    },
    featured: true,
  },
  {
    slug: 'bonsai-artesania',
    name: 'Bonsái Artesanía',
    tagline: {
      es: 'Tienda de joyería artesanal en resina y flor natural',
      en: 'Shop for handmade resin and dried-flower jewellery',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo y despliegue',
      en: 'Design, development and deployment',
    },
    summary: {
      es: [
        'Tienda para una marca de joyería artesanal que vendía únicamente por Instagram. El objetivo era darle un escaparate propio con catálogo, ficha de pieza y pedido, sin la fricción de montar una plataforma de e-commerce completa para un inventario de piezas únicas.',
        'Comparte esqueleto con Sangil Studio pero sin CMS: el catálogo es pequeño y cambia poco, así que el contenido vive en el repositorio y se edita en un fichero. Meter Sanity aquí habría sido añadir una pieza que nadie iba a usar.',
      ],
      en: [
        'Shop for a handmade jewellery brand that sold only through Instagram. The goal was to give it a proper storefront with a catalogue, product pages and ordering, without the friction of a full e-commerce platform for an inventory of one-off pieces.',
        'It shares its skeleton with Sangil Studio but has no CMS: the catalogue is small and changes rarely, so content lives in the repository and is edited in a file. Adding Sanity here would have been adding a piece nobody would use.',
      ],
    },
    highlights: [
      {
        es: 'Sistema de diseño completo en tokens dentro del `@theme` de Tailwind y sólo ahí: no existe forma de usar un color o un espaciado fuera del sistema.',
        en: 'A complete design system in tokens inside Tailwind\u2019s `@theme` and nowhere else: there is no way to use a colour or spacing value outside the system.',
      },
      {
        es: 'Las apariciones al hacer scroll son CSS puro (`animation-timeline: view()`), sin una línea de JavaScript, y respetan `prefers-reduced-motion`.',
        en: 'Scroll reveals are pure CSS (`animation-timeline: view()`), without a line of JavaScript, and respect `prefers-reduced-motion`.',
      },
      {
        es: 'Autenticación con NextAuth sobre MongoDB y avisos de pedido por correo con Nodemailer.',
        en: 'Authentication with NextAuth over MongoDB, and order notifications by email with Nodemailer.',
      },
    ],
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS 4',
      'MongoDB',
      'NextAuth',
      'Nodemailer',
      'Vercel',
    ],
    liveUrl: 'https://bonsaiartesania.com',
    repoUrl: 'https://github.com/luisfdzs/BonsaiArtesania',
    image: {
      src: '/projects/bonsai-artesania.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Web de Bonsái Artesanía: el rótulo «Piezas destacadas» sobre tres fotografías de joyas de resina con flor natural dentro — un colgante naranja, unos pendientes de aro y un anillo.',
        en: 'Bonsái Artesanía site: the «Featured pieces» label above three photographs of resin jewellery with real flowers inside — an orange pendant, hoop earrings and a ring.',
      },
    },
    featured: true,
  },
  {
    slug: 'blablatour',
    name: 'BlaBlaTour',
    tagline: {
      es: 'Coche compartido para llegar al monte: como BlaBlaCar, pero para rutas',
      en: 'Carpooling to the mountains: like BlaBlaCar, but for trailheads',
    },
    year: '2026',
    status: 'prototype',
    role: {
      es: 'Idea, diseño y desarrollo',
      en: 'Concept, design and development',
    },
    summary: {
      es: [
        'Proyecto propio: encontrar gente que va al mismo monte el mismo día y compartir coche, gastos y ruta. Cubre senderismo, ferratas, BTT, trail, escalada y esquí de montaña.',
        'Es el único de la lista que no tiene cliente detrás, y se nota en qué se optimizó: aquí el interés era el modelo de datos y el flujo de reserva, no la venta.',
      ],
      en: [
        'A project of my own: find people heading to the same mountain on the same day and share the car, the cost and the route. Covers hiking, via ferratas, mountain biking, trail running, climbing and ski touring.',
        'It is the only one on the list without a client behind it, and that shows in what was optimised: here the interest was the data model and the booking flow, not the sale.',
      ],
    },
    highlights: [
      {
        es: 'Mobile-first de verdad: el caso de uso es alguien organizando la salida del sábado desde el móvil el jueves por la noche.',
        en: 'Genuinely mobile-first: the use case is somebody organising Saturday\u2019s outing from a phone on Thursday night.',
      },
      {
        es: 'La capa de datos está aislada en un único módulo, así que cambiar los datos de ejemplo por consultas reales a MongoDB no toca ni un componente.',
        en: 'The data layer is isolated in a single module, so swapping sample data for real MongoDB queries touches no component.',
      },
      {
        es: 'Sesiones con JWT firmados (jose) y contraseñas con bcrypt, sin dependencia de un proveedor externo de identidad.',
        en: 'Sessions with signed JWTs (jose) and passwords with bcrypt, with no dependency on an external identity provider.',
      },
    ],
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS 4',
      'MongoDB',
      'Mongoose',
      'jose',
      'bcrypt',
    ],
    liveUrl: 'https://blablatour.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/blablatour',
    image: {
      src: '/projects/blablatour.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'BlaBlaTour en un navegador de escritorio: la interfaz se mantiene en una columna estrecha centrada, con el buscador «¿A qué monte quieres ir?», los filtros por actividad y las próximas salidas.',
        en: 'BlaBlaTour in a desktop browser: the interface stays in a narrow centred column, with the “which mountain are you heading to?” search box, the activity filters and the upcoming trips.',
      },
    },
    note: {
      es: 'Prototipo navegable con datos de ejemplo: las pantallas y el flujo están completos, la persistencia real está aislada y pendiente de conectar.',
      en: 'Working prototype with sample data: the screens and flow are complete, real persistence is isolated and pending connection.',
    },
  },
  {
    slug: 'almuerziko-san-fermin',
    name: 'Almuerziko San Fermín',
    tagline: {
      es: 'Invitación con confirmación de asistencia para el almuerzo del 6 de julio',
      en: 'Invitation with RSVP for the 6th of July lunch',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Idea, diseño y desarrollo',
      en: 'Concept, design and development',
    },
    summary: {
      es: [
        'Invitación de una sola página para el almuerziko de San Fermín, con cuenta atrás al chupinazo, lista de asistentes en vivo y confirmación protegida por la clave de la cuadrilla.',
        'Está aquí por lo que demuestra al revés: no todo pide un framework. Una página, sin build, HTML y CSS a mano, una función serverless para la confirmación y listo. Saber cuándo no montar una torre también es criterio técnico.',
      ],
      en: [
        'A one-page invitation for the San Fermín lunch, with a countdown to the opening rocket, a live guest list, and RSVP protected by the group\u2019s shared key.',
        'It is here for what it proves in reverse: not everything calls for a framework. One page, no build step, hand-written HTML and CSS, one serverless function for the RSVP, done. Knowing when not to build a tower is also engineering judgement.',
      ],
    },
    highlights: [
      {
        es: 'Sin framework y sin paso de build: un único `index.html` con el confeti dibujado en Canvas.',
        en: 'No framework and no build step: a single `index.html` with the confetti drawn on Canvas.',
      },
      {
        es: 'Confirmación de asistencia en una función serverless con el driver oficial de MongoDB, con clave compartida para que no se apunte quien pasaba por ahí.',
        en: 'RSVP in a serverless function using the official MongoDB driver, with a shared key so passers-by cannot sign themselves up.',
      },
      {
        es: 'Todas las animaciones respetan `prefers-reduced-motion`, confeti incluido.',
        en: 'Every animation respects `prefers-reduced-motion`, confetti included.',
      },
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'MongoDB', 'Vercel Functions'],
    liveUrl: 'https://almuerziko.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/almuerziko-sanfermin',
    image: {
      src: '/projects/almuerziko-san-fermin.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Invitación del Almuerziko: cartel rojo y blanco con el título «Almuerziko de San Fermín», la fecha, la cuenta atrás a cero y el bloque «¿Te vienes?» para confirmar asistencia.',
        en: 'Almuerziko invitation: a red and white poster with the “Almuerziko de San Fermín” title, the date, the countdown at zero and the RSVP block below.',
      },
    },
  },
]
