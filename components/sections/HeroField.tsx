'use client'

import { useEffect, useRef } from 'react'

/**
 * CAMPO INTERACTIVO DE LA PORTADA
 *
 * Lo primero que se ve al abrir la web: una retícula de varios miles de nodos que **reacciona a
 * quien la mira**. El puntero abre un pozo de luz —los nodos se apartan, se encienden en cobre y
 * tejen entre ellos una constelación que sólo existe donde hay luz—, un clic lanza una onda que
 * recorre la pantalla entera, y de vez en cuando un pulso viaja por una fila o una columna como
 * un paquete por un bus.
 *
 * **Sustituye al mosaico de fotografías.** El encargo fue explícito y la diferencia es de
 * naturaleza, no de estilo: aquello era material grabado moviéndose en bucle —bonito, pero
 * indiferente a quien estuviera delante—, y esto es un sistema que responde. La referencia
 * declarada son las portadas de Linear, Stripe, Vercel y Sanity, y lo que las cuatro tienen en
 * común no es el collage: es que **el fondo está dibujado por el mismo oficio que vende la
 * página**. En un portfolio de desarrollo, un fondo generado con código dice en tres segundos lo
 * que el CV tarda dos pantallas en argumentar.
 *
 * Las seis decisiones que lo sostienen:
 *
 * 1. **Un solo `<canvas>` y cero dependencias.** Ni Three, ni Framer Motion, ni una librería de
 *    partículas: contexto 2D, tipos de datos planos y un bucle. Añadir 40 KB de JavaScript a la
 *    primera pantalla de un CV para dibujar puntos sería exactamente el error que este proyecto
 *    lleva evitando desde el primer commit. Todo el peso extra es este archivo.
 *
 * 2. **Es DECORACIÓN, y se declara como tal.** `aria-hidden` en la raíz y `pointer-events: none`
 *    en el lienzo: no se anuncia a un lector de pantalla —no hay nada que contar— y no puede
 *    interceptar el clic de un botón. Los eventos se escuchan en `window` y se descartan los que
 *    caen fuera del hero, que es la única forma de reaccionar al puntero **sin** ponerse en medio.
 *
 * 3. **El texto manda sobre el campo, siempre.** El retículo se apaga hacia abajo por diseño
 *    (`rowFade`), no por un velo puesto encima: en la franja donde vive el bloque de texto los
 *    nodos casi no existen. Es la misma regla de siempre —si hay que esforzarse para leer el
 *    rótulo del puesto o la ubicación a 390 px, el cambio está mal—, resuelta en el origen en vez
 *    de tapando con un degradado lo que no debería haberse dibujado.
 *
 * 4. **Nunca se queda quieto esperando a un ratón.** En un móvil no hay puntero, y en un
 *    escritorio hay mucha gente que lee sin tocar nada. Cuando el puntero falta o lleva un rato
 *    parado, una luz autónoma recorre la escena y los pulsos siguen saliendo: la interacción
 *    **suma**, no es el requisito para que pase algo.
 *
 * 5. **Trabaja sólo cuando se le ve.** Un `IntersectionObserver` para el bucle en cuanto el hero
 *    sale de la pantalla, y `visibilitychange` lo para al cambiar de pestaña. Un `requestAnimationFrame`
 *    corriendo mientras alguien lee la sección de experiencia es batería quemada a cambio de nada.
 *
 * 6. **Se para si molesta.** Con `prefers-reduced-motion: reduce` no se esconde: se dibuja **un
 *    fotograma** y no se registra ni un escuchador. Un campo de puntos que late y se aparta es
 *    justo el movimiento periférico continuo que provoca mareo a quien tiene sensibilidad
 *    vestibular. Y se escucha el cambio de preferencia en caliente, porque en el sistema
 *    operativo se activa sin recargar la página.
 *
 * La mecánica de dibujo —por qué los nodos se pintan en doce grupos y no uno a uno, y por qué el
 * suavizado va en exponenciales y no en un factor fijo— está comentada junto a cada pieza.
 */

/** Una onda de clic viva: dónde nació y cuánto lleva abierta, en segundos. */
type Pulse = { x: number; y: number; age: number }

/**
 * Un pulso viajando por el retículo. `axis` 0 es una fila (viaja en horizontal) y 1 una columna;
 * `line` es el índice de esa fila o columna y `pos` la posición de la cabeza, en píxeles CSS.
 */
type Beam = { axis: 0 | 1; line: number; pos: number; dir: 1 | -1 }

/** Vuelta completa. Se usa en cada nodo de cada fotograma: mejor no multiplicarla ahí. */
const TAU = Math.PI * 2

