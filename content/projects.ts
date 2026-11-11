import type { ProjectEntry } from './types'
import { projectList, type ProjectListing } from './projects.config'

type ProjectSheet = Omit<ProjectEntry, 'featured'>

const sheets: ProjectSheet[] = [
  {
    slug: 'ckm-combat-academy',
    name: 'CKM Combat Academy',
    tagline: {
      es: 'Página web para el gimnasio CKM Combat Academy en Mos, Pontevedra. Toda la información sobre disciplinas y horarios',
      en: 'Website for the CKM Combat Academy gym in Mos, Pontevedra. All the information on disciplines and timetables',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Página Web que posiciona el club CKM Combat Academy en las búsquedas de Google y Maps, y que ofrece toda la información sobre las disciplinas que se practican, el horario, la ubicación, etc. Hasta el nacimiento de esta web, la presencia en internet de este gimnasio se basaba en las redes como Instagram, y ahora ofrece todo ese material desde su propia web, ganando accesibilidad e imagen de marca.',
      ],
      en: [
        'Website that puts CKM Combat Academy on Google Search and Maps, and gives all the information about the disciplines on offer, the timetable, the location and more. Until this site was born, the gym’s online presence relied on social networks such as Instagram; now it offers all that material from its own site, gaining accessibility and brand image.',
      ],
    },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'MongoDB', 'zod', 'Vercel'],
    liveUrl: 'https://ckmcombatacademy.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/ckm-combat-academy',
    image: {
      src: '/projects/ckm-combat-academy.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de CKM Combat Academy: el lema “Todo por la lucha” en letras enormes sobre un fondo negro con un halo rojo, con “Mos · Pontevedra” encima, la frase “El templo de los deportes de contacto” debajo, los botones “Primera clase gratis” y “Ver las clases”, y el horario y la dirección del club al pie.',
        en: 'CKM Combat Academy first screen: the «Todo por la lucha» claim in huge type over a black background with a red glow, with «Mos · Pontevedra» above it, the «temple of contact sports» line below, the «first class free» and «see the classes» buttons, and the club’s opening hours and address at the foot.',
      },
    },
  },
  {
    slug: 'swiftmet',
    name: 'Swiftmet',
    tagline: {
      es: 'Catálogo técnico de bobinas de hilo de aluminio para Dilip Rawat, responsable comercial de Swiftmet, una empresa india',
      en: 'Technical catalogue of aluminium wire spools for Dilip Rawat, sales manager at Swiftmet, an Indian manufacturer',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Web de catálogo para Swiftmet Wire & Resin, fabricante de hilo y varilla de aluminio de alta pureza para metalizado al vacío, con planta en Haryana (India).',
      ],
      en: [
        'Catalogue site for Swiftmet Wire & Resin, a manufacturer of high-purity aluminium wire and rod for vacuum metallising, with a plant in Haryana, India.',
      ],
    },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'zod', 'Vercel', 'Playwright'],
    liveUrl: 'https://swiftmet.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Swiftmet',
    image: {
      src: '/projects/swiftmet.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de Swiftmet: el titular “Hilo de aluminio de alta pureza, bobinado sin empalmes en catorce formatos” sobre un vídeo oscuro de bobinas, con la línea “Palwal, Haryana — para transformadores de film y fabricantes de condensadores” debajo.',
        en: 'Swiftmet first screen: the headline about high-purity aluminium wire jointlessly wound in fourteen formats over a dark video of spools, with the line «Palwal, Haryana — for film converters and capacitor manufacturers» below.',
      },
    },
  },
  {
    slug: 'mila-barber',
    name: 'Mila Barber',
    tagline: {
      es: 'Página web con sistema de reserva de citas automático para Hassan, barbero en el barrio de la Milagrosa, Pamplona',
      en: 'Website with an automatic appointment booking system for Hassan, a barber in the Milagrosa neighbourhood of Pamplona',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Esta web posiciona en Google la peluquería atrayendo mayor volumen de clientes y posee un sistema de reserva de citas automático, ahorrando ese trabajo a Hassan y permitiendo a los usuarios pedir cita con su peluquero de confianza teniendo toda la información sin tener que hacer una llamada.',
      ],
      en: [
        'This site puts the barber shop on Google, bringing in more customers, and has an automatic appointment booking system that saves Hassan that work and lets people book with the barber they trust, with all the information at hand and no phone call needed.',
      ],
    },
    highlights: [],
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
        es: 'Primera pantalla de Mila Barber: el rótulo “MILA BARBER” en negro y dorado con el lema “Tu estilo, nuestra pasión”, los botones “Reservar cita” y “Ver servicios y precios”, y el horario con la dirección de la barbería debajo.',
        en: 'Mila Barber first screen: the «MILA BARBER» wordmark in black and gold with the «your style, our passion» line, the «book an appointment» and «services and prices» buttons, and the opening hours and address below.',
      },
    },
  },
  {
    slug: 'cedece',
    name: 'Cedecé',
    tagline: {
      es: 'Landing page para Cedecé, un rapero de Vigo, con todas sus plataformas vinculadas',
      en: 'Landing page for Cedecé, a rapper from Vigo, with all his platforms linked',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: {
      es: [
        'Página web para Cedecé, un artista vigués, que ofrece toda la información sobre su discografía, giras y novedades, con enlaces a todas sus redes sociales y plataformas para escuchar sus temas.',
      ],
      en: [
        'Website for Cedecé, an artist from Vigo, with all the information on his discography, tours and news, and links to all his social media and the platforms where his tracks can be heard.',
      ],
    },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'zod', 'ffmpeg', 'Vercel'],
    liveUrl: 'https://cedece.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/Cedece',
    image: {
      src: '/projects/cedece.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla de Cedecé: el nombre en letras enormes sobre una fotografía en blanco y negro del artista con el micrófono en la calle, la frase “Rap de Vigo. Letras que cuentan algo y directos en acústico” y los botones de Spotify y YouTube.',
        en: 'Cedecé first screen: the name in huge type over a black-and-white photograph of the artist with a microphone in the street, the line «Rap from Vigo. Lyrics that say something and acoustic gigs», and the Spotify and YouTube buttons.',
      },
    },
  },
  {
    slug: 'sangil-studio',
    name: 'Sangil Studio',
    tagline: {
      es: 'Portfolio para el estudio de arquitectura SangilStudio en Pamplona, con toda la información de contacto y las imágenes de sus proyectos',
      en: 'Portfolio for the SangilStudio architecture practice in Pamplona, with all its contact details and images of its projects',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo, modelo de contenido y despliegue',
      en: 'Design, development, content model and deployment',
    },
    summary: { es: [], en: [] },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'Sanity', 'lexorank', 'Vercel'],
    liveUrl: 'https://sangilstudio.com',
    repoUrl: 'https://github.com/luisfdzs/sangilstudio',
    image: {
      src: '/projects/shots/sangil-studio-2.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de la web de Sangil Studio: una fotografía de arquitectura a pantalla completa sin ningún texto encima, con el logotipo del estudio arriba a la izquierda y un signo más para abrir el menú arriba a la derecha, sobre fondo blanco.',
        en: 'Sangil Studio site first screen: a full-screen architecture photograph with no text on top, the studio wordmark at the top left and a plus sign to open the menu at the top right, on a white background.',
      },
    },
  },
  {
    slug: 'idemetro',
    name: 'IDEMETRO',
    tagline: {
      es: 'Landing page para Samuel, que ofrece escaneado 3D e ingeniería inversa de piezas industriales en Pamplona',
      en: 'Landing page for Samuel, who offers 3D scanning and reverse engineering of industrial parts in Pamplona',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Maquetación desde Figma, desarrollo y despliegue',
      en: 'Figma build, development and deployment',
    },
    summary: {
      es: [
        'Web de una sola página maquetada desde el diseño en Figma, en castellano, inglés y francés, con una brida en 3D que se escanea en el propio hero y un formulario de presupuesto que admite fotos de la pieza.',
        'El cambio de idioma se hace sin recargar la página, y las imágenes del formulario se comprimen en el navegador antes de enviarse, para que pedir presupuesto desde el móvil sea rápido aunque la conexión sea mala.',
      ],
      en: [
        'One-page site built from the Figma design, in Spanish, English and French, with a 3D flange that gets scanned right in the hero and a quote form that accepts photos of the part.',
        'Switching language never reloads the page, and the form images are compressed in the browser before sending, so asking for a quote from a phone stays fast even on a poor connection.',
      ],
    },
    highlights: [],
    stack: [
      'Next.js 16',
      'TypeScript',
      'Tailwind CSS 4',
      'Three.js',
      'zod',
      'Nodemailer',
      'Vercel',
    ],
    liveUrl: 'https://idemetro.vercel.app',
    image: {
      src: '/projects/shots/idemetro.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de IDEMETRO: el titular “Del mundo físico al modelo digital” en blanco sobre fondo oscuro y, a la derecha, una brida metálica en 3D con la mitad convertida en malla de alambre y el rótulo “Escaneando”.',
        en: 'IDEMETRO first screen: the «from the physical world to the digital model» headline in white on a dark background and, on the right, a 3D metal flange with half of it turned into a wireframe mesh under a «scanning» label.',
      },
    },
  },
  {
    slug: 'laux-reformas',
    name: 'LAUX Reformas',
    tagline: {
      es: 'Web corporativa para LAUX Reformas, una empresa de reformas de Salvaterra de Miño, Pontevedra',
      en: 'Company website for LAUX Reformas, a home renovation firm in Salvaterra de Miño, Pontevedra',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Diseño, desarrollo y despliegue',
      en: 'Design, development and deployment',
    },
    summary: {
      es: [
        'Web en castellano, gallego e inglés con una página por servicio, galería de proyectos, municipios en los que trabajan y formulario de presupuesto, pensada para aparecer en Google cuando alguien de la zona busca una reforma.',
      ],
      en: [
        'Site in Spanish, Galician and English with a page per service, a project gallery, the towns they work in and a quote form, built to show up on Google when someone nearby looks for a renovation.',
      ],
    },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'next-intl', 'zod', 'Resend', 'Vercel'],
    liveUrl: 'https://lauxreformas.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/lauxreformas',
    image: {
      src: '/projects/shots/laux-reformas.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de LAUX Reformas: el titular “Reformas que mejoran tu vida” sobre la fotografía oscurecida de una cocina reformada, con los botones “Pide tu presupuesto” y “Escríbenos por WhatsApp” y el teléfono en la cabecera.',
        en: 'LAUX Reformas first screen: the «renovations that improve your life» headline over a darkened photograph of a renovated kitchen, with the «get a quote» and «message us on WhatsApp» buttons and the phone number in the header.',
      },
    },
  },
  {
    slug: 'domobis',
    name: 'Domobis',
    tagline: {
      es: 'Migración a Next.js de la web de Domobis, un estudio de arquitectura e inversión inmobiliaria de Pamplona',
      en: 'Next.js migration of the website of Domobis, an architecture and real estate investment studio in Pamplona',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Migración, desarrollo y despliegue',
      en: 'Migration, development and deployment',
    },
    summary: {
      es: [
        'La web original era un WordPress con Divi que tenía malware inyectado en todos sus scripts. La rehíce en Next.js conservando estructura, maquetación y sistema visual, sin ejecutar ni copiar nada de su JavaScript.',
        'Unos scripts rastrean el sitio original, organizan y optimizan las imágenes y regeneran el contenido, de modo que la web estática se puede resincronizar con el original cuando haga falta.',
      ],
      en: [
        'The original site was a WordPress install with Divi and malware injected into every script. I rebuilt it in Next.js, keeping its structure, layout and visual system, without running or copying any of its JavaScript.',
        'A set of scripts crawls the original site, organises and optimises the images and regenerates the content, so the static site can be resynced with the original whenever needed.',
      ],
    },
    highlights: [],
    stack: ['Next.js 16', 'TypeScript', 'sharp', 'node-html-parser', 'Resend', 'Vercel'],
    liveUrl: 'https://domobis.vercel.app',
    image: {
      src: '/projects/shots/domobis.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de Domobis: el logotipo azul y gris sobre fondo blanco y, debajo, los bloques “Arquitectura” e “Inversión inmobiliaria” con sus iconos de casa y llave sobre una fotografía desenfocada de una maqueta de madera.',
        en: 'Domobis first screen: the blue and grey logo on a white background and, below it, the «Architecture» and «Real estate investment» blocks with their house and key icons over a blurred photograph of a wooden house model.',
      },
    },
  },
  {
    slug: 'enboxes',
    name: 'EnBoxes',
    tagline: {
      es: 'Web y app para saber cuándo te toca la ITV y la próxima revisión del coche, qué incluye y cuánto cuesta',
      en: 'Web app that tells you when your car’s next MOT and service are due, what they include and what they cost',
    },
    year: '2026',
    status: 'live',
    role: {
      es: 'Idea, diseño, desarrollo y despliegue',
      en: 'Concept, design, development and deployment',
    },
    summary: {
      es: [
        'Proyecto propio: un garaje en el móvil que calcula la próxima ITV y el plan de mantenimiento de cada coche, guarda facturas y papeles, avisa antes de cada vencimiento y muestra los talleres cercanos en un mapa.',
        'Incluye un escáner de facturas que lee los códigos QR de VeriFactu y TicketBAI, un asistente con IA, avisos por push, correo y calendario, y una app Android publicada como Trusted Web Activity.',
      ],
      en: [
        'A project of my own: a garage in your phone that works out the next MOT and the service plan of each car, keeps invoices and paperwork, warns you before every deadline and shows nearby garages on a map.',
        'It includes an invoice scanner that reads VeriFactu and TicketBAI QR codes, an AI assistant, push, email and calendar reminders, and an Android app shipped as a Trusted Web Activity.',
      ],
    },
    highlights: [],
    stack: [
      'Next.js 16',
      'React 19',
      'TypeScript',
      'Tailwind CSS 4',
      'MongoDB',
      'Auth.js',
      'AI SDK',
      'Gemini',
      'MapLibre',
      'Three.js',
      'Motion',
      'Stripe',
      'Web Push',
      'zod',
      'Vercel',
    ],
    liveUrl: 'https://enboxes.vercel.app',
    image: {
      src: '/projects/shots/enboxes.webp',
      width: 1280,
      height: 800,
      alt: {
        es: 'Primera pantalla de EnBoxes: el titular “Tu coche, siempre a punto” en mayúsculas sobre fondo oscuro, los botones “Añade tu coche gratis” y “Calcula tu próxima ITV” y, a la derecha, el plano técnico en 3D de un coche en azul eléctrico.',
        en: 'EnBoxes first screen: the «your car, always ready» headline in capitals on a dark background, the «add your car for free» and «work out your next MOT» buttons and, on the right, a 3D technical drawing of a car in electric blue.',
      },
    },
  },
  {
    slug: 'bonsai-artesania',
    name: 'Bonsái Artesanía',
    tagline: {
      es: 'Tienda web con carrito de productos y envío a domicilio para venta de joyas artesanales fabricadas en Vigo',
      en: 'Online shop with a product cart and home delivery for handmade jewellery crafted in Vigo',
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
      ],
      en: [
        'Shop for a handmade jewellery brand that sold only through Instagram. The goal was to give it a proper storefront with a catalogue, product pages and ordering, without the friction of a full e-commerce platform for an inventory of one-off pieces.',
      ],
    },
    highlights: [],
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
        es: 'Primera pantalla de Bonsái Artesanía: sobre fondo crema, el titular en serif “Flores que no se marchitan” a la izquierda y, dentro de un arco, la fotografía de dos pendientes de resina con pétalos naranjas colgando de una rama.',
        en: 'Bonsái Artesanía first screen: on a cream background, the serif headline «Flowers that never wilt» on the left and, inside an arch, a photograph of two resin earrings with orange petals hanging from a branch.',
      },
    },
  },
  {
    slug: 'blablatour',
    name: 'BlaBlaTour',
    tagline: {
      es: 'Web con diseño mobile para compartir viajes y planes con desconocidos',
      en: 'Mobile-first site for sharing trips and plans with strangers',
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
      ],
      en: [
        'A project of my own: find people heading to the same mountain on the same day and share the car, the cost and the route. Covers hiking, via ferratas, mountain biking, trail running, climbing and ski touring.',
      ],
    },
    highlights: [],
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
        es: 'BlaBlaTour en un navegador de escritorio: la interfaz se mantiene en una columna estrecha centrada, con el panel verde “Comparte coche hasta tu próxima ruta”, el buscador “¿A qué monte quieres ir?”, los filtros por actividad y las próximas salidas.',
        en: 'BlaBlaTour in a desktop browser: the interface stays in a narrow centred column, with the green «share a car to your next route» panel, the “which mountain are you heading to?” search box, the activity filters and the upcoming trips.',
      },
    },
  },
  {
    slug: 'almuerziko-san-fermin',
    name: 'Almuerziko San Fermín',
    tagline: {
      es: 'Web que creé cuando organicé el almuerziko sanferminero para mis amigos',
      en: 'Site I built when I organised the San Fermín lunch for my friends',
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
        'Un proyecto muy sencillo, construido en una única página, sin build, HTML y CSS a mano, solo una función serverless para la confirmación al almuerzo. La prueba de que no todo necesita un framework: saber dominar HTML, CSS y JS con criterio permite crear una web como esta.',
      ],
      en: [
        'A one-page invitation for the San Fermín lunch, with a countdown to the opening rocket, a live guest list, and RSVP protected by the group\u2019s shared key.',
        'A very simple project, built as a single page with no build step, hand-written HTML and CSS, and just one serverless function for the lunch RSVP. Proof that not everything needs a framework: mastering HTML, CSS and JS with good judgement is enough to build a site like this.',
      ],
    },
    highlights: [],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas', 'MongoDB', 'Vercel Functions'],
    liveUrl: 'https://almuerziko.vercel.app',
    repoUrl: 'https://github.com/luisfdzs/SanFermin',
    image: {
      src: '/projects/almuerziko-san-fermin.webp',
      width: 1400,
      height: 700,
      alt: {
        es: 'Primera pantalla del Almuerziko: cartel rojo con el título “Almuerziko de San Fermín, edición 2026”, la fecha “lunes 6 de julio a las 10:00”, la cuenta atrás a ceros y el arranque del bloque “¿Te vienes?” abajo.',
        en: 'Almuerziko first screen: a red poster with the «Almuerziko de San Fermín, 2026 edition» title, the «Monday 6 July at 10:00» date, the countdown at zeros and the start of the RSVP block below.',
      },
    },
  },
]

function listing(entry: ProjectListing): { title: string; featured: boolean } {
  return typeof entry === 'string'
    ? { title: entry, featured: false }
    : { title: entry.title, featured: Boolean(entry.featured) }
}

const byName = new Map(sheets.map((sheet) => [sheet.name, sheet]))

export const projects: ProjectEntry[] = projectList.flatMap((entry) => {
  const { title, featured } = listing(entry)
  const sheet = byName.get(title)

  if (!sheet) {
    console.warn(
      `[proyectos] “${title}” está en content/projects.config.ts pero no tiene ficha: ` +
        'escríbela en content/projects.ts con ese mismo `name`. Hasta entonces no se publica.',
    )
    return []
  }

  return [{ ...sheet, featured }]
})
