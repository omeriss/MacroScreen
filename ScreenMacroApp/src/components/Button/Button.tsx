import { useEffect, useMemo } from "react";
import styles from "./Button.module.css";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, dataDir, documentDir, join } from "@tauri-apps/api/path";
import ImageModal from "../ImageModal/ImageModal";

interface ButtonProps {
  background?: number;
  label?: string;
  disabled?: boolean;
}

const Button = ({ background, label, disabled }: ButtonProps) => {
  const backgroundColor = `#${background?.toString(16) ?? "000000"}`;
  const [imagePath, setImagePath] = useState<string | null>(null);

  const updatePaths = async () => {
    const path = await join(await documentDir(), "image.png");
    console.log(path);
    setImagePath(convertFileSrc(path));
  };

  useEffect(() => {
    updatePaths();
  }, []);

  return (
    <div
      className={`${styles.button} ${disabled ? styles.disabled : ""}`}
      style={{ backgroundColor: backgroundColor }}
    >
      <span>{label}</span>
    </div>
  );
};

export default Button;
