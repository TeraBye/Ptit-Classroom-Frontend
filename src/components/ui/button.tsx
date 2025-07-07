// components/ui/button.tsx
type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
  onClick?: () => void; // <-- Thêm onClick
  type?: "button" | "submit"; // (optional) nếu muốn form submit
};

export function Button({ children, className = "", variant = "default", onClick, type = "button" }: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded font-medium";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
  };

  return (
    <button onClick={onClick} type={type} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
