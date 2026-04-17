import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Lock, Copy, Check, Info, Landmark } from "lucide-react";
import type { AffiliateData } from "@/hooks/useAffiliate";

interface AffiliateSettingsProps {
  affiliate: AffiliateData;
  onUpdate: (fields: Partial<AffiliateData>) => Promise<void>;
  startInEdit?: boolean;
}

type FormErrors = Partial<Record<"iban" | "vat_number" | "kvk_number", string>>;

const IBAN_REGEX = /^[A-Z]{2}[0-9A-Z]{13,32}$/;
const VAT_NL_REGEX = /^NL\d{9}B\d{2}$/;
// Generic EU VAT (country code + 8-12 alphanumeric)
const VAT_EU_REGEX = /^[A-Z]{2}[0-9A-Z]{8,12}$/;
const KVK_REGEX = /^\d{8}$/;

function validateField(name: keyof FormErrors, raw: string): string | undefined {
  const value = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (name === "iban") {
    if (!value) return "Please enter a valid IBAN number";
    if (!IBAN_REGEX.test(value)) return "Please enter a valid IBAN number";
    return;
  }
  if (name === "vat_number") {
    if (!value) return; // optional
    if (!VAT_NL_REGEX.test(value) && !VAT_EU_REGEX.test(value)) {
      return "Please enter a valid VAT number (e.g., NL123456789B01)";
    }
    return;
  }
  if (name === "kvk_number") {
    if (!value) return; // optional
    if (!KVK_REGEX.test(value)) return "KVK number must be 8 digits";
    return;
  }
}

export function AffiliateSettings({ affiliate, onUpdate, startInEdit = false }: AffiliateSettingsProps) {
  const [editing, setEditing] = useState(startInEdit);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    iban: affiliate.iban || "",
    company_name: affiliate.company_name || "",
    kvk_number: affiliate.kvk_number || "",
    vat_number: affiliate.vat_number || "",
    billing_address: affiliate.billing_address || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (startInEdit) setEditing(true);
  }, [startInEdit]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(affiliate.affiliate_code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const validateAll = (): boolean => {
    const next: FormErrors = {
      iban: validateField("iban", form.iban),
      vat_number: validateField("vat_number", form.vat_number),
      kvk_number: validateField("kvk_number", form.kvk_number),
    };
    Object.keys(next).forEach((k) => {
      if (!next[k as keyof FormErrors]) delete next[k as keyof FormErrors];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleBlur = (name: keyof FormErrors) => () => {
    const msg = validateField(name, form[name]);
    setErrors((e) => {
      const next = { ...e };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleSave = async () => {
    if (!validateAll()) {
      toast.error("Please fix the errors below");
      return;
    }
    setSaving(true);
    try {
      await onUpdate({
        iban: form.iban.trim(),
        company_name: form.company_name.trim() || null,
        kvk_number: form.kvk_number.trim() || null,
        vat_number: form.vat_number.trim() || null,
        billing_address: form.billing_address.trim() || null,
      });
      toast.success("Settings saved successfully");
      setEditing(false);
    } catch {
      toast.error("Failed to save, please try again");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setForm({
      iban: affiliate.iban || "",
      company_name: affiliate.company_name || "",
      kvk_number: affiliate.kvk_number || "",
      vat_number: affiliate.vat_number || "",
      billing_address: affiliate.billing_address || "",
    });
  };

  const errClass = (k: keyof FormErrors) => (errors[k] ? "aff-input-error" : "");

  return (
    <div className="aff-card p-6 md:p-7" style={{ maxWidth: 600 }}>
      <div className="flex items-center justify-between">
        <h2 className="aff-syne font-semibold text-[16px] text-[#f1f5f9]">Account Settings</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="aff-btn-ghost">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      <p className="text-[12px] text-[#64748b] mt-1">Manage your billing and payout information</p>

      <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      <div className="space-y-5">
        {/* Email */}
        <Field label="Email">
          <div className="relative">
            <input value={affiliate.email} readOnly className="aff-input pr-10" />
            <Lock className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#475569]" />
          </div>
        </Field>

        {/* Affiliate code */}
        <Field label="Affiliate Code">
          <div className="relative">
            <input value={affiliate.affiliate_code} readOnly className="aff-input aff-mono pr-10" />
            <button onClick={handleCopyCode} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9] transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </Field>

        {/* IBAN */}
        <Field label="IBAN *" error={errors.iban}>
          <div className="relative">
            <Landmark className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none" />
            <input
              value={form.iban}
              onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
              onBlur={handleBlur("iban")}
              disabled={!editing}
              placeholder="NL00ABCD0123456789"
              className={`aff-input aff-mono pl-11 ${errClass("iban")}`}
            />
          </div>
        </Field>

        {/* Company */}
        <Field label="Company Name">
          <input
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            disabled={!editing}
            className="aff-input"
          />
        </Field>

        {/* KVK + VAT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="KVK Number" error={errors.kvk_number}>
            <input
              value={form.kvk_number}
              onChange={(e) => setForm((f) => ({ ...f, kvk_number: e.target.value }))}
              onBlur={handleBlur("kvk_number")}
              disabled={!editing}
              className={`aff-input aff-mono ${errClass("kvk_number")}`}
            />
          </Field>
          <Field label="VAT Number" error={errors.vat_number}>
            <input
              value={form.vat_number}
              onChange={(e) => setForm((f) => ({ ...f, vat_number: e.target.value }))}
              onBlur={handleBlur("vat_number")}
              disabled={!editing}
              className={`aff-input aff-mono ${errClass("vat_number")}`}
            />
          </Field>
        </div>

        {/* Billing address */}
        <Field label="Billing Address">
          <textarea
            value={form.billing_address}
            onChange={(e) => setForm((f) => ({ ...f, billing_address: e.target.value }))}
            disabled={!editing}
            rows={4}
            className="aff-input"
          />
        </Field>

        {editing && (
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="aff-btn-primary">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
            <button onClick={handleCancel} className="aff-btn-ghost">Cancel</button>
          </div>
        )}

        <div className="aff-info">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
          <span>
            Your IBAN and company details are used for generating self-billing invoices.
            Make sure they are accurate for correct payouts.
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, children, error,
}: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <div className="aff-input-label mb-1.5">{label}</div>
      {children}
      {error && <div className="aff-input-error-msg">{error}</div>}
    </div>
  );
}
