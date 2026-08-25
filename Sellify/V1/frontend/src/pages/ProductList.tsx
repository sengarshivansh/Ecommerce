import { useEffect, useState } from "react";
import { listProducts, type ProductQuery } from "@/api/products";
import { listCategories } from "@/api/categories";
import type { Category, Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";

const LIMIT = 8;

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state. `searchInput` is what the user types; `filters.search` is
  // what we actually query with (updated when they submit, to avoid a request
  // on every keystroke).
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<ProductQuery>({ page: 1, limit: LIMIT });

  // Load categories once for the filter dropdown.
  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  // Re-fetch products whenever filters change.
  useEffect(() => {
    setLoading(true);
    setError(null);
    listProducts(filters)
      .then((res) => setProducts(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  function update(partial: Partial<ProductQuery>) {
    // Any filter change resets to page 1 unless we're explicitly paging.
    setFilters((f) => ({ ...f, page: 1, ...partial }));
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Shop</h1>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchInput || undefined });
          }}
        >
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={filters.category_id ?? ""}
          onChange={(e) =>
            update({ category_id: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          value={filters.sort ?? ""}
          onChange={(e) =>
            update({ sort: (e.target.value || undefined) as ProductQuery["sort"] })
          }
        >
          <option value="">Sort</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <PageSpinner />
      ) : error ? (
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={(filters.page ?? 1) <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-500">Page {filters.page ?? 1}</span>
        <Button
          variant="outline"
          size="sm"
          // The list endpoint doesn't return a total count, so we just disable
          // "Next" when the current page came back not full.
          disabled={products.length < LIMIT}
          onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
