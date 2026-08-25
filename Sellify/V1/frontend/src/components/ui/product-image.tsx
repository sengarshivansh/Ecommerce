import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A product photo with a graceful fallback.
 *
 * `image_url` is nullable on the backend, and even when it is set the image can
 * fail to load — an external host goes away, a path is mistyped. Either way we
 * fall back to the coloured initial rather than showing a broken-image icon,
 * which looks worse than having no photo at all.
 *
 * Paths beginning with "/" are served by this site (see public/products/);
 * absolute URLs point at an external host. Both work without special handling.
 */
export function ProductImage({
  src,
  name,
  className,
  fallbackTextClass = "text-3xl",
}: {
  src: string | null | undefined;
  /** Used for the alt text and to pick the fallback letter. */
  name: string;
  className?: string;
  fallbackTextClass?: string;
}) {
  const [failed, setFailed] = useState(false);

  // A different product may reuse this component instance, so clear the error.
  useEffect(() => setFailed(false), [src]);

  const showFallback = !src || failed;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200",
        className,
      )}
    >
      {showFallback ? (
        <span className={cn("font-bold text-slate-400", fallbackTextClass)}>
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
