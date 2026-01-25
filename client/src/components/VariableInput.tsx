import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface VariableInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  index: number;
}

export function VariableInput({ name, value, onChange, index }: VariableInputProps) {
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
      <input
        id={`var-${name}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${name}...`}
        className="input-field"
        autoFocus={index === 0}
      />
    </motion.div>
  );
}
