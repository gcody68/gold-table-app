import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ServiceHours, type ShiftConfig } from "@/hooks/useRestaurantSettings";
import { Clock } from "lucide-react";

type MealKey = keyof ServiceHours;

const SHIFTS: { key: MealKey; label: string; description: string }[] = [
  { key: "breakfast", label: "Breakfast", description: "Morning service window" },
  { key: "lunch", label: "Lunch", description: "Midday service window" },
  { key: "dinner", label: "Dinner", description: "Evening service window" },
];

type Props = {
  serviceHours: ServiceHours;
  onChange: (hours: ServiceHours) => void;
  unavailableDisplay: "hide" | "gray";
  onDisplayChange: (val: "hide" | "gray") => void;
};

export default function ServiceHoursTab({
  serviceHours,
  onChange,
  unavailableDisplay,
  onDisplayChange,
}: Props) {
  const updateShift = (key: MealKey, patch: Partial<ShiftConfig>) => {
    onChange({ ...serviceHours, [key]: { ...serviceHours[key], ...patch } });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Shift Hours</p>
        <p className="text-xs text-muted-foreground mb-4">
          Define when each meal period is active. Items tagged for a period only appear (or become orderable) during its window.
        </p>

        <div className="space-y-4">
          {SHIFTS.map(({ key, label, description }) => {
            const shift = serviceHours[key];
            return (
              <div
                key={key}
                className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={shift.enabled}
                    onCheckedChange={(v) => updateShift(key, { enabled: v })}
                  />
                </div>

                {shift.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Start Time
                      </Label>
                      <Input
                        type="time"
                        value={shift.start}
                        onChange={(e) => updateShift(key, { start: e.target.value })}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> End Time
                      </Label>
                      <Input
                        type="time"
                        value={shift.end}
                        onChange={(e) => updateShift(key, { end: e.target.value })}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <p className="text-sm font-semibold text-foreground mb-1">Out-of-Hours Display</p>
        <p className="text-xs text-muted-foreground mb-3">
          Choose how items appear to customers when they are outside their scheduled shift window.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onDisplayChange("hide")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              unavailableDisplay === "hide"
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-gold/40"
            }`}
          >
            <p className="text-sm font-medium">Hide Items</p>
            <p className="text-xs mt-0.5 opacity-75">
              Items not in the current shift disappear from the menu entirely.
            </p>
          </button>

          <button
            onClick={() => onDisplayChange("gray")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              unavailableDisplay === "gray"
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-gold/40"
            }`}
          >
            <p className="text-sm font-medium">Gray-out Items</p>
            <p className="text-xs mt-0.5 opacity-75">
              Items stay visible but are dimmed with a disabled "Available during [period]" button.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
