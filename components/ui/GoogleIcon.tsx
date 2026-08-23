import React from "react";

interface GoogleIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number | string;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({
  name,
  className = "",
  filled = false,
  size,
}) => {
  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center leading-none align-middle ${className}`}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        fontSize: size ? (typeof size === "number" ? `${size}px` : size) : undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
