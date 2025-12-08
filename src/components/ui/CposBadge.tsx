import React from "react";
import { CposBox } from "./CposBox";
import { CposText } from "./CposText";

interface CposBadgeProps {
  label: string;
  color: "success" | "warning" | "error" | "info" | "default" | "primary";
  variant?: "filled" | "outlined";
  size?: "small" | "medium";
}

/**
 * CPOS badge component
 * Displays status or category labels with color coding
 */
export const CposBadge: React.FC<CposBadgeProps> = ({
  label,
  color,
  variant = "filled",
  size = "medium",
}) => {
  const colorMap = {
    success: { bg: "success.main", text: "white", border: "success.main" },
    warning: { bg: "warning.main", text: "white", border: "warning.main" },
    error: { bg: "error.main", text: "white", border: "error.main" },
    info: { bg: "info.main", text: "white", border: "info.main" },
    primary: { bg: "primary.main", text: "white", border: "primary.main" },
    default: { bg: "grey.300", text: "text.primary", border: "grey.300" },
  };

  const colors = colorMap[color];
  const isOutlined = variant === "outlined";
  const padding = size === "small" ? { px: 1, py: 0.25 } : { px: 1.5, py: 0.5 };

  return (
    <CposBox
      sx={{
        ...padding,
        borderRadius: size === "small" ? 1 : 1.5,
        ...(isOutlined
          ? {
              border: 1,
              borderColor: colors.border,
              color: colors.border,
              bgcolor: "transparent",
            }
          : {
              bgcolor: colors.bg,
              color: colors.text,
            }),
        display: "inline-block",
      }}
    >
      <CposText
        variant={size === "small" ? "caption" : "body2"}
        fontWeight={500}
        sx={{ lineHeight: 1 }}
      >
        {label}
      </CposText>
    </CposBox>
  );
};
