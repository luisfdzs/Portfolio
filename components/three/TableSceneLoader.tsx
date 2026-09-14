'use client'

import dynamic from 'next/dynamic'

const TableScene = dynamic(() => import('@/components/three/TableScene').then((mod) => mod.TableScene), {
  ssr: false,
})

export function TableSceneLoader() {
  return <TableScene />
}
