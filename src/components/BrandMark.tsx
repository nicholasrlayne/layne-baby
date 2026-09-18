export function BrandMark({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const dot = size === 'lg' ? 18 : 12
  const wordSize = size === 'lg' ? 44 : 28
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, ${dot}px)`, gap: dot * 0.3 }}>
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: 'var(--track-feed-fill)' }} />
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: 'var(--track-pump-fill)' }} />
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: 'var(--track-diaper-fill)' }} />
        <span style={{ width: dot, height: dot, borderRadius: '50%', background: 'var(--track-sleep-fill)' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="serif" style={{ fontSize: wordSize, lineHeight: 1.05, color: 'var(--text-primary)' }}>Layne</div>
        <div className="sans" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.36em', textTransform: 'uppercase', color: 'var(--track-feed-ink)', paddingLeft: '.36em' }}>
          baby
        </div>
      </div>
    </div>
  )
}
