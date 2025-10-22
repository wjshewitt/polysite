"use client";

/** @paper-design/shaders-react@0.0.60 */
import { Dithering as Dithering1 } from "@paper-design/shaders-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";

/**
 * Code exported from Paper
 * https://app.paper.design/file/01K78BX35QHQVSRFKBNY6TJDJ2?page=01K78BX35Q73RRE5CFWV148N4V&node=01K84JF0QX2G5FSZ6S8VRG3MHK
 * on Oct 22, 2025 at 12:52 AM.
 */
export default function Dithering() {
  const theme = useThemeStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  const isDark = theme === "dark";

  return (
    <Dithering1
      colorBack={isDark ? "#000000" : "#CCCCCC"}
      colorFront={isDark ? "#00FF88" : "#008844"}
      speed={0.28}
      shape="warp"
      type="8x8"
      size={2.4}
      scale={0.88}
      style={{
        backgroundImage: isDark
          ? "linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 255, 136, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%)"
          : "linear-gradient(180deg, rgba(229, 229, 229, 0.4) 0%, rgba(0, 136, 68, 0.5) 50%, rgba(204, 204, 204, 0.6) 100%)",
        borderRadius: "0px",
        boxShadow: isDark
          ? "rgba(0, 255, 136, 0.4) 0px 4px 40px inset"
          : "rgba(0, 136, 68, 0.6) 0px 6px 50px inset",
        height: "100%",
        opacity: "100%",
        width: "100%",
      }}
    />
  );
}
