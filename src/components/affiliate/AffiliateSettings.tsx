import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Pencil } from "lucide-react";
import type { AffiliateData } from "@/hooks/useAffiliate";

interface AffiliateSettingsProps {
  affiliate: AffiliateData;
  onUpdate: (fields: Partial<AffiliateData>) => Promise<void>;
}

export function AffiliateSettings({ affiliate, onUpdate }: AffiliateSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    iban: affiliate.iban || "",
    company_name: affiliate.company_name || "",
    kvk_number: affiliate.kvk_number || "",
    vat_number: affiliate.vat_number || "",
    billing_address: affiliate.billing_address || "",
  });

  const handleSave = async () => {
    if (!form.iban.trim()) {
      toast.error("IBAN is verplicht");
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
      toast.success("Gegevens opgeslagen");
      setEditing(false);
    } catch {
      toast.error("Opslaan mislukt, probeer opnieuw");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-display font-bold">Account Settings</h2>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={affiliate.email} disabled className="mt-1" />
        </div>
        <div>
          <Label>Affiliate Code</Label>
          <Input value={affiliate.affiliate_code} disabled className="mt-1" />
        </div>
        <div>
          <Label>IBAN *</Label>
          <Input
            value={form.iban}
            onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))}
            disabled={!editing}
            placeholder="NL00ABCD0123456789"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Company Name</Label>
          <Input
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            disabled={!editing}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>KVK Number</Label>
            <Input
              value={form.kvk_number}
              onChange={(e) => setForm((f) => ({ ...f, kvk_number: e.target.value }))}
              disabled={!editing}
              className="mt-1"
            />
          </div>
          <div>
            <Label>VAT Number</Label>
            <Input
              value={form.vat_number}
              onChange={(e) => setForm((f) => ({ ...f, vat_number: e.target.value }))}
              disabled={!editing}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label>Billing Address</Label>
          <Textarea
            value={form.billing_address}
            onChange={(e) => setForm((f) => ({ ...f, billing_address: e.target.value }))}
            disabled={!editing}
            rows={3}
            className="mt-1"
          />
        </div>

        {editing && (
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
            <Button variant="outline" onClick={() => { setEditing(false); setForm({ iban: affiliate.iban || "", company_name: affiliate.company_name || "", kvk_number: affiliate.kvk_number || "", vat_number: affiliate.vat_number || "", billing_address: affiliate.billing_address || "" }); }}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
