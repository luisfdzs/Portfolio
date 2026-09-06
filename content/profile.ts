import type { DescribedImage, EducationEntry, ExperienceEntry, Profile, SkillGroup } from './types'

export const portrait: DescribedImage = {
  src: '/luis.webp',
  width: 200,
  height: 200,
  alt: {
    es: 'Retrato de Luis Fernández Sangil',
    en: 'Portrait of Luis Fernández Sangil',
  },
}

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
      'Como muchos otros desarrolladores, mi formación ha sido 100 % autodidacta, ya que a pesar de haber estudiado ingeniería industrial, me enfoqué en el desarrollo de software y dediqué un tiempo importante a realizar cursos y proyectos personales.',
      'Trato de darles la importancia que se merecen a todas las habilidades no tan relacionadas con la programación y el desarrollo de software, sino más relacionadas con ser un buen profesional: lo que llamamos «habilidades blandas». La parte humana es cada vez más importante, y esto es algo en lo que no se puede mejorar simplemente usando IA.',
    ],
    en: [
      'Like many other developers, my training has been entirely self-taught: despite having studied industrial engineering, I focused on software development and put serious time into courses and personal projects.',
      'I try to give the attention they deserve to all the skills that have less to do with programming and software development, and more to do with being a good professional: what we call “soft skills”. The human side matters more and more, and it is not something you can get better at just by using AI.',
    ],
  },
  photo: portrait,
}

