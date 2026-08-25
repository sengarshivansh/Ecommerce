import { useEffect, useState, type FormEvent } from "react";
import { createCategory, listCategories } from "@/api/categories";
import type { Category } from "@/types";
import { AdminTabs } from "@/components/AdminTabs";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listCategories().then(setCategories).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createCategory(name);
      setName("");
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
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-fit">
          <CardBody>
            <h2 className="mb-3 font-semibold">New category</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Create"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardBody>
              <h2 className="mb-3 font-semibold">Categories ({categories.length})</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-slate-500">No categories yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <li key={c.id} className="flex justify-between py-2 text-sm">
                      <span>{c.name}</span>
                      <span className="text-slate-400">#{c.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
