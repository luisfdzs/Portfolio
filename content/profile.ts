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
   * LOS TRES PÁRRAFOS DEL PERFIL, y por qué son cortos.
   *
   * Es la sección más personal del CV y la única de prosa, así que el riesgo no es quedarse
   * corto: es escribir seis párrafos que nadie lea. Cada uno dice una cosa y se aparta.
   *
   * Lo que dicen, en orden: que lo de programar es afición antes que oficio y que el stack lo
   * he aprendido solo; que el perfeccionismo va en el trabajo y no en el ego; y que las
   * habilidades blandas no son el complemento del perfil técnico, sino lo que decide si
   * merece la pena trabajar con alguien. Ese último párrafo es el que de verdad hay que dejar
   * al final: es una opinión, y una opinión se defiende cuando ya se ha demostrado lo demás.
   *
   * No hay una sola cifra ni un solo cliente aquí, a propósito: eso está en las secciones que
   * se pueden comprobar, con las fechas al lado. Aquí no se demuestra nada, se dice quién eres.
   */
  bio: {
    es: [
      'Soy ingeniero industrial y programo porque me gusta programar. Todo lo que hay detrás de esta web —el stack, el panel de administración, el despliegue— lo he aprendido por mi cuenta, construyendo cosas y rompiéndolas hasta entenderlas.',
      'Soy perfeccionista con el trabajo y poco con el ego: repaso cada detalle antes de darlo por bueno, y doy por hecho que quien tengo al lado sabe algo que yo no. Preguntar antes de suponer me ha ahorrado más tiempo que cualquier atajo técnico.',
      'Y lo que de verdad creo: la tecnología se aprende, la persona no. Escuchar, explicarse claro y ser alguien con quien se puede contar vale más que cualquier línea de este CV.',
    ],
    en: [
      'I am an industrial engineer and I write software because I enjoy writing software. Everything behind this site — the stack, the admin panel, the deployment — I taught myself, by building things and breaking them until they made sense.',
      'I am a perfectionist about the work and not about my ego: I go over every detail before calling it done, and I assume the person next to me knows something I do not. Asking before assuming has saved me more time than any technical shortcut.',
      'And what I actually believe: technology can be learned, character cannot. Listening, explaining yourself clearly and being someone people can count on is worth more than any line of this CV.',
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
    company: 'Mobile Smart City Corp',
    range: { start: '2026-03', end: null },
    location: { es: 'España · En remoto', en: 'Spain · Remote' },
    remote: true,
    /**
     * La actividad de la empresa sale de su web oficial (mobilesmart.city): plataforma de
     * pagos digitales y movilidad urbana —aparcamiento, permisos, denuncias, control y
     * tráfico— para ayuntamientos, universidades, aeropuertos y recintos privados. Está aquí
     * porque el nombre no dice a qué se dedica, y un recruiter que no lo sepa no puede valorar
     * el puesto.
     *
     * Lo que se cuenta del papel es lo que consta en LinkedIn —análisis e implementación— y
     * nada más. Ni tecnologías concretas del producto ni logros: eso sería inventar.
     */
    summary: {
      es: [
        'Plataforma de pagos digitales y movilidad urbana: aparcamiento, permisos, denuncias, control y tráfico para ayuntamientos, universidades, aeropuertos y recintos privados.',
        'Desarrollo y mantenimiento de sus aplicaciones web, con el análisis y la implementación en la misma mano: entender el problema con quien lo tiene, decidir cómo se resuelve y dejarlo funcionando en producción.',
      ],
      en: [
        'A digital payments and urban mobility platform: parking, permits, citations, enforcement and traffic for city councils, universities, airports and private venues.',
        'Development and maintenance of its web applications, with analysis and implementation in the same pair of hands: understanding the problem with whoever has it, deciding how to solve it, and leaving it running in production.',
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
        'Dos años de consultoría grande: desarrollo y mantenimiento de varias aplicaciones web para Banco Santander Portugal e INDRA, de punta a punta del ciclo —análisis, implementación, pruebas y soporte—.',
        'Equipo multidisciplinar en metodología ágil, con el cliente final al otro lado del teléfono y todo en remoto. En un entorno así lo que se aprende no es un framework: es escribir código que va a mantener otra persona y explicar una decisión técnica a quien no es técnico.',
      ],
      en: [
        'Two years in large-scale consultancy: developing and maintaining several web applications for Banco Santander Portugal and INDRA, across the whole lifecycle — analysis, implementation, testing and support.',
        'A cross-functional team working in agile, with the end client on the other end of the phone and everything remote. What you learn in a place like that is not a framework: it is writing code somebody else will maintain, and explaining a technical decision to someone who is not technical.',
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
        'Los ERPs y las aplicaciones web de todo el grupo Ingeteam a mi cargo: incidencias, desarrollos nuevos y migración de proyectos legacy a tecnologías actuales sin parar lo que ya estaba en marcha.',
        'Autonomía total sobre los desarrollos y 100 % en remoto. Es el puesto en el que aprendí a leer el código de otro antes de tocarlo, que es la mitad del oficio.',
      ],
      en: [
        'The ERPs and web applications of the whole Ingeteam group in my hands: incidents, new development, and migrating legacy projects to current technologies without stopping what was already running.',
        'Full autonomy over the work and fully remote. This is the job where I learned to read somebody else’s code before touching it, which is half the trade.',
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
        'Responsable junior en el departamento de IT, a cargo de la programación de vehículos de guiado automático (AGVs): definir el esquema funcional con el cliente, desarrollar la solución integral de automatización de la planta y hacer la puesta en marcha allí mismo.',
        'Aquí un error no lanza una excepción en un log: para una línea de producción. Es el trabajo que me enseñó a mirar el sistema entero antes que el código, y sigue siendo la forma en la que programo.',
      ],
      en: [
        'Junior lead in the IT department, in charge of programming automated guided vehicles (AGVs): defining the functional design with the client, building the plant-wide automation solution, and commissioning it on site.',
        'Here a mistake does not throw an exception into a log — it stops a production line. That is the job that taught me to look at the whole system before the code, and it is still how I write software.',
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
     * LA NOTA HABLA DE LA BASE, no del calendario.
     *
     * Decía que la carrera se cursó en paralelo a los tres primeros puestos, y se ha cambiado
     * por encargo. El argumento es el mismo por el que esta sección dejó de pintar las fechas:
     * contar cuánto se solapó invita a la cuenta de los años y a preguntarse cómo se reparte
     * una jornada, y ninguna de las dos cosas dice nada sobre lo que sabe hacer alguien. Lo que
     * sí lo dice es qué deja una ingeniería cuando ya no se ejerce de ingeniero, y es de eso de
     * lo que habla ahora.
     */
    note: {
      es: 'Una ingeniería no deja una lista de asignaturas: deja una forma de pensar. Descomponer el problema antes de tocarlo, medir antes de decidir y responder de que lo que sale funciona — la base con la que me siento a programar cada día.',
      en: 'An engineering degree does not leave you a list of subjects: it leaves you a way of thinking. Break the problem down before touching it, measure before deciding, and stand behind what ships — the foundation I sit down to write software with every day.',
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
