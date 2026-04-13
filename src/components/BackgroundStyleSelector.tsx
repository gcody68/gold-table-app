import { cn } from "@/lib/utils";

export type BgStyleId = "true-black" | "deep-charcoal" | "midnight-navy" | "warm-slate" | "espresso" | "forest-dark" | "paper-white";

type BgStyle = {
  id: BgStyleId;
  name: string;
  swatch: string;
  vars: Record<string, string>;
};

export const BG_STYLES: BgStyle[] = [
  {
    id: "true-black",
    name: "True Black",
    swatch: "#000000",
    vars: {
      "--background": "0 0% 0%",
      "--foreground": "0 0% 96%",
      "--card": "0 0% 5%",
      "--card-foreground": "0 0% 96%",
      "--popover": "0 0% 5%",
      "--popover-foreground": "0 0% 96%",
      "--secondary": "0 0% 8%",
      "--secondary-foreground": "0 0% 85%",
      "--muted": "0 0% 8%",
      "--muted-foreground": "0 0% 55%",
      "--border": "0 0% 14%",
      "--input": "0 0% 14%",
    },
  },
  {
    id: "deep-charcoal",
    name: "Deep Charcoal",
    swatch: "#1A1A1A",
    vars: {
      "--background": "0 0% 7%",
      "--foreground": "0 0% 95%",
      "--card": "0 0% 10%",
      "--card-foreground": "0 0% 95%",
      "--popover": "0 0% 10%",
      "--popover-foreground": "0 0% 95%",
      "--secondary": "0 0% 14%",
      "--secondary-foreground": "0 0% 85%",
      "--muted": "0 0% 14%",
      "--muted-foreground": "0 0% 55%",
      "--border": "0 0% 18%",
      "--input": "0 0% 18%",
    },
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    swatch: "#0D1B2A",
    vars: {
      "--background": "215 45% 8%",
      "--foreground": "210 20% 95%",
      "--card": "215 40% 12%",
      "--card-foreground": "210 20% 95%",
      "--popover": "215 40% 12%",
      "--popover-foreground": "210 20% 95%",
      "--secondary": "215 30% 16%",
      "--secondary-foreground": "210 15% 82%",
      "--muted": "215 30% 16%",
      "--muted-foreground": "215 15% 50%",
      "--border": "215 25% 22%",
      "--input": "215 25% 22%",
    },
  },
  {
    id: "warm-slate",
    name: "Warm Slate",
    swatch: "#2C2A28",
    vars: {
      "--background": "30 5% 10%",
      "--foreground": "30 10% 94%",
      "--card": "30 5% 14%",
      "--card-foreground": "30 10% 94%",
      "--popover": "30 5% 14%",
      "--popover-foreground": "30 10% 94%",
      "--secondary": "30 5% 18%",
      "--secondary-foreground": "30 8% 82%",
      "--muted": "30 5% 18%",
      "--muted-foreground": "30 5% 52%",
      "--border": "30 5% 24%",
      "--input": "30 5% 24%",
    },
  },
  {
    id: "espresso",
    name: "Espresso",
    swatch: "#1E1410",
    vars: {
      "--background": "20 25% 8%",
      "--foreground": "30 15% 93%",
      "--card": "20 20% 12%",
      "--card-foreground": "30 15% 93%",
      "--popover": "20 20% 12%",
      "--popover-foreground": "30 15% 93%",
      "--secondary": "20 18% 16%",
      "--secondary-foreground": "30 12% 80%",
      "--muted": "20 18% 16%",
      "--muted-foreground": "20 10% 48%",
      "--border": "20 15% 22%",
      "--input": "20 15% 22%",
    },
  },
  {
    id: "forest-dark",
    name: "Forest Dark",
    swatch: "#0F1A14",
    vars: {
      "--background": "150 25% 7%",
      "--foreground": "120 10% 94%",
      "--card": "150 20% 11%",
      "--card-foreground": "120 10% 94%",
      "--popover": "150 20% 11%",
      "--popover-foreground": "120 10% 94%",
      "--secondary": "150 15% 15%",
      "--secondary-foreground": "120 8% 82%",
      "--muted": "150 15% 15%",
      "--muted-foreground": "150 8% 48%",
      "--border": "150 12% 20%",
      "--input": "150 12% 20%",
    },
  },
  {
    id: "paper-white",
    name: "Paper White",
    swatch: "#F7F5F0",
    vars: {
      "--background": "40 20% 96%",
      "--foreground": "0 0% 10%",
      "--card": "40 15% 100%",
      "--card-foreground": "0 0% 10%",
      "--popover": "40 15% 100%",
      "--popover-foreground": "0 0% 10%",
      "--secondary": "40 10% 92%",
      "--secondary-foreground": "0 0% 22%",
      "--muted": "40 10% 92%",
      "--muted-foreground": "0 0% 42%",
      "--border": "40 10% 85%",
      "--input": "40 10% 85%",
    },
  },
];

export function applyBgStyle(style: BgStyle) {
  const root = document.documentElement;
  Object.entries(style.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function getBgStyleById(id: string): BgStyle {
  return BG_STYLES.find((s) => s.id === id) || BG_STYLES[1];
}

type Props = {
  value: BgStyleId;
  onChange: (id: BgStyleId) => void;
};

export default function BackgroundStyleSelector({ value, onChange }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Background Style
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {BG_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            title={s.name}
            className={cn(
              "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all",
              value === s.id
                ? "bg-secondary ring-2 ring-primary"
                : "hover:bg-secondary/60"
            )}
          >
            <div
              className="w-7 h-7 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: s.swatch }}
            />
            <span className="text-[9px] text-muted-foreground leading-tight text-center">
              {s.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
