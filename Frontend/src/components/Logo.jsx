/**
 * ALZ Dictionary — Logo component
 * Shows the real app icon (favicon.svg) + "ALZ Dictionary" wordmark side by side.
 * The icon is the same navy/gold book+spark SVG used everywhere.
 */
export default function Logo({ size = 36, withText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Real app icon — matches the favicon / Play Store icon */}
      <img
        src="/icon-128.png"
        alt="ALZ Dictionary logo"
        width={size}
        height={size}
        className="shrink-0 rounded-xl shadow-soft"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling?.style.removeProperty('display');
        }}
      />
      {/* Fallback initials badge (hidden unless SVG fails) */}
      <div
        style={{ display: 'none', width: size, height: size }}
        className="shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 text-cream-50 font-display font-bold shadow-glow-blue"
      >
        <span style={{ fontSize: size * 0.38 }}>A</span>
      </div>

      {withText && (
        <span className="font-display font-semibold tracking-tight text-ink-700 dark:text-ink-50"
              style={{ fontSize: Math.max(14, size * 0.52) }}>
          ALZ{' '}
          <span className="text-azure-500 dark:text-gilt-300">Dictionary</span>
        </span>
      )}
    </div>
  );
}
