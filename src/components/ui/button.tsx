import React from "react";
import { cn } from "@/lib/utils"; // nếu bạn có hàm cn, nếu không dùng `${}` cũng được

type Variant = "default" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyle = "px-4 py-2 rounded font-medium transition-colors duration-200";
  const variants: Record<Variant, string> = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], className, props.disabled && "opacity-50 cursor-not-allowed")}
      {...props}
    >
      {children}
    </button>
  );
};
