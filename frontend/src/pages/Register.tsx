import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const FIELDS = [
  { name: "username", label: "Username", type: "text" },
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone_number", label: "Phone number", type: "text" },
  { name: "password", label: "Password", type: "password" },
] as const;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <Card>
        <CardBody>
          <h1 className="mb-4 text-xl font-bold">Create account</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  required
                />
              </div>
            ))}
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
