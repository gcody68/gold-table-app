import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Copy, CheckCheck, CircleAlert as AlertCircle, ExternalLink, Server } from "lucide-react";
import type { RestaurantSettings } from "@/hooks/useRestaurantSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const APP_HOSTNAME = window.location.hostname;
const CNAME_TARGET = `hosted.${APP_HOSTNAME}`;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors flex-shrink-0"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CnameRow({ label, host, value }: { label: string; host: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm border border-border rounded-lg p-3 bg-secondary/30">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider col-span-2 mb-1">{label}</span>
      <span className="text-xs text-muted-foreground w-12">Host</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="font-mono text-xs text-foreground truncate">{host}</code>
        <CopyButton value={host} />
      </div>
      <span className="text-xs text-muted-foreground w-12">Value</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="font-mono text-xs text-foreground truncate">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  settings: RestaurantSettings;
};

export default function SiteSettingsTab({ settings }: Props) {
  const qc = useQueryClient();
  const [subdomain, setSubdomain] = useState(settings.subdomain ?? "");
  const [customDomain, setCustomDomain] = useState(settings.custom_domain ?? "");
  const [saving, setSaving] = useState(false);
  const [subdomainError, setSubdomainError] = useState("");

  useEffect(() => {
    setSubdomain(settings.subdomain ?? "");
    setCustomDomain(settings.custom_domain ?? "");
  }, [settings.subdomain, settings.custom_domain]);

  const handleSubdomainChange = (val: string) => {
    setSubdomain(slugify(val));
    setSubdomainError("");
  };

  const handleSave = async () => {
    if (!subdomain.trim()) {
      setSubdomainError("Subdomain is required");
      return;
    }
    if (subdomain.length < 3) {
      setSubdomainError("Must be at least 3 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurant_settings")
        .update({
          subdomain: subdomain.trim() || null,
          custom_domain: customDomain.trim() || null,
        })
        .eq("id", settings.id);

      if (error) {
        if (error.message.includes("subdomain")) {
          setSubdomainError("This subdomain is already taken");
        } else if (error.message.includes("custom_domain")) {
          toast.error("That custom domain is already registered");
        } else {
          throw error;
        }
        return;
      }

      qc.invalidateQueries({ queryKey: ["restaurant-settings"] });
      toast.success("Domain settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = subdomain
    ? `https://${subdomain}.${APP_HOSTNAME}`
    : null;

  const hasCustomDomain = customDomain.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Site Identity</h3>
        <p className="text-xs text-muted-foreground">
          Configure your restaurant's public URL and custom domain.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">
            Subdomain <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Your restaurant's free hosted address. Only lowercase letters, numbers, and hyphens.
          </p>
          <div className="flex items-center gap-0 rounded-md border border-border overflow-hidden">
            <div className="bg-secondary px-3 py-2 text-xs text-muted-foreground border-r border-border whitespace-nowrap">
              https://
            </div>
            <Input
              value={subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="joes-diner"
              className={`rounded-none border-0 border-r border-border bg-secondary focus-visible:ring-0 font-mono text-sm ${subdomainError ? "border-destructive" : ""}`}
            />
            <div className="bg-secondary px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
              .{APP_HOSTNAME}
            </div>
          </div>
          {subdomainError && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {subdomainError}
            </p>
          )}
          {previewUrl && !subdomainError && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Preview: {previewUrl}
            </a>
          )}
        </div>

        <div className="border-t border-border" />

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Custom Domain (optional)</Label>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Use your own domain (e.g. <code className="font-mono">menu.joesdiner.com</code>).
            Add the CNAME records below to your DNS provider after saving.
          </p>
          <Input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.trim())}
            placeholder="menu.joesdiner.com"
            className="bg-secondary border-border font-mono text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full gradient-gold text-primary-foreground font-semibold"
      >
        <Globe className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Save Domain Settings"}
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Domain Configuration</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Add these DNS records at your domain registrar (e.g. Cloudflare, GoDaddy, Namecheap).
          Changes can take up to 48 hours to propagate.
        </p>

        <div className="space-y-3">
          <CnameRow
            label="Subdomain CNAME"
            host={subdomain ? `${subdomain}` : "<your-subdomain>"}
            value={CNAME_TARGET}
          />

          {hasCustomDomain ? (
            <CnameRow
              label="Custom Domain CNAME"
              host={customDomain}
              value={CNAME_TARGET}
            />
          ) : (
            <div className="rounded-lg border border-border border-dashed p-4 text-center">
              <Globe className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Enter a custom domain above to see your CNAME record.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-400">DNS Record Type: CNAME</p>
          <ul className="text-xs text-amber-400/80 space-y-0.5 list-disc list-inside">
            <li>Set the <strong>Type</strong> field to <code className="font-mono">CNAME</code></li>
            <li>Set <strong>TTL</strong> to <code className="font-mono">Auto</code> or <code className="font-mono">3600</code></li>
            <li>Disable any proxy (e.g. Cloudflare orange cloud) until verified</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
