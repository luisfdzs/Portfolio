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
    es: 'Ingeniero de software y sistemas',
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
        'Mobile Smart City es «el Telpark de Estados Unidos»: la empresa líder en gestión de parkings, permisos anuales para zonas de aparcamiento y reservas de plaza, entre otros servicios.',
        'Desarrollo nuevas aplicaciones web para la gestión de aparcamiento, además de mantener proyectos legacy, resolver incidencias y realizar migraciones a tecnologías web más actuales.',
      ],
      en: [
        'Mobile Smart City is “the Telpark of the United States”: the leading company for parking management, annual permits for parking zones and space reservations, among other services.',
        'I develop new web applications for parking management, as well as maintaining legacy projects, resolving incidents and carrying out migrations to more current web technologies.',
      ],
    },
    stack: ['C#', '.NET', 'SQL', 'JavaScript', 'TypeScript', 'React'],
    url: 'https://www.mobilesmart.city/',
    showcase: 'parking',
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
        'Resolución de incidencias como labor principal, con un enfoque full-stack: el origen del problema podía estar en la base de datos, el backend de la aplicación, un servicio externo, el frontend, la configuración del entorno o, simplemente, en una duda de uso por parte del usuario.',
      ],
      en: [
        'An IT consultancy, two end clients.',
        'Incident resolution as the main task, with a full-stack approach: the root cause could be the database, the application backend, an external service, the frontend, the environment configuration or, simply, a usage question from the user.',
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
    showcase: 'devices',
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
        'Grupo de empresas especializado en ingeniería eléctrica, electrónica de potencia, automatización y energías renovables, con presencia internacional en múltiples sectores industriales.',
        'Mantenimiento y evolución de los ERPs y aplicaciones web del grupo Ingeteam: resolución de incidencias, desarrollo de nuevas funcionalidades y migración de proyectos legacy a tecnologías actuales.',
      ],
      en: [
        'A group of companies specialising in electrical engineering, power electronics, automation and renewable energy, with an international presence across multiple industrial sectors.',
        'Maintenance and evolution of the ERPs and web applications of the Ingeteam group: incident resolution, development of new features and migration of legacy projects to current technologies.',
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
    showcase: 'power',
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
        'Diseño y programación de sistemas de control para vehículos autónomos —carretillas, remolques, elevadores, etc.— destinados a transportar materiales, utillaje y residuos sin intervención humana en plantas de fabricación industrial, optimizando los sistemas de logística y producción.',
        'Análisis funcional con el cliente, desarrollo de la solución de automatización y puesta en marcha en planta.',
      ],
      en: [
        'Design and programming of control systems for autonomous vehicles —forklifts, trailers, lifts, etc.— intended to transport materials, tooling and waste without human intervention across industrial manufacturing plants, optimizing logistics and production systems.',
        'Functional analysis with the client, development of the automation solution, and on-site commissioning.',
      ],
    },
    stack: ['C#', '.NET', 'ASP.NET', 'ASP.NET Core', 'Visual Basic', 'SQL', 'JavaScript'],
    url: 'https://www.zemsania.com/',
    showcase: 'agv',
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
    showcase: 'campus',
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