export const experience: ExperienceEntry[] = [
  {
    slug: 'mobile-smart-city',
    role: {
      es: 'Analista programador senior',
      en: 'Senior developer / analyst',
    },
    company: 'Mobile Smart City',
    range: { start: '2026-03', end: null },
    location: { es: 'España · En remoto', en: 'Spain · Remote' },
    remote: true,
    summary: {
      es: [
        'Mobile Smart City es «el Telpark de Estados Unidos». Es la empresa más grande para gestión de parkings, permisos anuales para zonas de aparcamiento, reservas de plaza en el aeropuerto, etc.',
        'Dentro de la empresa, formando parte de la plantilla interna y sin la intermediación de consultoras externas, me ocupo del mantenimiento de proyectos legacy, añadir funcionalidades nuevas, realizar migraciones completas, resolver incidencias… un poco de todo.',
      ],
      en: [
        'Mobile Smart City is “the Telpark of the United States”. It is the largest company for parking management, annual permits for parking zones, airport space reservations, and so on.',
        'Inside the company, as part of the in-house team and with no external consultancy in between, I maintain legacy projects, add new features, run full migrations, resolve incidents… a bit of everything.',
      ],
    },
    stack: ['C#', '.NET', 'SQL', 'JavaScript', 'TypeScript', 'React'],
    url: 'https://www.mobilesmart.city/',
  },
  {
    slug: 'altia',
    role: { es: 'Desarrollador full stack', en: 'Full stack developer' },
    company: 'Altia',
    clients: [
      { name: 'Indra', url: 'https://www.indragroup.com/' },
      { name: 'Kids&Us', url: 'https://www.kidsandus.es/' },
    ],
    range: { start: '2024-02', end: '2026-01' },
    location: {
      es: 'Madrid, España · En remoto',
      en: 'Madrid, Spain · Remote',
    },
    remote: true,
    summary: {
      es: [
        'Una consultora informática, dos clientes finales.',
        'Mi trabajo era (la mayor parte del tiempo) resolver incidencias. Fui full-stack porque las incidencias eran a veces un problema de base de datos, otras veces del backend de la aplicación, de un servicio externo, del propio frontend, etc. Quien abría la incidencia no discriminaba el tipo de error, simplemente la reportaba al equipo de incidental.',
      ],
      en: [
        'An IT consultancy, two end clients.',
        'My job was (most of the time) resolving incidents. I was full-stack because an incident could be a database problem, or the application backend, or an external service, or the frontend itself. Whoever opened the incident did not sort it by type of error, they simply reported it to the incident team.',
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
    clients: [{ name: 'Ingeteam', url: 'https://www.ingeteam.com/' }],
    range: { start: '2023-02', end: '2024-02' },
    location: {
      es: 'Madrid, España · En remoto',
      en: 'Madrid, Spain · Remote',
    },
    remote: true,
    summary: {
      es: [
        'Grupo de empresas especializado en ingeniería eléctrica, electrónica de potencia, automatización y energías renovables, con presencia internacional en numerosos sectores industriales.',
        'Formé parte del equipo de desarrollo que mantenía los ERPs y las aplicaciones web de todo el grupo Ingeteam: incidencias, desarrollos nuevos y migraciones de proyectos legacy a tecnologías actuales.',
      ],
      en: [
        'A group of companies specialising in electrical engineering, power electronics, automation and renewable energy, with an international presence across many industrial sectors.',
        'I was part of the development team that maintained the ERPs and web applications of the whole Ingeteam group: incidents, new development, and migrating legacy projects to current technologies.',
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
    clients: [
      {
        name: 'ASTI Mobile Robotics',
        url: 'https://new.abb.com/products/robotics/autonomous-mobile-robots',
      },
    ],
    range: { start: '2021-08', end: '2022-12' },
    location: {
      es: 'Burgos, España',
      en: 'Burgos, Spain',
    },
    remote: false,
    summary: {
      es: [
        'Programación de vehículos de guiado automático o AGV (Automated Guided Vehicles). Mi primer empleo como desarrollador. Programación de carretillas con uñas, remolques, elevadores, trenes de basuras y cualquier vehículo que transporta producto final, utillaje, residuo, etc. en un espacio de fabricación industrial, para automatizar y optimizar la logística y la producción.',
        'Mis tareas eran definir el esquema funcional con el cliente, desarrollar la solución integral de automatización de la planta y hacer la puesta en marcha. En una ocasión viajé a México para instalar 3 AGVs en el cliente Schneider Electric.',
      ],
      en: [
        'AGV programming. My first job as a developer. Programming fork trucks, trailers, lifters, waste trains and any vehicle that moves finished product, tooling, waste and so on around an industrial manufacturing floor, to automate and optimise logistics and production.',
        'My tasks were defining the functional design with the client, building the plant-wide automation solution and commissioning it. On one occasion I travelled to Mexico to install 3 AGVs for the client Schneider Electric.',
      ],
    },
    stack: ['C#', '.NET', 'ASP.NET', 'ASP.NET Core', 'Visual Basic', 'SQL', 'JavaScript'],
    url: 'https://www.zemsania.com/',
  },
]

export const education: EducationEntry[] = [
  {
    slug: 'grado-ingenieria-industrial',
    title: {
      es: 'Grado en Ingeniería en Electrónica Industrial y Automática',
      en: "Bachelor's degree in Industrial Electronics and Automation Engineering",
    },
    institution: { es: 'Universidad de Vigo', en: 'University of Vigo' },
    range: { start: '2020-09', end: '2025-06' },
    location: { es: 'Vigo, Galicia', en: 'Vigo, Spain' },
    note: {
      es: [
        'Quizás lo mejor que me ha aportado este grado es una forma de pensar bien estructurada: «todos los problemas pueden resolverse, siempre y cuando se dividan primero en partes más sencillas y manejables».',
        'Pensar de forma global en el problema, tener perspectiva antes de picar código, redactar buenos prompts cuando uso IA, ser específico y concreto, implementar métricas de calidad, tests… son cosas para las que siento que me ha ayudado muchísimo estudiar una ingeniería.',
      ],
      en: [
        'Perhaps the best thing this degree gave me is a well-structured way of thinking: “every problem can be solved, as long as it is first broken down into simpler, more manageable parts”.',
        'Thinking about the problem as a whole, having perspective before writing any code, writing good prompts when I use AI, being specific and concrete, putting quality metrics and tests in place… studying engineering has helped me enormously with all of that.',
      ],
    },
    url: 'https://www.uvigo.gal/',
  },
]

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
    items: ['Vercel', 'Git', 'GitHub', 'CI/CD', 'Agile', 'ERP'],
  },
]
