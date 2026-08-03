import type { EducationEntry, ExperienceEntry, Profile, SkillGroup } from './types'

/**
 * EL CV, COMO DATOS
 *
 * Fuente: el perfil de LinkedIn (linkedin.com/in/luisfernandezsangil), que es el
 * documento que se mantiene al día. Cuando cambie allí, cambia aquí —o, mejor, en el
 * panel de /admin, que es lo que gana sobre este fichero (ver `lib/content.ts`)—.
 *
 * **Nada de esto se inventa.** Las fechas, los puestos, las empresas y el cliente final
 * de cada consultoría son los que constan en LinkedIn. Lo único redactado aquí son los
 * resúmenes, que reordenan esa información para que se lea en pantalla; no añaden
 * hechos. Si algún día hace falta un dato que no consta, se deja fuera: un CV con un
 * dato dudoso vale menos que uno con un hueco.
 */

export const profile: Profile = {
  name: 'Luis Fernández Sangil',
  headline: {
    es: 'Ingeniero industrial y desarrollador web',
    en: 'Industrial engineer and web developer',
  },
  location: {
    es: 'Vigo, Galicia · En remoto',
    en: 'Vigo, Spain · Remote',
  },
  email: 'luisfsangil@gmail.com',
  linkedin: 'https://www.linkedin.com/in/luisfernandezsangil',
  github: 'https://github.com/luisfdzs',
  bio: {
    es: [
      'Llegué al software desde la ingeniería industrial, y esa es la parte que más me diferencia: mi primer trabajo fue programar vehículos de guiado automático en planta, donde un error no lanza una excepción en un log, sino que para una línea de producción. Eso enseña a pensar en el sistema completo antes que en el código.',
      'Desde entonces he pasado cinco años en consultoría, desarrollando y manteniendo aplicaciones para clientes grandes —banca, ingeniería, robótica— con .NET y SQL en el backend y React en el frontend. Mucho de ese trabajo fue lo menos glamuroso y lo más formativo que hay: mantener sistemas heredados que no se pueden parar, resolver incidencias con el cliente al teléfono y migrar proyectos legacy sin romper lo que ya funcionaba.',
      'En paralelo construyo webs completas por mi cuenta, y ahí es donde elijo yo el stack: Next.js, Sanity y Vercel. No sólo la interfaz: el modelo de contenido, el panel para que el cliente se edite lo suyo, el despliegue con entornos separados y el mantenimiento. Los proyectos de aquí abajo son eso, y todos están en producción.',
    ],
    en: [
      'I came to software from industrial engineering, and that is what sets me apart most: my first job was programming automated guided vehicles on the factory floor, where a mistake does not throw an exception into a log — it stops a production line. That teaches you to think about the whole system before the code.',
      'Since then I have spent five years in consultancy, building and maintaining applications for large clients — banking, engineering, robotics — with .NET and SQL on the backend and React on the frontend. Much of that work was the least glamorous and most formative there is: keeping inherited systems running that cannot be stopped, solving incidents with the client on the phone, and migrating legacy projects without breaking what already worked.',
      'Alongside that I build complete websites on my own, and there I choose the stack: Next.js, Sanity and Vercel. Not just the interface: the content model, the panel so the client edits their own copy, the deployment with separate environments, and the maintenance. The projects below are exactly that, and all of them are in production.',
    ],
  },
  photo: {
    // **Es un RECORTE con canal alfa**: el busto sin la calle de detrás. Si alguna vez se
    // repone el original a 800×800, hay que volver a recortarlo — una foto con fondo aquí
    // deja el hero con una tarjeta oscura alrededor de la cara (ver `.hero-portrait__frame`
    // en `globals.css`).
    // 200×200 es el original que había: es justo el mínimo para el retrato circular de
    // móvil (160 px) pero se queda corto para los 320 px de escritorio, donde se ve blando
    // en pantallas de alta densidad. Está apuntado en el README como pendiente: hace falta
    // el original a 800×800. Se declaran las medidas reales y no las deseadas, porque
    // `next/image` reserva el hueco con ellas y mentir aquí provoca salto de maquetación.
    src: '/luis.webp',
    width: 200,
    height: 200,
    alt: {
      es: 'Retrato de Luis Fernández Sangil',
      en: 'Portrait of Luis Fernández Sangil',
    },
  },
}

/**
 * Experiencia, de lo más reciente a lo más antiguo. El orden es el del array: no se
 * ordena por fecha en tiempo de ejecución, porque un CV no siempre quiere el orden
 * estrictamente cronológico y prefiero que se vea aquí cuál es.
 */
