import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Copy, CheckCheck, CircleAlert as AlertCircle, ExternalLink, Server, Lock, CircleCheck as CheckCircle2, Circle } from "lucide-react";
import type { RestaurantSettings } from "@/hooks/useRestaurantSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "@/contexts/DemoModeContext";

const SUBDOMAIN_HOST = "gildedtable.com";
const VERCEL_IP = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** True when running on a real Vercel deployment (not local dev or Bolt preview). */
function isVercelProduction(): boolean {
  const host = window.location.hostname;
  // Custom production domain
  if (host === SUBDOMAIN_HOST || host.endsWith(`.${SUBDOMAIN_HOST}`)) return true;
  // Vercel deployment URLs (project.vercel.app)
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * Returns the URL that is actually live and reachable right now for this restaurant.
 * - On Vercel: subdomain URL if configured, otherwise the current origin + test_res_id
 * - On dev/Bolt preview: always test_res_id so we never hit a broken subdomain route
 */
function getLiveUrl(settings: RestaurantSettings): string {
  const onVercel = isVercelProduction();
  const subdomain = settings.subdomain?.trim();
  if (onVercel && subdomain) {
    return `https://${subdomain}.${SUBDOMAIN_HOST}`;
  }
  return `${window.location.origin}/?test_res_id=${settings.id}`;
}

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

type Props = {
  settings: RestaurantSettings;
  menuItemCount?: number;
};

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        : <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />}
      <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

