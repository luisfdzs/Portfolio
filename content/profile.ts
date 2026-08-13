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
      'Fuera de la parte puramente técnica, soy muy consciente de que lo que realmente marca la diferencia es la parte humana, lo que llamamos «habilidades blandas». Esto significa ser sincero, humilde para pedir y prestar ayuda, honesto, puntual, agradable, comprometido con la compañía… ser un buen profesional. Ahí es donde se marca la diferencia, y por eso cada día intento mejorar en ese aspecto, en cómo me comporto y me comunico con mis compañeros y con mis superiores.',
    ],
    en: [
      'Like many other developers, my training has been entirely self-taught: despite having studied industrial engineering, I focused on software development and put serious time into courses and personal projects.',
      'Beyond the purely technical side, I am very aware that what really makes the difference is the human side — what we call “soft skills”. That means being sincere, humble enough to ask for help and to give it, honest, punctual, pleasant, committed to the company… being a good professional. That is where the difference is made, and that is why I try to get better at it every day, at how I behave and how I communicate with my colleagues and with the people I report to.',
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
  },
  {
    slug: 'altia',
    role: { es: 'Desarrollador full stack', en: 'Full stack developer' },
    company: 'Altia',
    client: 'INDRA & Kids&Us',
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
    client: 'Ingeteam',
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
    client: 'ASTI Mobile Robotics',
    range: { start: '2021-08', end: '2022-12' },
    location: {
      es: 'Burgos, España',
      en: 'Burgos, Spain',
    },
    remote: false,
    summary: {
      es: [
        'Ahora forma parte de ABB Robotics, quien ha comprado la compañía. Cuando yo trabajaba en ASTI, la empresa diseñaba y fabricaba robots de transporte autónomos, técnicamente conocidos como AGVs (Automated Guided Vehicles / vehículos de guiado automático). Esto es: carretillas con uñas, elevadores, trenes de basuras… vehículos que se ven en una fábrica, entre las distintas cadenas de montaje, para optimizar la logística y la producción.',
        'Este fue mi primer empleo como desarrollador de software, y tengo la impresión de que lo que destacaba en mi CV por aquel entonces fue haber ganado el concurso de robots que celebraba la Universidad de Vigo. Fui responsable junior en el departamento de IT, a cargo de la programación de vehículos de guiado automático (AGVs): definir el esquema funcional con el cliente, desarrollar la solución integral de automatización de la planta y hacer la puesta en marcha allí mismo.',
      ],
      en: [
        'It is now part of ABB Robotics, which bought the company. When I worked at ASTI, it designed and built autonomous transport robots, technically known as AGVs (Automated Guided Vehicles). That is: fork trucks, lifters, waste trains… the vehicles you see in a factory, moving between assembly lines to optimise logistics and production.',
        'This was my first job as a software developer, and my impression is that what stood out in my CV back then was having won the robotics contest held by the University of Vigo. I was junior lead in the IT department, in charge of programming automated guided vehicles (AGVs): defining the functional design with the client, building the plant-wide automation solution, and commissioning it on site.',
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
