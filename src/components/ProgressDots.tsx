export function ProgressDots({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="lb-progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < step ? 'active' : ''} />
      ))}
    </div>
  )
}
