import type { ProjectEntry } from './types'
import { projectList, type ProjectListing } from './projects.config.ts'

/**
 * FICHAS DE LOS PROYECTOS
 *
 * **Aquí está el contenido; qué se publica y en qué orden lo decide
 * `content/projects.config.ts`.** Una ficha que no esté en esa lista no sale en la web, y
 * eso es lo que permite añadir o retirar un proyecto tocando un título en un sitio.
 *
 * Los `highlights` son decisiones técnicas comprobables en el código, no adjetivos: es la
 * diferencia entre un portfolio que se lee y uno que se cree. Las `note` son el matiz
 * honesto —dominio pendiente, datos de ejemplo, repositorio privado—: es la sección que hace
 * que el resto se crea.
 *
 * El `name` de la ficha tiene que ser **exactamente** el título de la lista: es la clave que
 * une las dos. El `slug` es otra cosa y no se toca a la ligera: es la URL de la ficha y el
 * nombre del fichero de la captura, y también el `_id` del documento en Sanity (ver
 * `scripts/build-sanity-import.mjs`).
 *
 * `import './projects.config.ts'` **con la extensión escrita**, y no es un descuido: los
 * scripts de `scripts/` importan este fichero con el despojado de tipos de Node, que no
 * resuelve especificadores sin extensión. Por eso `tsconfig.json` lleva
 * `allowImportingTsExtensions`.
 *
 * Quedan fuera a propósito los directorios de `C:\Proyectos` que no son proyectos:
 * `manfisa-claude` y `sangil-claude` son worktrees de git del mismo repo, `manfisa-imagenes`
 * es material gráfico, y `Porfolio` es el portfolio anterior en Astro al que esta web
 * sustituye. Manfisa sí es un proyecto y sí tiene repositorio, pero está retirado de la web
 * por decisión propia: ver `projects.config.ts`.
 */

/** Una ficha es un proyecto **menos** su sitio en la web, que lo decide la lista. */
type ProjectSheet = Omit<ProjectEntry, 'featured'>

