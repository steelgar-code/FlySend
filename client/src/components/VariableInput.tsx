import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock3 } from "lucide-react";

interface VariableInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  index: number;
}

export function VariableInput({ name, value, onChange, index }: VariableInputProps) {
  const isTimeVariable = name === "time";
  const isDateVariable = name === "date";

  const setCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    onChange(`${hours}:${minutes}`);
  };

  const setCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2).padStart(2, "0");
    onChange(`${day}.${month}.${year}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-2"
    >
      <Label htmlFor={`var-${name}`} className="text-sm font-medium text-foreground capitalize">
        {name.replace(/_/g, ' ')}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={`var-${name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${name}...`}
          className="input-field"
          autoFocus={index === 0}
        />
        {(isTimeVariable || isDateVariable) && (
          <button
            type="button"
            onClick={isTimeVariable ? setCurrentTime : setCurrentDate}
            aria-label={isTimeVariable ? "Use current time" : "Use current date"}
            title={isTimeVariable ? "Use current time" : "Use current date"}
            className="shrink-0 p-3 rounded-xl border-2 border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          >
            {isTimeVariable ? (
              <Clock3 className="w-5 h-5" />
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
