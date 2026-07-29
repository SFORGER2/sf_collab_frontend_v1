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
  // Cosmos gold — the spark. This is the primary CTA on auth screens.
  bgColor = `linear-gradient(325deg,
  #f09220 0%,
  #ffcf7d 55%,
  #f09220 90%
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
        border-none cursor-pointer shadow-[0px_0px_20px_rgba(255,191,94,0.35),0px_5px_18px_-4px_rgba(255,181,71,0.45),inset_4px_4px_8px_rgba(255,240,214,0.35),inset_-4px_-4px_8px_rgba(160,95,10,0.30)]
        focus:outline-none active:scale-95
        hover:bg-[length:280%_auto]  ${className}`}
      style={{
        backgroundImage,
        backgroundSize: "280% auto",
        backgroundPosition: "initial",
        color: "#241300",
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
