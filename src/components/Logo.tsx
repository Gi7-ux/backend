import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  animated?: boolean;
}

export function Logo({ className, size = "md", animated = true }: LogoProps) {
  // Map size prop to actual dimensions - updated with larger sizes
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
    "2xl": "w-36 h-36"
  };

  return (
    <div className={cn("architect-logo group", sizeClasses[size], className)}>
      <div className={cn(
        "architect-logo-bird", 
        animated && "group-hover:animate-bird-float"
      )}>
        <img 
          src="/assets/logo.png" 
          alt="ArchiConnect Logo" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
