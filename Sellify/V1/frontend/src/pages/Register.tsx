import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { CountrySelect } from "@/components/ui/country-select";

// The phone number is rendered separately (country picker + digits), so it is
// not in these lists.
const FIELDS_BEFORE_PHONE = [
  { name: "username", label: "Username", type: "text" },
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "email", label: "Email", type: "email" },
] as const;

const FIELDS_AFTER_PHONE = [
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
    password: "",
  });

  // The country picker and the digits are held apart, then joined into the
  // E.164 string the backend expects (e.g. "+91" + "9876543210").
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "+91";
  const e164 = `${dial}${nationalNumber}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ ...form, phone_number: e164 });
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
            {FIELDS_BEFORE_PHONE.map((f) => (
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

            <div>
              <Label htmlFor="phone_number">Phone number</Label>
              <div className="flex gap-2">
                <CountrySelect
                  className="w-28 shrink-0"
                  value={country}
                  onChange={setCountry}
                />
                <Input
                  id="phone_number"
                  className="min-w-0 flex-1"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="9876543210"
                  value={nationalNumber}
                  // Keep only digits: the country code supplies the "+", and the
                  // backend rejects anything it cannot parse as E.164.
                  onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              {nationalNumber && (
                <p className="mt-1 text-xs text-slate-500">Will be saved as {e164}</p>
              )}
            </div>

            {FIELDS_AFTER_PHONE.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  minLength={8}
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
