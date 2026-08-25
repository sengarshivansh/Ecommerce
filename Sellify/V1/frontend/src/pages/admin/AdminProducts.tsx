import { useEffect, useState, type FormEvent } from "react";
import { createProduct, listProducts } from "@/api/products";
import { listCategories } from "@/api/categories";
import type { Category, Product } from "@/types";
import { AdminTabs } from "@/components/AdminTabs";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const EMPTY = {
  name: "",
  description: "",
  price: "",
  discounted_price: "",
  stock: "",
  category_id: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listProducts({ limit: 50 }).then((r) => setProducts(r.data)).catch((e) => setError(e.message));
  }

  useEffect(() => {
    refresh();
    listCategories().then(setCategories).catch(() => {});
  }, []);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discounted_price: form.discounted_price ? Number(form.discounted_price) : null,
        stock: Number(form.stock),
        category_id: Number(form.category_id),
      });
      setForm({ ...EMPTY });
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AdminTabs />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardBody>
            <h2 className="mb-3 font-semibold">New product</h2>
            {categories.length === 0 && (
              <p className="mb-3 rounded bg-amber-50 p-2 text-xs text-amber-800">
                Create a category first — products need one.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discounted_price">Discount price</Label>
                  <Input
                    id="discounted_price"
                    type="number"
                    value={form.discounted_price}
                    onChange={(e) => set("discounted_price", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Create product"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold">Products ({products.length})</h2>
              {products.length === 0 ? (
                <p className="text-sm text-slate-500">No products yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 text-right font-medium">Price</th>
                      <th className="pb-2 text-right font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-right">{formatPrice(p.price)}</td>
                        <td className="py-2 text-right">{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
