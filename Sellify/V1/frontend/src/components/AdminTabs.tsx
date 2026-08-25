import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
];

export function AdminTabs() {
  return (
    <div className="mb-6 flex gap-1 border-b border-slate-200">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