const sheets: ProjectSheet[] = [
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
        es: 'Primera pantalla de Swiftmet: el titular «Hilo de aluminio de alta pureza, bobinado sin empalmes en catorce formatos» sobre un vídeo oscuro de bobinas, con la línea «Palwal, Haryana — para transformadores de film y fabricantes de condensadores» debajo.',
        en: 'Swiftmet first screen: the headline about high-purity aluminium wire jointlessly wound in fourteen formats over a dark video of spools, with the line «Palwal, Haryana — for film converters and capacitor manufacturers» below.',
      },
    },
  },
  {
    slug: 'mila-barber',
    name: 'Mila Barber',
    tagline: {
      es: 'Web y sistema de reserva de citas para una barbería de Pamplona',
      en: 'Site and appointment booking system for a barber shop in Pamplona',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de Mila Barber, barbería del barrio de la Milagrosa (Pamplona). La parte pública es nueva y el área privada —cuentas, reserva de citas y agenda del local— rehace lo que ya existía en la aplicación anterior de la barbería.',
        'Dos clases de datos conviven en el mismo sitio sin mezclarse: el contenido (fotos, servicios, precios y avisos) vive en Sanity y lo edita el propio barbero en /admin; las personas (cuentas y citas) viven en MongoDB y no pasan por el CMS ni se editan a mano.',
      ],
      en: [
        'Site for Mila Barber, a barber shop in the Milagrosa district of Pamplona. The public side is new; the private area — accounts, appointment booking and the shop\u2019s diary — rebuilds what the previous application already did.',
        'Two kinds of data live in the same place without mixing: content (photos, services, prices, notices) lives in Sanity and the barber edits it at /admin; people (accounts and appointments) live in MongoDB, never touching the CMS.',
      ],
    },
    highlights: [
      {
        es: 'Una cita es una foto del momento en que se reservó: el nombre del servicio, su precio y su duración se copian dentro del documento, así que subir el corte de 14 a 16 € no reescribe lo que se cobró la semana pasada ni descuadra la agenda de aquel jueves.',
        en: 'An appointment is a snapshot of the moment it was booked: the service name, price and duration are copied into the document, so raising a haircut from €14 to €16 never rewrites what was charged last week nor shifts that day\u2019s diary.',
      },
      {
        es: 'Reservar ocurre dentro de una transacción: entre comprobar que el hueco está libre y escribir la cita cabe otra reserva, y el día que pasa deja a dos personas en la puerta a la misma hora.',
        en: 'Booking happens inside a transaction: another booking fits between checking the slot is free and writing the appointment, and the day it happens two people turn up for the same time.',
      },
      {
        es: 'Tres papeles (cliente, staff y administrador) que se dan a mano por consola: que registrarse el primero dé el mando es un agujero clásico en cuanto la web es pública.',
        en: 'Three roles (client, staff, admin) granted by hand from the console: letting whoever registers first take control is a classic hole the moment a site goes public.',
      },
      {
        es: 'La zona horaria la fija el arranque del servidor y no una variable de entorno, porque TZ está reservada en Vercel: en UTC, en verano la agenda se desplazaría dos horas y la barbería perdería los dos últimos huecos de la tarde.',
        en: 'The time zone is set when the server boots rather than by an environment variable, because TZ is reserved on Vercel: running in UTC would shift the summer diary by two hours and lose the last two slots of the day.',
      },
    ],
    stack: [
      'Next.js 16',
      'TypeScript',
      'Tailwind CSS 4',
      'Sanity',
      'MongoDB',
      'Auth.js',
      'bcrypt',
      'Nodemailer',
      'Vercel',
    ],
    liveUrl: 'https://milabarber.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/MilaBarber',
    image: {
      src: '/projects/mila-barber.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de Mila Barber: el rótulo «MILA BARBER» en negro y dorado con el lema «Tu estilo, nuestra pasión», los botones «Reservar cita» y «Ver servicios y precios», y el horario con la dirección de la barbería debajo.',
        en: 'Mila Barber first screen: the «MILA BARBER» wordmark in black and gold with the «your style, our passion» line, the «book an appointment» and «services and prices» buttons, and the opening hours and address below.',
      },
    },
    note: {
      es: 'El dominio anterior de la barbería sigue apuntando a la aplicación vieja: migrarlo es decisión del cliente. La portada se sirve todavía sin el montaje de vídeo.',
      en: 'The shop\u2019s previous domain still points at the old application: migrating it is the client\u2019s call. The homepage is still served without the video montage.',
    },
  },
  {
    slug: 'cedece',
    name: 'Cedecé',
    tagline: {
      es: 'Web de un rapero de Vigo: el catálogo, el directo y el material de sus redes',
      en: 'Site for a rapper from Vigo: the catalogue, the live history and the material from his own channels',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de Cedecé, rapero de Vigo en activo desde 2008, autor de «Hipersensible» y de la serie de temas «Quemaduras». Tiene dos lectores con dos prisas distintas: quien entra a ver quién es y acaba escuchando, y el programador de una sala que busca un dato concreto para decidir si le da una fecha.',
        'El contenido no está escrito: está extraído de las propias redes del artista y contrastado entre ellas. Ese trabajo marcó el resultado más que ninguna decisión de código — la cuenta está parada desde 2024, así que no hay fechas futuras que anunciar y la web tuvo que resolver qué hacer con ese vacío.',
      ],
      en: [
        'Site for Cedecé, a rapper from Vigo active since 2008, author of «Hipersensible» and the «Quemaduras» series of tracks. It has two readers in two different hurries: someone finding out who he is and ending up listening, and a venue booker after one specific fact before offering a date.',
        'The content is not written but extracted from the artist\u2019s own channels and cross-checked between them. That shaped the result more than any code decision — the account has been idle since 2024, so there are no upcoming dates to announce and the site had to decide what to do with that gap.',
      ],
    },
    highlights: [
      {
        es: 'La sección de directo enseña el vacío en vez de esconderlo: no hay fechas futuras, y ocultar la sección se llevaría por delante el historial de conciertos, que es justo el argumento ante una sala.',
        en: 'The live section shows the gap instead of hiding it: there are no upcoming dates, and hiding the section would take the gig history with it — which is exactly the argument a venue wants to see.',
      },
      {
        es: 'Lo que se sabe a medias se marca, no se completa: de siete de los ocho conciertos documentados no consta el día, así que la fecha lleva su precisión (día, mes o año) como dato del contenido.',
        en: 'What is only half known is flagged, not filled in: seven of the eight documented gigs have no known day, so each date carries its own precision (day, month or year) as content.',
      },
      {
        es: 'Trilingüe español, inglés y gallego, con el gallego por el sitio donde toca y no por completar la terna.',
        en: 'Trilingual Spanish, English and Galician — Galician because of where he plays, not to round out the set.',
      },
      {
        es: 'Diez vídeos viajan en el repositorio, el de la portada a resolución nativa y el resto reducidos por un script con ffmpeg; los anchos de imagen no se escriben a mano en ningún componente, se leen de un índice generado al procesar el material.',
        en: 'Ten videos ship inside the repository, the homepage one at native resolution and the rest downscaled by an ffmpeg script; image widths are never hand-written in a component, they are read from an index generated while processing the material.',
      },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'zod', 'ffmpeg', 'Vercel'],
    liveUrl: 'https://cedece.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Cedece',
    image: {
      src: '/projects/cedece.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de Cedecé: el nombre en letras enormes sobre una fotografía en blanco y negro del artista con el micrófono en la calle, la frase «Rap de Vigo. Letras que cuentan algo y directos en acústico» y los botones de Spotify y YouTube.',
        en: 'Cedecé first screen: the name in huge type over a black-and-white photograph of the artist with a microphone in the street, the line «Rap from Vigo. Lyrics that say something and acoustic gigs», and the Spotify and YouTube buttons.',
      },
    },
    note: {
      es: 'El logotipo es una reconstrucción provisional a la espera del original, y el panel de edición está montado pero todavía sin proyecto de Sanity enchufado: la web sirve el contenido del repositorio, que es lo que la arquitectura contempla.',
      en: 'The logotype is a provisional reconstruction pending the original, and the editing panel is built but not yet wired to a Sanity project: the site serves the repository content, exactly as the architecture allows.',
    },
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
        'Web de portfolio para Sangil Studio, estudio de arquitectura en Pamplona. Es el proyecto del que salió la metodología que después reutilicé en el resto: modelo de ramas por entorno, contenido en Sanity y una arquitectura estática con revalidación por webhook.',
        'En una web de arquitectura la tipografía y el aire son el 90 % del trabajo: cualquier elemento de interfaz que compita con una fotografía de obra está de más.',
      ],
      en: [
        'Portfolio site for Sangil Studio, an architecture practice in Pamplona. This is the project the methodology came from, later reused across the rest: one branch per environment, content in Sanity, and a static architecture with webhook revalidation.',
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
    liveUrl: 'https://sangilstudio.com',
    repoUrl: 'https://github.com/luisfdzs/sangilstudio',
    image: {
      src: '/projects/sangil-studio.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de Sangil Studio: fotografía a sangre del pórtico de hormigón de una promoción de vivienda social en Pamplona, con el titular en serif «Arquitectura con una razón detrás de cada decisión» y el pie de obra debajo.',
        en: 'Sangil Studio first screen: a full-bleed photograph of the concrete portico of a social housing development in Pamplona, with the serif headline «Architecture with a reason behind every decision» and the project caption below.',
      },
    },
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
        es: 'Primera pantalla de Bonsái Artesanía: sobre fondo crema, el titular en serif «Flores que no se marchitan» a la izquierda y, dentro de un arco, la fotografía de dos pendientes de resina con pétalos naranjas colgando de una rama.',
        en: 'Bonsái Artesanía first screen: on a cream background, the serif headline «Flowers that never wilt» on the left and, inside an arch, a photograph of two resin earrings with orange petals hanging from a branch.',
      },
    },
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
    image: {
      src: '/projects/blablatour.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'BlaBlaTour en un navegador de escritorio: la interfaz se mantiene en una columna estrecha centrada, con el panel verde «Comparte coche hasta tu próxima ruta», el buscador «¿A qué monte quieres ir?», los filtros por actividad y las próximas salidas.',
        en: 'BlaBlaTour in a desktop browser: the interface stays in a narrow centred column, with the green «share a car to your next route» panel, the “which mountain are you heading to?” search box, the activity filters and the upcoming trips.',
      },
    },
    note: {
      es: 'Prototipo navegable con datos de ejemplo: las pantallas y el flujo están completos, la persistencia real está aislada y pendiente de conectar. El repositorio es privado, así que aquí sólo hay enlace a la web.',
      en: 'Working prototype with sample data: the screens and flow are complete, real persistence is isolated and pending connection. The repository is private, so only the live link is offered here.',
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
    repoUrl: 'https://github.com/luisfdzs/SanFermin',
    image: {
      src: '/projects/almuerziko-san-fermin.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla del Almuerziko: cartel rojo con el título «Almuerziko de San Fermín, edición 2026», la fecha «lunes 6 de julio a las 10:00», la cuenta atrás a ceros y el arranque del bloque «¿Te vienes?» abajo.',
        en: 'Almuerziko first screen: a red poster with the «Almuerziko de San Fermín, 2026 edition» title, the «Monday 6 July at 10:00» date, the countdown at zeros and the start of the RSVP block below.',
      },
    },
  },
  {
    slug: 'portfolio',
    name: 'Portfolio',
    tagline: {
      es: 'Esta misma web: CV, portfolio y carta de presentación en un sitio',
      en: 'This very site: CV, portfolio and cover letter in one place',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Idea, diseño, desarrollo y despliegue',
      en: 'Concept, design, development and deployment',
    },
    summary: {
      es: [
        'La web que estás leyendo. Sustituye a un portfolio anterior en Astro cuyos datos se habían quedado atrás —decía «+4 años de experiencia» cuando ya eran cinco—, y de ese fallo sale su decisión central.',
        'Ninguna cifra del CV está escrita a mano: los años de experiencia, los proyectos en producción, las empresas y las tecnologías se calculan del contenido, así que no pueden envejecer mal. Es también el proyecto del que salen el stack y la metodología de los últimos de esta lista.',
      ],
      en: [
        'The site you are reading. It replaces an earlier Astro portfolio whose data had fallen behind — it claimed «4+ years of experience» when it was already five — and that failure is where its central decision comes from.',
        'Not a single figure in the CV is hand-written: years of experience, projects in production, companies and technologies are all computed from the content, so they cannot age badly. It is also the project the stack and methodology of the latest ones here come from.',
      ],
    },
    highlights: [
      {
        es: 'Contenido de doble fuente: el repositorio es el suelo y el panel de Sanity manda cuando tiene documentos, así que la web se clona y se despliega sin credenciales de nada y el CV sale completo. Un portfolio es el sitio donde uno no quiere depender de un servicio externo para existir.',
        en: 'Two content sources with one rule: the repository is the floor and the Sanity panel wins when it has documents, so the site can be cloned and deployed with no credentials at all and the CV still comes out complete. A portfolio is the last place to depend on an external service to exist.',
      },
      {
        es: 'Los dos fondos están dibujados con código: un mosaico cinético en la primera pantalla y, en el resto del sitio, una retícula de hasta tres mil nodos en un canvas que se aparta y se enciende bajo el puntero. Sin una sola dependencia añadida.',
        en: 'Both backgrounds are drawn in code: a kinetic mosaic on the first screen and, everywhere else, a grid of up to three thousand nodes on a canvas that parts and lights up under the pointer. Without a single added dependency.',
      },
      {
        es: 'Los proyectos giran en un carrusel «cover flow» dirigido por el scroll con CSS (`animation-timeline`), sin JavaScript salvo los dos botones, y en papel se deshace en una retícula de dos columnas.',
        en: 'The projects turn in a «cover flow» carousel driven by scroll in pure CSS (`animation-timeline`), with no JavaScript beyond the two buttons, and it unfolds into a two-column grid in print.',
      },
      {
        es: 'La verificación en móvil es parte del trabajo, no una revisión a ojo: 21 comprobaciones en un Chrome real a 390×844 y por idioma, incluidos desbordamiento horizontal, áreas pulsables de 24 px y que las dos navegaciones no compartan nombre accesible.',
        en: 'Mobile verification is part of the work rather than an eyeball check: 21 assertions in a real Chrome at 390×844 per language, covering horizontal overflow, 24 px touch targets and the two navigations not sharing an accessible name.',
      },
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'zod', 'Playwright', 'Vercel'],
    liveUrl: 'https://luisfernandezsangil.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Portfolio',
    image: {
      src: '/projects/portfolio.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de esta web: «Hola, soy Luis Fernández Sangil · Ingeniero industrial y desarrollador web» sobre el mosaico cinético de fotografías de código y equipos, con el rótulo del puesto actual, la ubicación y los botones «Ver proyectos» y «Hablemos».',
        en: 'This site\u2019s first screen: \u00abHi, I am Luis Fern\u00e1ndez Sangil \u00b7 Industrial engineer and web developer\u00bb over the kinetic mosaic of code and hardware photographs, with the current-role chip, the location and the \u00absee projects\u00bb and \u00ablet\u2019s talk\u00bb buttons.',
      },
    },
  },
]

/** El título y las banderas de una entrada de la lista, venga como cadena o como objeto. */
function listing(entry: ProjectListing): { title: string; featured: boolean } {
  return typeof entry === 'string'
    ? { title: entry, featured: false }
    : { title: entry.title, featured: Boolean(entry.featured) }
}

const byName = new Map(sheets.map((sheet) => [sheet.name, sheet]))

/**
 * Los proyectos publicados: la lista de `projects.config.ts` resuelta contra las fichas de
 * arriba, en el orden de la lista.
 *
 * Un título sin ficha **no se publica** y deja un aviso con su nombre. El aviso importa tanto
 * como el descarte: sin él, quien añade un título y no ve nada en la web supone que el fichero
 * de configuración no funciona.
 */
export const projects: ProjectEntry[] = projectList.flatMap((entry) => {
  const { title, featured } = listing(entry)
  const sheet = byName.get(title)

  if (!sheet) {
    console.warn(
      `[proyectos] «${title}» está en content/projects.config.ts pero no tiene ficha: ` +
        'escríbela en content/projects.ts con ese mismo `name` y genera su captura con ' +
        '`npm run shots -- <slug>`. Hasta entonces no se publica.',
    )
    return []
  }

  return [{ ...sheet, featured }]
})
