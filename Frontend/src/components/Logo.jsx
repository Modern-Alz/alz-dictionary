export default function Logo({ size = 36, withText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/favicon.svg" alt="" width={size} height={size} className="rounded-xl shadow-soft" />
      {withText && (
        <span className="font-display text-xl font-semibold tracking-tight text-ink-700 dark:text-ink-50">
          ALZ <span className="text-azure-500 dark:text-gilt-300">Dictionary</span>
        </span>
      )}
    </div>
  );
}
