import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "safe" | "warning" | "critical";
  className?: string;
}

const variantStyles = {
  default: "border-border",
  safe: "border-risk-safe/20 bg-gradient-to-br from-risk-safe/5 to-transparent",
  warning: "border-risk-moderate/20 bg-gradient-to-br from-risk-moderate/5 to-transparent",
  critical: "border-risk-critical/20 bg-gradient-to-br from-risk-critical/5 to-transparent",
};

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatCardProps) => {
  return (
    <Card className={cn(
      "shadow-card hover:shadow-elegant transition-all duration-200 animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-risk-safe" : "text-risk-critical"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};