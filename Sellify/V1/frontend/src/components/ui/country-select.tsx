import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

/**
 * A searchable country picker.
 *
 * A native <select> cannot be searched by country name here, because the only
 * text it shows is the flag and dial code. So this is a combobox: a button that
 * opens a panel containing a search box and a filtered list.
 *
 * Keyboard: ArrowUp/ArrowDown move the highlight, Enter selects, Escape closes.
 */
export function CountrySelect({
  value,
  onChange,
  className,
}: {
  /** ISO alpha-2 code of the selected country. */
  value: string;
  onChange: (code: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    // Match on name ("ind"), dial code ("+91" or "91") or ISO code ("in").
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.replace("+", "").startsWith(q.replace("+", "")) ||
        c.code.toLowerCase() === q,
    );
  }, [query]);

  // Close when the user clicks anywhere outside the component.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Focus the search box as soon as the panel opens.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)?.scrollIntoView({
      block: "nearest",
    });
  }, [highlight]);

  function choose(country: Country) {
    onChange(country.code);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault(); // don't submit the surrounding form
      if (results[highlight]) choose(results[highlight]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Country: ${selected.name}`}
        onClick={() => {
          setOpen((o) => !o);
          setHighlight(0);
        }}
        className={cn(
          "flex h-10 w-full items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        )}
      >
        <span>{selected.flag}</span>
        <span className="tabular-nums">{selected.dial}</span>
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-200 px-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search country"
              aria-label="Search country"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <ul ref={listRef} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {results.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">No country matches “{query}”</li>
            )}
            {results.map((c, i) => (
              <li key={c.code} data-index={i}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.code === value}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(c)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm",
                    i === highlight && "bg-slate-100",
                  )}
                >
                  <span>{c.flag}</span>
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto tabular-nums text-slate-500">{c.dial}</span>
                  {c.code === value && <Check className="h-4 w-4 shrink-0 text-brand" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