/**
 * En cuántos grupos de brillo se reparten los nodos.
 *
 * **Es la decisión que hace que esto vaya fluido**, y conviene entenderla antes de tocarla. Un
 * campo de 1.700 nodos con un color propio cada uno son 1.700 cambios de `fillStyle` y 1.700
 * llamadas a `fill()` por fotograma; el navegador no puede agrupar nada porque el estado cambia
 * entre una y otra. Redondeando el brillo a doce escalones, todos los nodos de un escalón caben
 * en un único `Path2D` y el fotograma entero se pinta con **doce** llamadas.
 *
 * Doce y no seis porque por debajo se ve el escalón en el borde del halo del puntero, donde el
 * brillo cae despacio. Y no veinticuatro porque a partir de doce ya no se distingue y sólo son
 * más `Path2D` que crear.
 */
const BUCKETS = 12

/**
 * Radio y opacidad del nodo apagado y del nodo al máximo.
 *
 * **El mínimo se subió después de mirar la primera captura**, y merece la pena dejar dicho por
 * qué: con el nodo en reposo a 0,85 px y opacidad 0,14 el campo sólo existía alrededor del
 * puntero, y en un móvil —donde no hay puntero— la primera pantalla era negra con un chip. Un
 * fondo que sólo aparece si lo tocas no es interactivo, es invisible. El suelo tiene que verse
 * sin hacer nada; lo que la interacción añade es el relieve.
 */
const DOT_RADIUS = { min: 1, max: 2.9 }
const DOT_ALPHA = { min: 0.22, max: 0.95 }

/**
 * El latido de fondo: una onda diagonal lentísima que recorre el retículo.
 *
 * Sin ella el campo en reposo es una cuadrícula de puntos idénticos, que se lee como una textura
 * impresa y no como algo vivo. Con ella respira. La amplitud es deliberadamente ridícula —el
 * brillo se mueve entre 0,03 y 0,11— porque en cuanto se puede *seguir* la onda con la vista deja
 * de ser atmósfera y compite con el titular.
 */
const AMBIENT = { base: 0.13, wave: 0.06, speed: 0.5 }

/** Desplazamiento máximo de un nodo, en píxeles CSS: lo que se aparta del puntero. */
const PUSH = 15

/** A partir de qué brillo dos nodos vecinos se unen con un filete. */
const LINK_FROM = 0.24

/** La onda del clic: velocidad de expansión, grosor del frente y cuánto vive. */
const PULSE = { speed: 620, band: 105, life: 1.5, push: 11 }

/** El pulso que viaja por una fila o una columna: velocidad, cola y cabeza, en píxeles CSS. */
const BEAM = { speed: 880, trail: 230, head: 26 }

/** Cada cuánto sale un pulso, en segundos: un intervalo, no un reloj. */
const BEAM_EVERY = { min: 1.9, max: 4.4 }

/** Cuánto aguanta el puntero «vivo» sin moverse antes de cederle la escena a la luz autónoma. */
const IDLE_AFTER = 2.4

/**
 * Suavizado, en «cuánto se recorre por segundo» y no en un factor por fotograma.
 *
 * La diferencia importa: `valor += (destino - valor) * 0.12` avanza el doble en una pantalla de
 * 120 Hz que en una de 60, así que el mismo código se siente pastoso en un portátil y nervioso en
 * un monitor bueno. Con `1 - e^(-dt·k)` el recorrido depende del tiempo transcurrido y la
 * sensación es la misma en las dos.
 *
 * El brillo va más rápido que la posición a propósito: la luz tiene que llegar antes que la
 * materia, o el campo parece que se enciende **después** de haberse apartado.
 */
const EASE = { energy: 11, displacement: 7 }

/**
 * Separación entre nodos, en píxeles CSS.
 *
 * No es una preferencia estética: es lo que fija cuántos nodos hay que recorrer por fotograma. A
 * 24 px un móvil de 390×844 tiene ~570 nodos y un monitor de 1920×1080 tendría 3.600, que ya se
 * nota en un portátil integrado. Se abre la mano según el ancho para que el coste se mantenga en
 * la misma banda en los dos sitios, y de paso el retículo conserva la proporción: apretado en una
 * pantalla pequeña, amplio en una grande.
 */
function spacingFor(width: number) {
  if (width < 640) return 25
  if (width < 1280) return 29
  return 34
}

/**
 * Radio de influencia de una luz, en píxeles CSS.
 *
 * Se mide contra el lado corto de la ventana y no en un número fijo: 200 px es un pozo generoso
 * en un móvil y una mancha tímida en un monitor de 27 pulgadas.
 */
