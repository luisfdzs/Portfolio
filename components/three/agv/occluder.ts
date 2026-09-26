import { NoBlending, Points, ShaderMaterial, type BufferGeometry } from 'three'

export function occluder(geometry: BufferGeometry, source: ShaderMaterial) {
  const material = new ShaderMaterial({
    uniforms: source.uniforms,
    vertexShader: source.vertexShader,
    fragmentShader: source.fragmentShader,
    defines: { OCCLUDE: '' },
    colorWrite: false,
    depthWrite: true,
    blending: NoBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  return { points, material }
}
