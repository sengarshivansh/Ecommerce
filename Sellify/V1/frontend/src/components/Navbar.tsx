import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Package, LayoutDashboard, LogOut, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
      isActive ? "bg-slate-100 text-brand" : "text-slate-600 hover:bg-slate-100",
    );

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          <Store className="h-5 w-5" />
          Sellify
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            Shop
          </NavLink>

          {user && (
            <>
              <NavLink to="/cart" className={linkClass}>
                <ShoppingCart className="h-4 w-4" />
                Cart
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                <Package className="h-4 w-4" />
                Orders
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin/products" className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </NavLink>
          )}

          <div className="ml-2 flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
