import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Copy, CheckCheck, CircleAlert as AlertCircle, ExternalLink, Server } from "lucide-react";
import type { RestaurantSettings } from "@/hooks/useRestaurantSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const SUBDOMAIN_HOST = "gildedtable.com";
const VERCEL_IP = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";

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

function DnsRow({ type, host, value }: { type: string; host: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm border border-border rounded-lg p-3 bg-secondary/30">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider col-span-2 mb-1 flex items-center gap-2">
        <span className="bg-gold/20 text-gold font-mono px-1.5 py-0.5 rounded text-[10px]">{type}</span>
        record
      </span>
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
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
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
  const [customDomainManual, setCustomDomainManual] = useState(
    !!(settings.custom_domain && settings.custom_domain !== `${settings.subdomain}.com`)
  );

  useEffect(() => {
    setSubdomain(settings.subdomain ?? "");
    setCustomDomain(settings.custom_domain ?? "");
  }, [settings.subdomain, settings.custom_domain]);

  const handleSubdomainChange = (val: string) => {
    const slug = slugify(val);
    setSubdomain(slug);
    setSubdomainError("");
    if (!customDomainManual) {
      setCustomDomain(slug ? `${slug}.com` : "");
    }
  };

  const handleCustomDomainChange = (val: string) => {
    setCustomDomainManual(true);
    setCustomDomain(val.trim());
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
    ? `https://${subdomain}.${SUBDOMAIN_HOST}`
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
          <div className={`flex items-center rounded-md border overflow-hidden transition-colors ${subdomainError ? "border-destructive" : "border-border focus-within:border-gold/60"}`}>
            <span className="bg-muted/60 px-3 py-2 text-xs text-muted-foreground border-r border-border whitespace-nowrap font-mono select-none">
              https://
            </span>
            <Input
              value={subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
              placeholder="your-restaurant-name"
              className="rounded-none border-0 bg-secondary focus-visible:ring-0 font-mono text-sm flex-1 min-w-0 placeholder:text-muted-foreground/40"
            />
            <span className="bg-muted/60 px-3 py-2 text-xs text-muted-foreground border-l border-border whitespace-nowrap font-mono select-none">
              .{SUBDOMAIN_HOST}
            </span>
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
            onChange={(e) => handleCustomDomainChange(e.target.value)}
            placeholder="www.your-restaurant-name.com"
            className="bg-secondary border-border font-mono text-sm placeholder:text-muted-foreground/40"
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
          Add these two DNS records at your domain registrar (e.g. Wix, GoDaddy, Namecheap, Cloudflare).
          Changes can take up to 48 hours to propagate.
        </p>

        <div className="space-y-3">
          <DnsRow type="A" host="@" value={VERCEL_IP} />
          <DnsRow type="CNAME" host="www" value={VERCEL_CNAME} />
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-400">Tips for your DNS provider</p>
          <ul className="text-xs text-amber-400/80 space-y-0.5 list-disc list-inside">
            <li>Set <strong>TTL</strong> to <code className="font-mono">Auto</code> or <code className="font-mono">3600</code></li>
            <li>Disable any proxy (e.g. Cloudflare orange cloud) until verified</li>
            <li>In Wix, go to <strong>Domains → DNS Records</strong> to add these</li>
          </ul>
        </div>

        <a
          href="https://dnschecker.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Check if your DNS changes have propagated at dnschecker.org
        </a>
      </div>
    </div>
  );
}
