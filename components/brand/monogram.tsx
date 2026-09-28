import { ImageResponse } from 'next/og'

export function monogramImage(side: number) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090b',
        color: '#e0a458',
        fontSize: Math.round(side * 0.58),
        fontWeight: 900,
        letterSpacing: '-0.06em',
      }}
    >
      LF
    </div>,
    { width: side, height: side },
  )
}
