// @ts-nocheck
import React from "react";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Button({ children, className = "", variant = "default", size = "default", disabled = false, onClick, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    default: "bg-zinc-950 text-white hover:bg-zinc-800",
    outline: "border border-zinc-200 bg-white text-zinc-950 hover:bg-orange-50",
    ghost: "bg-transparent hover:bg-orange-50",
  };
  const sizes = {
    default: "h-11 px-5",
    icon: "h-10 w-10",
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <div className={cn("border border-orange-100 bg-white shadow-sm", className)}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
