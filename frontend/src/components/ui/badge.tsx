import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Maps an order status to a colour so the UI reads at a glance.
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string;
}

export function Badge({ className, status, children, ...props }: BadgeProps) {
  const color = status ? (statusColors[status] ?? "bg-slate-100 text-slate-700") : "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        color,
        className,
      )}
      {...props}
    >
      {children ?? status}
    </span>
  );
}
