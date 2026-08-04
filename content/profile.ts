import type { DescribedImage, EducationEntry, ExperienceEntry, Profile, SkillGroup } from './types'

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

/**
 * EL RETRATO DE RESPALDO, y **el único respaldo que se usa por campo y no por documento**.
 *
 * El panel sigue teniendo su campo «Retrato» y sigue mandando cuando hay una imagen elegida;
 * lo que cambia es qué pasa cuando no la hay. La regla general del contenido cae al respaldo
 * **por documento entero** —perfil, puesto, proyecto—, y con el retrato eso no basta: el
 * documento «Perfil» del panel es perfectamente válido con el campo de la foto vacío, así que
 * no se cae a `content/` y el hero se quedaba con el hueco de trama de `Figure`. Por eso el
 * respaldo del retrato es por campo y lo pone `getProfile` (ver `lib/content.ts`).
 *
 * Va suelto y no sólo dentro de `profile` porque el respaldo de campo tiene que poder usarse
 * cuando el resto del perfil viene de Sanity, que es el caso normal. Se declara **antes** de
 * `profile`, que lo referencia: al revés sería un `const` usado antes de inicializarse y el
 * módulo rompería al cargar.
 *
 * **Es un RECORTE con canal alfa**: el busto sin la calle de detrás, calibrado contra
 * `.hero-portrait__frame` — una foto con fondo subida al panel deja el busto como una tarjeta
 * oscura en el hero. Si alguna vez se repone el original a 800×800, hay que volver a
 * recortarlo.
 *
 * 200×200 es el original que había: es justo el mínimo para el retrato circular de móvil
 * (160 px) pero se queda corto para los 320 px de escritorio, donde se ve blando en pantallas
 * de alta densidad. Está apuntado en el README como pendiente: hace falta el original a
 * 800×800. Se declaran las medidas reales y no las deseadas, porque `next/image` reserva el
 * hueco con ellas y mentir aquí provoca salto de maquetación.
 */
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
  /**
   * LOS DOS PÁRRAFOS DEL PERFIL. Eran tres y los reescribió Luis en persona el 2026-08-04.
   *
   * Es la sección más personal del CV y la única de prosa, así que el riesgo no es quedarse
   * corto: es escribir seis párrafos que nadie lea. Cada uno dice una cosa y se aparta.
   *
   * Lo que dicen, en orden: que la formación como desarrollador es autodidacta y de dónde
   * viene —la ingeniería tocaba programación, pero orientada a procesos industriales—; y que
   * lo que de verdad marca la diferencia son las habilidades blandas. Ese segundo párrafo es
   * el que hay que dejar al final: es una opinión, y una opinión se defiende cuando ya se ha
   * demostrado lo demás.
   *
   * No hay una sola cifra ni un solo cliente aquí, a propósito: eso está en las secciones que
   * se pueden comprobar, con las fechas al lado. Aquí no se demuestra nada, se dice quién eres.
   */
  bio: {
    es: [
      'Como muchos otros desarrolladores, mi formación ha sido 100 % autodidacta, ya que a pesar de haber estudiado ingeniería industrial, me enfoqué en el desarrollo de software y dediqué un tiempo importante a realizar cursos y proyectos personales. En la carrera sí que se tocaba algo de programación, quizá más enfocada a procesos industriales, pero rápidamente vi el potencial que tenía aprender esta habilidad.',
      'Fuera de la parte técnica, soy muy consciente de que lo que realmente marca la diferencia es la parte humana, lo que llamamos «habilidades blandas». Esto significa ser sincero, humilde para pedir y prestar ayuda, honesto, puntual, agradable, comprometido con la compañía… ser un buen profesional. Ahí es donde se marca la diferencia, y por eso cada día intento mejorar en ese aspecto, en cómo me comporto y me comunico con mis compañeros y con mis superiores.',
    ],
    en: [
      'Like many other developers, my training has been entirely self-taught: despite having studied industrial engineering, I focused on software development and put serious time into courses and personal projects. The degree did cover some programming, more oriented towards industrial processes, but I quickly saw the potential of learning this skill.',
      'Beyond the technical side, I am very aware that what really makes the difference is the human side — what we call “soft skills”. That means being sincere, humble enough to ask for help and to give it, honest, punctual, pleasant, committed to the company… being a good professional. That is where the difference is made, and that is why I try to get better at it every day, at how I behave and how I communicate with my colleagues and with the people I report to.',
    ],
  },
  photo: portrait,
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
    company: 'Mobile Smart City',
    range: { start: '2026-03', end: null },
    location: { es: 'España · En remoto', en: 'Spain · Remote' },
    remote: true,
    /**
     * ESTE RESUMEN LO ESCRIBIÓ LUIS EN PRIMERA PERSONA (2026-08-04), y por eso suena distinto
     * al que había: la actividad de la empresa se explica con una comparación —«el Telpark de
     * Estados Unidos»— en vez de con la descripción de su web oficial, que no le decía nada a
     * quien no conoce el sector.
     *
     * El primer párrafo está aquí porque el nombre de la empresa no dice a qué se dedica, y un
     * recruiter que no lo sepa no puede valorar el puesto. El segundo dice qué hace Luis, y la
     * frase que no hay que perder es «formando parte de la plantilla interna»: es lo que
     * distingue este puesto de los tres anteriores, todos de consultoría con cliente final.
     */
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
    // Dos clientes y no cuatro: Luis quitó Banco Santander Portugal y GETNET el 2026-08-04.
    // Es su CV y su decisión; lo que queda sigue constando en LinkedIn.
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
    // Sólo ASTI: ABB salió del rótulo el 2026-08-04 y pasó al primer párrafo del resumen, que
    // es donde la compra se puede contar con su contexto («ahora forma parte de…») en vez de
    // parecer un segundo cliente simultáneo.
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
    // El castellano es el que ya estaba editado en el panel («Universidad», no
    // «Universidade»), para que el respaldo y el panel digan lo mismo. El inglés es el
    // nombre oficial que usa la propia uvigo.gal en su versión inglesa.
    institution: { es: 'Universidad de Vigo', en: 'University of Vigo' },
    range: { start: '2020-09', end: '2025-06' },
    location: { es: 'Vigo, Galicia', en: 'Vigo, Spain' },
    /**
     * LA NOTA HABLA DE LA BASE, no del calendario, y desde el 2026-08-04 la escribe Luis en
     * primera persona.
     *
     * Decía que la carrera se cursó en paralelo a los tres primeros puestos, y eso se quitó por
     * el mismo argumento por el que esta sección dejó de pintar las fechas: contar cuánto se
     * solapó invita a la cuenta de los años y a preguntarse cómo se reparte una jornada, y
     * ninguna de las dos cosas dice nada sobre lo que sabe hacer alguien. Lo que sí lo dice es
     * qué deja una ingeniería cuando ya no se ejerce de ingeniero.
     *
     * La versión de Luis aterriza eso en un ejemplo de hoy —cómo escribe los prompts cuando
     * trabaja con IA— y es a propósito: es el único sitio del CV donde una asignatura de 2020
     * se conecta con algo que se hace en 2026.
     */
    note: {
      es: 'Quizás lo mejor que me ha dado estudiar una carrera como esta es una forma de pensar bien estructurada. Esto me permite hoy en día en mi trabajo hacer muy buenos prompts cuando usamos IA: soy muy específico y concreto escribiendo a agentes de inteligencia artificial y no sólo les pido escribir el código, también métricas concretas de QA y de UAT, test unitarios y de integración, etc. En una carrera como esta se aprende a pensar de forma global y a tener la perspectiva clara de cada tarea antes de comenzar a picar código.',
      en: 'Perhaps the best thing a degree like this gave me is a well-structured way of thinking. It is what lets me write very good prompts at work today when we use AI: I am specific and concrete when writing to AI agents, and I do not only ask them for the code — I also ask for concrete QA and UAT metrics, unit and integration tests, and so on. A degree like this teaches you to think globally and to have a clear view of each task before you start writing code.',
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
