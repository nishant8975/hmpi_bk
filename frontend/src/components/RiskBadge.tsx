import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RiskLevel = "safe" | "moderate" | "high" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  value?: number;
  className?: string;
}

const riskConfig = {
  safe: {
    label: "Safe",
    className: "bg-risk-safe text-risk-safe-foreground hover:bg-risk-safe/80",
  },
  moderate: {
    label: "Moderate Risk",
    className: "bg-risk-moderate text-risk-moderate-foreground hover:bg-risk-moderate/80",
  },
  high: {
    label: "High Risk",
    className: "bg-risk-high text-risk-high-foreground hover:bg-risk-high/80",
  },
  critical: {
    label: "Critical",
    className: "bg-risk-critical text-risk-critical-foreground hover:bg-risk-critical/80",
  },
};

export const RiskBadge = ({ level, value, className }: RiskBadgeProps) => {
  const config = riskConfig[level];
  
  return (
    <Badge 
      className={cn(config.className, "font-medium", className)}
    >
      {config.label}
      {value !== undefined && ` (${value.toFixed(2)})`}
    </Badge>
  );
};
