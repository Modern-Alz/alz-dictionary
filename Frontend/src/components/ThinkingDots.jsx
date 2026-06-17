export default function ThinkingDots({ label = 'ALZ is thinking' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-300">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-dot-bounce rounded-full bg-azure-400 [animation-delay:-0.32s]" />
        <span className="h-2 w-2 animate-dot-bounce rounded-full bg-gilt-400 [animation-delay:-0.16s]" />
        <span className="h-2 w-2 animate-dot-bounce rounded-full bg-azure-400" />
      </span>
      <span>{label}</span>
    </div>
  );
}