export const experience: ExperienceEntry[] = [
  {
    slug: 'mobile-smart-city',
    role: {
      es: 'Analista programador senior',
      en: 'Senior developer / analyst',
    },
    company: 'Mobile Smart City Corp',
    range: { start: '2026-03', end: null },
    location: { es: 'España · En remoto', en: 'Spain · Remote' },
    remote: true,
    summary: {
      es: [
        'Desarrollo y mantenimiento de aplicaciones web, con responsabilidad tanto de análisis como de implementación.',
      ],
      en: [
        'Development and maintenance of web applications, responsible for both analysis and implementation.',
      ],
    },
    stack: ['C#', '.NET', 'SQL', 'JavaScript', 'TypeScript', 'React'],
  },
  {
    slug: 'altia',
    role: { es: 'Desarrollador backend', en: 'Backend developer' },
    company: 'Altia',
    client: 'Banco Santander Portugal · INDRA · GETNET · Kids&Us',
    range: { start: '2024-02', end: '2026-01' },
    location: {
      es: 'Madrid, España · En remoto',
      en: 'Madrid, Spain · Remote',
    },
    remote: true,
    summary: {
      es: [
        'Desarrollo y mantenimiento de varias aplicaciones web para clientes de gran envergadura, principalmente Banco Santander Portugal e INDRA. Participación en todo el ciclo de vida: análisis, implementación, pruebas y soporte.',
        'Equipo multidisciplinar con metodologías ágiles y contacto directo con el cliente final, en un entorno corporativo internacional y 100 % en remoto.',
      ],
      en: [
        'Development and maintenance of several web applications for large clients, mainly Banco Santander Portugal and INDRA. Involved across the full lifecycle: analysis, implementation, testing and support.',
        'Cross-functional team working with agile methodologies and direct contact with the end client, in an international corporate environment and fully remote.',
      ],
    },
    stack: [
      'C#',
      '.NET Core',
      'ASP.NET Web API',
      'SQL',
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'MongoDB',
    ],
    url: 'https://www.altiacompany.com/',
  },
  {
    slug: 'exceltic',
    role: { es: 'Desarrollador full stack', en: 'Full stack developer' },
    company: 'Exceltic',
    client: 'Grupo Ingeteam',
    range: { start: '2023-02', end: '2024-02' },
    location: {
      es: 'Madrid, España · En remoto',
      en: 'Madrid, Spain · Remote',
    },
    remote: true,
    summary: {
      es: [
        'Mantenimiento de los ERPs y las aplicaciones web de todo el grupo Ingeteam: resolución de incidencias, desarrollo de soluciones nuevas y migración de proyectos legacy hacia tecnologías actuales.',
        'Autonomía total en los desarrollos y modalidad 100 % en remoto.',
      ],
      en: [
        'Maintenance of the ERPs and web applications across the whole Ingeteam group: incident resolution, development of new solutions, and migration of legacy projects to current technologies.',
        'Full autonomy over the work and fully remote.',
      ],
    },
    stack: [
      'C#',
      'Visual Basic',
      '.NET',
      'ASP.NET',
      'ASP.NET Core',
      'SQL',
      'JavaScript',
      'jQuery',
      'Vue.js',
      'React',
      'Tailwind CSS',
      'log4net',
    ],
    url: 'https://exceltic.com/',
  },
  {
    slug: 'zemsania-asti-abb',
    role: { es: 'Programador de AGVs', en: 'AGV programmer' },
    company: 'Zemsania Global Group',
    client: 'ASTI Mobile Robotics · ABB Robotics',
    range: { start: '2021-08', end: '2022-12' },
    location: {
      es: 'Burgos, España',
      en: 'Burgos, Spain',
    },
    remote: false,
    summary: {
      es: [
        'Responsable junior en el departamento de IT, encargado de la programación de vehículos de guiado automático (AGVs): definir el esquema funcional con el cliente, desarrollar la solución integral de automatización de la planta y hacer la puesta en marcha.',
        'Trabajo en remoto con viajes puntuales a planta para las puestas en marcha.',
      ],
      en: [
        'Junior lead in the IT department, responsible for programming automated guided vehicles (AGVs): defining the functional design with the client, developing the complete plant automation solution, and commissioning it on site.',
        'Remote work with occasional travel to the plant for commissioning.',
      ],
    },
    stack: ['C#', '.NET', 'ASP.NET', 'ASP.NET Core', 'Visual Basic', 'SQL', 'JavaScript'],
    url: 'https://new.abb.com/products/robotics/autonomous-mobile-robots',
  },
]

export const education: EducationEntry[] = [
  {
    slug: 'grado-ingenieria-industrial',
    title: {
      es: 'Grado en Ingeniería Industrial',
      en: "Bachelor's degree in Industrial Engineering",
    },
    institution: 'Universidade de Vigo',
    range: { start: '2020-09', end: '2025-06' },
    location: { es: 'Vigo, Galicia', en: 'Vigo, Spain' },
    note: {
      es: 'Cursado en paralelo a los tres primeros puestos de la lista de arriba: cinco años compaginando la carrera con jornada completa de desarrollo.',
      en: 'Studied in parallel with the first three roles listed above: five years combining the degree with full-time development work.',
    },
    url: 'https://www.uvigo.gal/',
  },
]

/**
 * Stack agrupado por para qué sirve, no por «lenguajes / frameworks / herramientas».
 *
 * La razón es lo que hace un recruiter técnico con esta sección: comprueba si cubres el
 * hueco que tiene. Una lista plana de treinta logos no responde a eso; cuatro grupos que
 * dicen «esto es lo que hago en backend, esto en frontend» sí. Y dentro de cada grupo el
 * orden es de más a menos uso real, que es la única jerarquía honesta.
 */
export const skills: SkillGroup[] = [
  {
    key: 'backend',
    title: { es: 'Backend', en: 'Backend' },
    items: [
      'C#',
      '.NET',
      '.NET Core',
      'ASP.NET Core',
      'ASP.NET Web API',
      'Node.js',
      'Visual Basic',
    ],
  },
  {
    key: 'frontend',
    title: { es: 'Frontend', en: 'Frontend' },
    items: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'Vue.js',
      'jQuery',
      'Bootstrap',
    ],
  },
  {
    key: 'data',
    title: { es: 'Datos', en: 'Data' },
    items: ['SQL Server', 'SQL', 'MongoDB', 'Mongoose', 'Sanity', 'zod'],
  },
  {
    key: 'platform',
    title: { es: 'Plataforma y proceso', en: 'Platform & process' },
    // Los nombres del stack no se traducen (son la misma palabra en los dos idiomas), así
    // que aquí sólo caben términos que ya son neutros: «Agile» y no «metodologías ágiles».
    items: ['Vercel', 'Git', 'GitHub', 'CI/CD', 'Agile', 'ERP'],
  },
]