export default function SiteSettingsTab({ settings, menuItemCount = 0 }: Props) {
  const qc = useQueryClient();
  const demo = useDemoMode();

  if (demo) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-secondary/40 p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Not Available in Demo</p>
            <p className="text-xs text-muted-foreground mt-1">
              Custom domain and subdomain configuration requires a live account. Start a free trial to publish your menu at your own URL.
            </p>
          </div>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your live site URL will appear here once you create an account.</p>
        </div>
      </div>
    );
  }

  // Derive a clean default subdomain from business_name if none is saved yet
  const defaultSubdomain = settings.subdomain?.trim()
    || slugify(settings.business_name || "");

  const [subdomain, setSubdomain] = useState(defaultSubdomain);
  const [customDomain, setCustomDomain] = useState(settings.custom_domain ?? "");
  const [saving, setSaving] = useState(false);
  const [subdomainError, setSubdomainError] = useState("");
  const [savedLiveUrl, setSavedLiveUrl] = useState(() => getLiveUrl(settings));
  const [customDomainManual, setCustomDomainManual] = useState(
    !!(settings.custom_domain && settings.custom_domain !== `${settings.subdomain}.com`)
  );

  useEffect(() => {
    const clean = settings.subdomain?.trim() || slugify(settings.business_name || "");
    setSubdomain(clean);
    setCustomDomain(settings.custom_domain ?? "");
    setSavedLiveUrl(getLiveUrl(settings));
  }, [settings.subdomain, settings.custom_domain, settings.business_name, settings.id]);

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
      const { data: updated, error } = await supabase
        .from("restaurant_settings")
        .update({
          subdomain: subdomain.trim() || null,
          custom_domain: customDomain.trim() || null,
        })
        .eq("id", settings.id)
        .select("id, subdomain, custom_domain");

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

      if (!updated || updated.length === 0) {
        toast.error("Save failed — your session may have expired. Please log out and back in.");
        return;
      }

      // Update the live URL display without navigating away
      const newLiveUrl = isVercelProduction() && subdomain.trim()
        ? `https://${subdomain.trim()}.${SUBDOMAIN_HOST}`
        : `${window.location.origin}/?test_res_id=${settings.id}`;
      setSavedLiveUrl(newLiveUrl);

      qc.invalidateQueries({ queryKey: ["restaurant-settings"] });
      toast.success("Domain settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onVercel = isVercelProduction();

  const profileSet = !!(settings.business_name?.trim() && settings.business_phone?.trim());
  const menuReady = menuItemCount > 0;
  const domainSet = !!settings.subdomain?.trim();
  const allGreen = profileSet && menuReady && domainSet;

  return (
    <div className="space-y-8">

      {/* Launch Readiness Checklist */}
      <div className={`rounded-lg border p-4 space-y-3 transition-colors ${allGreen ? "border-emerald-500/40 bg-emerald-500/5" : "border-border bg-secondary/30"}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Launch Readiness</p>
          {allGreen && (
            <span className="text-xs font-semibold text-emerald-400 animate-pulse">All systems go</span>
          )}
        </div>
        <div className="space-y-2">
          <ChecklistItem done={profileSet} label="Profile Set — business name & phone added" />
          <ChecklistItem done={menuReady} label={`Menu Ready — ${menuItemCount} item${menuItemCount === 1 ? "" : "s"} on the menu`} />
          <ChecklistItem done={domainSet} label={`Domain Set — subdomain saved${domainSet ? ` (${settings.subdomain})` : ""}`} />
        </div>
        {allGreen && (
          <div className="pt-2 border-t border-emerald-500/20 text-center">
            <p className="text-sm font-bold text-emerald-400">Your Restaurant is Live! 🚀</p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Site Identity</h3>
        <p className="text-xs text-muted-foreground">
          Configure your restaurant's public URL and custom domain.
        </p>
      </div>

      {/* Current live URL banner */}
      <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 space-y-1.5">
        <p className="text-xs font-semibold text-foreground">Your current working URL</p>
        <a
          href={savedLiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 transition-colors break-all"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          {savedLiveUrl}
        </a>
        {!onVercel && (
          <p className="text-xs text-muted-foreground">
            Running in preview mode — this link uses your restaurant ID. Deploy to Vercel to activate your subdomain URL.
          </p>
        )}
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

      {/* DNS Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">DNS Configuration</h3>
        </div>

        {/* Free subdomain — always shown */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Free Subdomain</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your free <code className="font-mono">.{SUBDOMAIN_HOST}</code> address is handled automatically — no DNS changes needed.
              It becomes active once your subdomain is saved above.
            </p>
          </div>
          {subdomain && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3 flex items-center justify-between gap-2">
              <code className="font-mono text-xs text-foreground">https://{subdomain}.{SUBDOMAIN_HOST}</code>
              <CopyButton value={`https://${subdomain}.${SUBDOMAIN_HOST}`} />
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Custom domain DNS records — contextual */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Custom Domain DNS Records</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customDomain.trim()
                ? <>Point <code className="font-mono">{customDomain.trim()}</code> to Gilded Table by adding these records at your domain registrar.</>
                : "Enter a custom domain above to see the exact DNS records to add at your registrar."}
            </p>
          </div>

          {customDomain.trim() ? (() => {
            const domain = customDomain.trim();
            // Determine host label: strip leading "www." for the A record host
            const isWww = domain.startsWith("www.");
            const isSubdomain = domain.split(".").length > 2; // e.g. menu.joesdiner.com
            return (
              <div className="space-y-3">
                {isWww || !isSubdomain ? (
                  // Root / www domain: needs A record for root + CNAME for www
                  <>
                    <DnsRow type="A" host="@" value={VERCEL_IP} />
                    <DnsRow type="CNAME" host="www" value={VERCEL_CNAME} />
                  </>
                ) : (
                  // Subdomain (e.g. menu.joesdiner.com): just a CNAME for that subdomain
                  <DnsRow
                    type="CNAME"
                    host={domain.split(".")[0]}
                    value={VERCEL_CNAME}
                  />
                )}
              </div>
            );
          })() : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <Globe className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">DNS records will appear here once you enter a custom domain.</p>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-400">Tips for your DNS provider</p>
          <ul className="text-xs text-amber-400/80 space-y-0.5 list-disc list-inside">
            <li>Set <strong>TTL</strong> to <code className="font-mono">Auto</code> or <code className="font-mono">3600</code></li>
            <li>Disable any proxy (e.g. Cloudflare orange cloud) until DNS is verified</li>
            <li>In Wix: <strong>Domains → DNS Records</strong></li>
            <li>In GoDaddy: <strong>DNS → Manage Zones</strong></li>
            <li>Changes can take up to 48 hours to propagate</li>
          </ul>
        </div>

        <a
          href="https://dnschecker.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Check DNS propagation at dnschecker.org
        </a>
      </div>
    </div>
  );
}
