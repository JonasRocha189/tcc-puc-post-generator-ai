import { cn } from "@/utils";

/** Marca do PostPilot. `iconOnly` para o menu lateral recolhido. */
export default function Logo({
  iconOnly = false,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
        P
      </span>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          PostPilot
        </span>
      )}
    </span>
  );
}
