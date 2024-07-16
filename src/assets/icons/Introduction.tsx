import { IconProps } from "@/types/icon";
import React from "react";
import { colors } from "../colors";

export const Introduction: React.FC<IconProps> = ({
  size = "1em",
  color = colors.primary600,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
    >
      <rect width="32" height="32" fill="none" />
      <g fill={color} stroke-width="0.96">
        <path d="m9.394 29.918l16.355-10.98s.738-.409.738-1.057c0-.864-.933-1.143-.933-1.143l-8.997-3.451c-.322-.122-.765.219-.35.653l2.978 2.887s.828.79.828 1.305c0 .518-.508.977-.508.977L8.666 29.254c-.385.361.136 1.015.728.664" />
        <path d="M22.605 2.082L6.249 13.062s-.737.41-.737 1.058c0 .863.932 1.145.932 1.145l8.998 3.448c.321.12.765-.22.35-.651l-2.978-2.898s-.83-.787-.83-1.305s.51-.975.51-.975l10.833-10.14c.392-.36-.128-1.015-.722-.662" />
      </g>
    </svg>
  );
};
