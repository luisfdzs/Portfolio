import { useEffect, useState } from 'react'

export function useRevealKey() {
  const [key, setKey] = useState(0)

  useEffect(() => () => setKey((current) => current + 1), [])

  return key
}
