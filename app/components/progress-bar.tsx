export default function ProgressBar({
  fillPercent,
  over,
  pacePercent,
  thin = false,
}: {
  fillPercent: number;
  over: boolean;
  pacePercent?: number;
  thin?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, fillPercent));
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full ${
        thin ? "h-1.5" : "h-2"
      } ${over ? "bg-clay-ghost" : "bg-green-ghost"}`}
    >
      <div
        className={`h-full rounded-full ${over ? "bg-clay-fill" : "bg-green-fill"}`}
        style={{ width: `${clamped}%` }}
      />
      {pacePercent !== undefined && (
        <div
          className="absolute top-0 h-full w-px bg-text-primary/30"
          style={{ left: `${Math.max(0, Math.min(100, pacePercent))}%` }}
        />
      )}
    </div>
  );
}
