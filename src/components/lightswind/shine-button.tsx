import React from "react";

interface ShineButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string; // Can be hex or gradient
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  zIndex?: number;
}

const sizeStyles: Record<
  NonNullable<ShineButtonProps["size"]>,
  { padding: string; fontSize: string }
> = {
  sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
  md: { padding: "0.6rem 1.4rem", fontSize: "1rem" },
  lg: { padding: "0.8rem 1.8rem", fontSize: "1.125rem" },
};

export const ShineButton: React.FC<ShineButtonProps> = ({
  zIndex=1000,
  label = "",
  onClick,
  className = "",
  disabled,
  type,
  size = "md",
  bgColor = `linear-gradient(325deg,
  hsl(0 0% 20%) 0%,
  hsl(0 0% 45%) 55%,
  hsl(0 0% 20%) 90%
)

`,
  icon
}) => {
  const { padding, fontSize } = sizeStyles[size];

  // Determine whether to use solid color or gradient
  const backgroundImage = bgColor.startsWith("linear-gradient")
    ? bgColor
    : `linear-gradient(to right, ${bgColor}, ${bgColor})`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative  overflow-hidden  text-white font-medium  transition-all duration-700 ease-in-out
        border-none cursor-pointer shadow-[0px_0px_20px_rgba(71,184,255,0.5),0px_5px_5px_0px_rgba(58,125,233,0.25),inset_4px_4px_8px_rgba(175,230,255,0.5),inset_-4px_-4px_8px_rgba(19,95,216,0.35)]
        focus:outline-none active:scale-95
        hover:bg-[length:280%_auto]  ${className}`}
      style={{
        backgroundImage,
        backgroundSize: "280% auto",
        backgroundPosition: "initial",
        color: "hsl(0 0% 100%)",
        fontSize,
        padding,
        zIndex,
        transition: "0.8s",
      }}
      onMouseEnter={(e) =>
        ((e.target as HTMLButtonElement).style.backgroundPosition = "right top")
      }
      onMouseLeave={(e) =>
        ((e.target as HTMLButtonElement).style.backgroundPosition = "initial")
      }
    >
      {icon}{label}

    </button>
  );
};