function radiusFor(width: number, height: number) {
  return Math.max(150, Math.min(320, Math.min(width, height) * 0.34))
}

/**
 * Leer un color del sistema de diseño en lugar de repetirlo aquí.
 *
 * Los tokens viven en el `@theme` de `globals.css` y Tailwind los emite como variables CSS reales
 * en `:root`, así que el lienzo puede preguntarlos. Escribir `#e0a458` en este archivo sería crear
 * el segundo sitio donde vive el cobre del proyecto, y esos dos sitios se desincronizan siempre.
 * El valor de reserva sólo entra si la variable no está: el lienzo no puede quedarse sin pintar
 * porque alguien renombre un token.
 */
function readColor(name: string, fallback: [number, number, number]): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!/^#[0-9a-f]{6}$/i.test(raw)) return fallback

  // Del `#` en adelante: el grupo de la expresión regular diría lo mismo, pero obligaría a
  // afirmar que existe.
  const value = Number.parseInt(raw.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function HeroField() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // --- Paleta ------------------------------------------------------------
    // Del apagado (gris de metadatos) al encendido (cobre). El nodo no cambia de color al
    // encenderse: recorre la misma rampa que recorre cualquier dato del sitio al volverse
    // importante, y por eso el campo pertenece a la página en vez de parecer un fondo comprado.
    const cold = readColor('--color-paper-faint', [109, 116, 124])
    const warm = readColor('--color-signal', [224, 164, 88])

    /**
     * Los doce escalones, calculados una vez.
     *
     * La rampa de color va a la potencia 0,6 y no lineal: el ojo distingue mucho mejor los saltos
     * en la zona apagada que en la encendida, así que repartir el cobre por igual deja los ocho
     * primeros escalones indistinguibles y los cuatro últimos a saltos.
     */
    const bucketFill: string[] = []
    const bucketRadius: number[] = []
    for (let b = 0; b < BUCKETS; b++) {
      const t = b / (BUCKETS - 1)
      const ramp = Math.pow(t, 0.6)
      const r = Math.round(cold[0] + (warm[0] - cold[0]) * ramp)
      const g = Math.round(cold[1] + (warm[1] - cold[1]) * ramp)
      const bl = Math.round(cold[2] + (warm[2] - cold[2]) * ramp)
      const alpha = DOT_ALPHA.min + (DOT_ALPHA.max - DOT_ALPHA.min) * t
      bucketFill.push(`rgba(${r},${g},${bl},${alpha.toFixed(3)})`)
      bucketRadius.push(DOT_RADIUS.min + (DOT_RADIUS.max - DOT_RADIUS.min) * t)
    }

    const linkColor = `rgba(${warm[0]},${warm[1]},${warm[2]},`

    /**
     * El halo de la luz, dibujado UNA VEZ en un lienzo aparte.
     *
     * Un degradado radial es de lo más caro que se le puede pedir a un contexto 2D, y hacen falta
     * dos por fotograma (el puntero y la luz autónoma). Pintado una sola vez en una textura de
     * 256 px y luego estampado con `drawImage`, el coste por fotograma pasa a ser el de copiar un
     * mapa de bits, que es lo que las tarjetas gráficas llevan haciendo bien desde hace treinta
     * años.
     */
    const halo = document.createElement('canvas')
    halo.width = 256
    halo.height = 256
    const haloCtx = halo.getContext('2d')
    if (haloCtx) {
      const gradient = haloCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, `rgba(${warm[0]},${warm[1]},${warm[2]},0.26)`)
      gradient.addColorStop(0.45, `rgba(${warm[0]},${warm[1]},${warm[2]},0.08)`)
      gradient.addColorStop(1, `rgba(${warm[0]},${warm[1]},${warm[2]},0)`)
      haloCtx.fillStyle = gradient
      haloCtx.fillRect(0, 0, 256, 256)
    }

    // --- Estado del campo --------------------------------------------------
    // Todo en `Float32Array` indexadas por `fila * columnas + columna`. No hay un objeto por
    // nodo: dos mil objetos que se recorren sesenta veces por segundo son dos mil saltos de
    // puntero por fotograma y un recolector de basura con trabajo constante. La posición de
    // reposo tampoco se guarda —el retículo es regular, así que se calcula— y eso son dos arrays
    // menos que recorrer.
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let spacing = 0
    let originX = 0
    let originY = 0
    let lightRadius = 0

    let energy = new Float32Array(0)
    let dispX = new Float32Array(0)
    let dispY = new Float32Array(0)
    let toEnergy = new Float32Array(0)
    let toX = new Float32Array(0)
    let toY = new Float32Array(0)
    let rowFade = new Float32Array(0)

    /** Dónde empieza el lienzo en la ventana. Se cachea: leerlo por evento fuerza un cálculo de
        maquetación, y el puntero dispara eventos a la velocidad del ratón. */
    let originLeft = 0
    let originTop = 0

    const pulses: Pulse[] = []
    const beams: Beam[] = []
    let untilBeam = 1.4

    const pointer = { x: 0, y: 0, weight: 0, want: 0, still: 0, seen: false }

    let clock = 0
    let frame = 0
    let previous = 0
    let onScreen = true
    let running = false

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motion = !reduced.matches

    // --- Geometría ---------------------------------------------------------

    const measure = () => {
      const box = host.getBoundingClientRect()
      originLeft = box.left
      originTop = box.top

      const nextWidth = Math.max(1, Math.round(box.width))
      const nextHeight = Math.max(1, Math.round(box.height))
      if (nextWidth === width && nextHeight === height) return

      width = nextWidth
      height = nextHeight

      // El ratio de píxel se topa en 2. En un móvil moderno vale 3, y multiplicar por nueve los
      // píxeles que hay que rellenar para dibujar puntos de dos píxeles de radio no se ve y sí se
      // nota en la batería.
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

      spacing = spacingFor(width)
      lightRadius = radiusFor(width, height)

      // Dos columnas y dos filas de más, y el retículo centrado: así el campo sangra por los
      // cuatro bordes y no se ve dónde termina. Un retículo que acaba justo en el borde de la
      // ventana se lee como una tabla; uno que se sale, como un material.
      cols = Math.ceil(width / spacing) + 3
      rows = Math.ceil(height / spacing) + 3
      originX = (width - (cols - 1) * spacing) / 2
      originY = (height - (rows - 1) * spacing) / 2

      const count = cols * rows
      energy = new Float32Array(count)
      dispX = new Float32Array(count)
      dispY = new Float32Array(count)
      toEnergy = new Float32Array(count)
      toX = new Float32Array(count)
      toY = new Float32Array(count)

      /**
       * EL DEGRADADO QUE PROTEGE EL TEXTO, Y ESTÁ EN EL ORIGEN.
       *
       * El bloque de texto se apoya en el borde de abajo del hero. En vez de dibujar el campo
       * entero y taparlo después con un velo —que es lo que hacía la versión de fotografías, y
       * costaba cuatro degradados coordinados—, aquí los nodos de la mitad inferior simplemente
       * se dibujan cada vez más apagados hasta desaparecer. Se calcula por fila, una vez, porque
       * es constante mientras no cambie el tamaño.
       *
       * El corte está en la mitad del alto: por encima, campo a plena potencia; por debajo, caída
       * rápida. Multiplica **también** al desplazamiento, y eso es lo que evita el efecto raro de
       * un nodo invisible que sigue apartándose.
       *
       * **No cae a cero, cae a un 10 %.** Con cero, la mitad inferior del hero era un rectángulo
       * negro perfecto y la frontera con el campo se notaba como un borde. Con el suelo, el
       * retículo sigue insinuándose hasta abajo —y donde de verdad estorbaría, a la altura de las
       * cifras, ya lo tapa el velo del texto, que ahí es grafito puro.
       */
      rowFade = new Float32Array(rows)
      for (let gy = 0; gy < rows; gy++) {
        const y = (originY + gy * spacing) / height
        const t = (y - 0.5) / 0.42
        rowFade[gy] = t <= 0 ? 1 : t >= 1 ? 0.1 : 0.1 + 0.9 * (1 - t) * (1 - t)
      }
    }

    // --- Fuerzas -----------------------------------------------------------

    /**
     * Una luz: aparta y enciende los nodos que tiene alrededor.
     *
     * El recorrido se limita al rectángulo que ocupa la luz —de la columna que le queda a la
     * izquierda a la que le queda a la derecha— en vez de preguntar a los dos mil nodos si están
     * cerca. Es la diferencia entre tocar doscientos nodos y recorrer el campo entero por cada
     * fuente, y con la onda del clic y los pulsos por fila la cuenta se multiplica.
     */
    const light = (cx: number, cy: number, radius: number, strength: number, push: number) => {
      if (strength <= 0.001) return

      const from = Math.max(0, Math.floor((cx - radius - originX) / spacing))
      const to = Math.min(cols - 1, Math.ceil((cx + radius - originX) / spacing))
      const top = Math.max(0, Math.floor((cy - radius - originY) / spacing))
      const bottom = Math.min(rows - 1, Math.ceil((cy + radius - originY) / spacing))
      const radius2 = radius * radius

      for (let gy = top; gy <= bottom; gy++) {
        const dy = originY + gy * spacing - cy
        const base = gy * cols
        for (let gx = from; gx <= to; gx++) {
          const dx = originX + gx * spacing - cx
          const distance2 = dx * dx + dy * dy
          if (distance2 > radius2) continue

          const distance = Math.sqrt(distance2)
          // Al cuadrado y no lineal: una caída lineal deja un borde circular perfectamente
          // legible alrededor del puntero, y lo que se busca es una luz, no una linterna.
          const fall = 1 - distance / radius
          const power = fall * fall * strength

          const index = base + gx
          toEnergy[index] = toEnergy[index]! + power
          if (distance > 0.001) {
            const scale = (power * push) / distance
            toX[index] = toX[index]! + dx * scale
            toY[index] = toY[index]! + dy * scale
          }
        }
      }
    }

    /**
     * La onda del clic: lo mismo, pero la fuerza no vive en el centro sino en un anillo que se
     * abre. Se recorre el rectángulo del anillo entero —descartar el hueco de dentro obligaría a
     * partirlo en cuatro trozos, y a este tamaño no compensa.
     */
    const pulse = (x: number, y: number, age: number) => {
      const radius = age * PULSE.speed
      const fade = Math.max(0, 1 - age / PULSE.life)
      if (fade <= 0) return

      const reach = radius + PULSE.band
      const from = Math.max(0, Math.floor((x - reach - originX) / spacing))
      const to = Math.min(cols - 1, Math.ceil((x + reach - originX) / spacing))
      const top = Math.max(0, Math.floor((y - reach - originY) / spacing))
      const bottom = Math.min(rows - 1, Math.ceil((y + reach - originY) / spacing))

      for (let gy = top; gy <= bottom; gy++) {
        const dy = originY + gy * spacing - y
        const base = gy * cols
        for (let gx = from; gx <= to; gx++) {
          const dx = originX + gx * spacing - x
          const distance = Math.sqrt(dx * dx + dy * dy)
          const offset = Math.abs(distance - radius)
          if (offset > PULSE.band) continue

          const fall = 1 - offset / PULSE.band
          const power = fall * fall * fade
          const index = base + gx
          toEnergy[index] = toEnergy[index]! + power * 1.2
          if (distance > 0.001) {
            const scale = (power * PULSE.push) / distance
            toX[index] = toX[index]! + dx * scale
            toY[index] = toY[index]! + dy * scale
          }
        }
      }
    }

    /**
     * El pulso que viaja por una fila o una columna.
     *
     * Toca **una sola línea** del retículo, así que es la fuerza más barata de las tres, y es la
     * que más dice: un punto de luz que recorre un carril recto y deja estela se lee como un dato
     * moviéndose por un bus. Es la pieza que convierte la retícula en algo que *hace* algo.
     */
    const beam = (item: Beam) => {
      const along = item.axis === 0 ? cols : rows
      const origin = item.axis === 0 ? originX : originY
      const back = item.dir > 0 ? item.pos - BEAM.trail : item.pos - BEAM.head
      const front = item.dir > 0 ? item.pos + BEAM.head : item.pos + BEAM.trail
      const from = Math.max(0, Math.floor((back - origin) / spacing))
      const to = Math.min(along - 1, Math.ceil((front - origin) / spacing))

      for (let step = from; step <= to; step++) {
        // Distancia POR DETRÁS de la cabeza: negativa delante (el pequeño halo que la precede),
        // positiva en la estela.
        const behind = (origin + step * spacing - item.pos) * -item.dir
        if (behind < -BEAM.head || behind > BEAM.trail) continue

        const fall = behind < 0 ? 1 + behind / BEAM.head : 1 - behind / BEAM.trail
        const index = item.axis === 0 ? item.line * cols + step : step * cols + item.line
        toEnergy[index] = toEnergy[index]! + fall * fall * 1.3
      }
    }

    // --- Dibujo ------------------------------------------------------------

    const draw = (delta: number) => {
      // Los destinos se recalculan enteros cada fotograma: son la suma de fuerzas de ESTE
      // instante, no un estado que se arrastra. Lo que se arrastra —y por eso el campo tiene
      // inercia— es `energy` y `disp`, que persiguen a estos con retraso.
      toEnergy.fill(0)
      toX.fill(0)
      toY.fill(0)

      // La luz del puntero y la autónoma se reparten la escena: cuando una sube, la otra baja.
      // No es una transición entre dos modos, es una mezcla, y por eso al mover el ratón después
      // de un rato quieto no hay salto — la luz de nadie se apaga mientras la tuya se enciende.
      light(pointer.x, pointer.y, lightRadius, pointer.weight, PUSH)

      const drift = 1 - pointer.weight
      if (drift > 0.001) {
        // Lissajous con dos frecuencias que no son múltiplo una de la otra: el recorrido no se
        // cierra nunca sobre sí mismo y no se le ve el bucle.
        const x = width * (0.5 + 0.33 * Math.sin(clock * 0.11))
        const y = height * (0.36 + 0.26 * Math.sin(clock * 0.157 + 1.1))
        light(x, y, lightRadius * 1.1, drift * 0.85, PUSH * 0.8)
      }

      for (const item of pulses) pulse(item.x, item.y, item.age)
      for (const item of beams) beam(item)

      ctx.clearRect(0, 0, width, height)

      // Un `Path2D` por escalón de brillo. Se crean por fotograma a propósito: reutilizarlos
      // exigiría poder vaciarlos, y `Path2D` no tiene forma de vaciarse. Doce objetos por
      // fotograma es ruido para el recolector; dos mil, no lo sería.
      const paths: Path2D[] = []
      for (let b = 0; b < BUCKETS; b++) paths.push(new Path2D())

      // Cuánto se recorre hacia el destino en este fotograma. Depende del tiempo transcurrido,
      // no del número de fotogramas: ver `EASE`.
      const catchEnergy = 1 - Math.exp(-delta * EASE.energy)
      const catchDisplacement = 1 - Math.exp(-delta * EASE.displacement)

      for (let gy = 0; gy < rows; gy++) {
        const base = gy * cols
        const y0 = originY + gy * spacing
        const fade = rowFade[gy]!

        for (let gx = 0; gx < cols; gx++) {
          const index = base + gx
          const x0 = originX + gx * spacing

          const ambient =
            AMBIENT.base + AMBIENT.wave * Math.sin(x0 * 0.013 + y0 * 0.019 + clock * AMBIENT.speed)
          let target = (toEnergy[index]! + ambient) * fade
          if (target > 1) target = 1

          const level = energy[index]! + (target - energy[index]!) * catchEnergy
          energy[index] = level
          dispX[index] = dispX[index]! + (toX[index]! * fade - dispX[index]!) * catchDisplacement
          dispY[index] = dispY[index]! + (toY[index]! * fade - dispY[index]!) * catchDisplacement

          // Por debajo de esto el nodo no se distingue del fondo: sale del dibujo y se ahorran
          // un `arc` y un `moveTo`. En la mitad inferior de la pantalla eso es casi la mitad del
          // campo.
          if (level < 0.014) continue

          let bucket = (level * BUCKETS) | 0
          if (bucket >= BUCKETS) bucket = BUCKETS - 1

          const radius = bucketRadius[bucket]!
          const path = paths[bucket]!
          const x = x0 + dispX[index]!
          const y = y0 + dispY[index]!
          // El `moveTo` antes del `arc` no es adorno: sin él, el arco se une con una recta al
          // último punto del camino y el campo sale cosido con hilos rectos entre nodos.
          path.moveTo(x + radius, y)
          path.arc(x, y, radius, 0, TAU)
        }
      }

      /**
       * LOS FILETES ENTRE NODOS, Y POR QUÉ SÓLO EXISTEN DONDE HAY LUZ.
       *
       * Una constelación dibujada por todo el campo es el fondo de partículas que lleva quince
       * años en todas las plantillas: bonito el primer segundo, indistinguible del ruido el
       * segundo. Aquí la retícula está siempre ahí pero **la estructura sólo se revela donde
       * apuntas**, y eso convierte el fondo en algo que el visitante descubre en vez de mirar.
       *
       * Se recorre el campo entero comprobando un número por nodo, que es más barato que calcular
       * los rectángulos de las luces y sus solapes. Sólo se une con el vecino de la derecha y con
       * el de abajo: unir también en diagonal duplica los filetes y tapa los nodos, y unir con el
       * de la izquierda y el de arriba dibujaría cada filete dos veces.
       */
      const links: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
      for (let gy = 0; gy < rows; gy++) {
        const base = gy * cols
        for (let gx = 0; gx < cols; gx++) {
          const index = base + gx
          const level = energy[index]!
          if (level < LINK_FROM) continue

          const x = originX + gx * spacing + dispX[index]!
          const y = originY + gy * spacing + dispY[index]!

          for (let side = 0; side < 2; side++) {
            const other =
              side === 0 ? (gx + 1 < cols ? index + 1 : -1) : gy + 1 < rows ? index + cols : -1
            if (other < 0) continue

            const otherLevel = energy[other]!
            if (otherLevel < LINK_FROM) continue

            const strength = (Math.min(level, otherLevel) - LINK_FROM) / (1 - LINK_FROM)
            let step = (strength * links.length) | 0
            if (step >= links.length) step = links.length - 1

            const ox = side === 0 ? gx + 1 : gx
            const oy = side === 0 ? gy : gy + 1
            const link = links[step]!
            link.moveTo(x, y)
            link.lineTo(
              originX + ox * spacing + dispX[other]!,
              originY + oy * spacing + dispY[other]!,
            )
          }
        }
      }

      ctx.lineWidth = 0.75
      for (let step = 0; step < links.length; step++) {
        ctx.strokeStyle = `${linkColor}${(0.05 + step * 0.055).toFixed(3)})`
        ctx.stroke(links[step]!)
      }

      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = bucketFill[b]!
        ctx.fill(paths[b]!)
      }

      // El rastro del pulso, encima de los nodos: es lo que lo convierte en una traza y no en una
      // fila de puntos que se encienden por turno.
      ctx.lineWidth = 1
      for (const item of beams) {
        const headX = item.axis === 0 ? item.pos : originX + item.line * spacing
        const headY = item.axis === 0 ? originY + item.line * spacing : item.pos
        const tailX = item.axis === 0 ? item.pos - item.dir * BEAM.trail : headX
        const tailY = item.axis === 0 ? headY : item.pos - item.dir * BEAM.trail
        const fade = item.axis === 0 ? rowFade[item.line]! : 1
        if (fade <= 0.02) continue

        const trace = ctx.createLinearGradient(tailX, tailY, headX, headY)
        trace.addColorStop(0, `${linkColor}0)`)
        trace.addColorStop(1, `${linkColor}${(0.45 * fade).toFixed(3)})`)
        ctx.strokeStyle = trace
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
      }

      // Los halos, en modo aditivo y al final: la luz se SUMA a lo que ya hay debajo, que es lo
      // que hace que los nodos encendidos parezcan estar dentro del resplandor en vez de tener
      // un cristal naranja delante.
      if (haloCtx) {
        ctx.globalCompositeOperation = 'lighter'
        const size = lightRadius * 3.4
        if (pointer.weight > 0.01) {
          ctx.globalAlpha = pointer.weight
          ctx.drawImage(halo, pointer.x - size / 2, pointer.y - size / 2, size, size)
        }
        if (drift > 0.01) {
          const x = width * (0.5 + 0.33 * Math.sin(clock * 0.11))
          const y = height * (0.36 + 0.26 * Math.sin(clock * 0.157 + 1.1))
          ctx.globalAlpha = drift * 0.85
          ctx.drawImage(halo, x - size / 2, y - size / 2, size, size)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    // --- El bucle ----------------------------------------------------------

    const step = (now: number) => {
      // El primer fotograma no tiene «anterior», y un salto de pestaña puede dejar un hueco de
      // varios segundos. Se topa en 1/20 s: sin el tope, la onda del clic recorrería media
      // pantalla de golpe al volver a la pestaña.
      const delta = previous ? Math.min(0.05, (now - previous) / 1000) : 1 / 60
      previous = now
      clock += delta

      pointer.still += delta
      if (pointer.still > IDLE_AFTER) pointer.want = 0
      pointer.weight += (pointer.want - pointer.weight) * (1 - Math.exp(-delta * 3))

      for (let i = pulses.length - 1; i >= 0; i--) {
        const item = pulses[i]!
        item.age += delta
        if (item.age > PULSE.life) pulses.splice(i, 1)
      }

      untilBeam -= delta
      if (untilBeam <= 0) {
        untilBeam = BEAM_EVERY.min + Math.random() * (BEAM_EVERY.max - BEAM_EVERY.min)
        const axis: 0 | 1 = Math.random() < 0.62 ? 0 : 1
        const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1
        // En horizontal el carril se sortea sólo en la mitad de arriba: abajo el campo está
        // apagado y el pulso saldría cruzando el bloque de texto.
        const line =
          axis === 0
            ? Math.floor(Math.random() * Math.max(1, rows * 0.45))
            : Math.floor(Math.random() * cols)
        const span = axis === 0 ? width : height
        beams.push({ axis, line, pos: dir > 0 ? -BEAM.trail : span + BEAM.trail, dir })
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const item = beams[i]!
        item.pos += item.dir * BEAM.speed * delta
        const span = item.axis === 0 ? width : height
        if (item.pos > span + BEAM.trail || item.pos < -BEAM.trail) beams.splice(i, 1)
      }

      draw(delta)
      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (running || !motion || !onScreen || document.hidden) return
      running = true
      previous = 0
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    // --- Entradas ----------------------------------------------------------

    /**
     * El puntero se escucha en `window` y no en el hero, y ésa es la única forma de que esto
     * funcione: el lienzo tiene `pointer-events: none` —no puede robarle un clic a un botón—, así
     * que nunca recibiría un evento propio. Se traduce a coordenadas del lienzo y se descarta lo
     * que cae fuera, que es lo mismo que habría hecho el navegador pero sin ponerse en medio.
     */
    const onMove = (event: PointerEvent) => {
      const x = event.clientX - originLeft
      const y = event.clientY - originTop
      if (x < 0 || y < 0 || x > width || y > height) {
        pointer.want = 0
        return
      }

      // La primera vez se coloca sin inercia. Si no, la luz sale del rincón donde se quedó y
      // cruza la pantalla hasta el cursor: un efecto llamativo que nadie ha pedido y que apunta
      // a que el fondo tiene estado.
      if (!pointer.seen) {
        pointer.seen = true
        pointer.x = x
        pointer.y = y
      }

      pointer.x = x
      pointer.y = y
      pointer.want = 1
      pointer.still = 0
    }

    const onLeave = () => {
      pointer.want = 0
    }

    const onPress = (event: PointerEvent) => {
      const x = event.clientX - originLeft
      const y = event.clientY - originTop
      if (x < 0 || y < 0 || x > width || y > height) return

      // Tres ondas a la vez ya no se distinguen y multiplican el trabajo por fotograma.
      if (pulses.length >= 3) pulses.shift()
      pulses.push({ x, y, age: 0 })

      // En una pantalla táctil no hay `pointermove` previo: el toque es también lo que enciende
      // la luz. Sin esto, la onda sale de un sitio a oscuras.
      pointer.x = x
      pointer.y = y
      pointer.want = 1
      pointer.still = 0
      pointer.seen = true
    }

    const onScroll = () => {
      const box = host.getBoundingClientRect()
      originLeft = box.left
      originTop = box.top
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    /**
     * Un fotograma y nada más: es lo que ve quien ha pedido menos movimiento.
     *
     * Se dibuja con el suavizado al máximo (`delta` grande) para que los nodos aparezcan ya en su
     * sitio y con su brillo, en vez de en el 12 % del camino. El resultado es la retícula en
     * reposo: un material, no una animación congelada.
     */
    const paintStill = () => {
      pointer.weight = 0
      draw(1)
    }

    const onMotionChange = () => {
      motion = !reduced.matches
      stop()
      if (motion) start()
      else paintStill()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        onScreen = entry.isIntersecting
        if (onScreen) start()
        else stop()
      },
      // Un margen generoso: reanudar el bucle justo en el píxel en el que el hero reaparece deja
      // ver el primer fotograma sin inercia al volver arriba.
      { rootMargin: '120px' },
    )

    const resize = new ResizeObserver(() => {
      measure()
      if (!motion) paintStill()
    })

    measure()

    if (motion) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onPress, { passive: true })
      window.addEventListener('pointerleave', onLeave)
      window.addEventListener('scroll', onScroll, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
      observer.observe(host)
      resize.observe(host)
      start()
    } else {
      resize.observe(host)
      paintStill()
    }

    reduced.addEventListener('change', onMotionChange)

    return () => {
      stop()
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onPress)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div ref={hostRef} className="hero-field" aria-hidden="true">
      {/* La atmósfera, en CSS y debajo del lienzo: dos manchas de cobre desenfocadas que respiran.
          Van aquí y no en el canvas porque un desenfoque de este tamaño lo hace el compositor
          gratis y en el lienzo costaría un degradado enorme por fotograma. */}
      <div className="hero-field__aurora" />

      {/* La retícula de planos, estática: dos juegos de líneas de un píxel a opacidad casi nula,
          con una máscara que las desvanece antes de llegar al texto. Es lo que le da al campo un
          suelo sobre el que apoyarse — sin ella los nodos flotan en negro y el conjunto se lee
          como un salvapantallas. */}
      <div className="hero-field__grid" />

      <canvas ref={canvasRef} className="hero-field__canvas" />

      {/* El velo. Mucho más ligero que el del mosaico de fotografías: aquí el campo ya se apaga
          solo hacia abajo, así que esto sólo tiene dos trabajos — proteger la franja de la
          cabecera fija, que es translúcida, y coser el borde de abajo con la sección siguiente. */}
      <div className="hero-field__scrim" />
    </div>
  )
}
