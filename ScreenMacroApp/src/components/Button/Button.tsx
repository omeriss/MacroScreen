import { useEffect, useMemo, useRef } from "react";
import styles from "./Button.module.css";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, dataDir, documentDir, join } from "@tauri-apps/api/path";
import ImageModal from "../ImageModal/ImageModal";
import {
  BORDER_RADIUS_PERCENTAGE,
  TEXT_HIGHT_PERCENTAGE,
} from "./Button.config";
import { useRecoilValue } from "recoil";
import { savePathState } from "../../store/store";
import { IMAGES_FOLDER_NAME } from "../../config/projectfolder.config";

interface ButtonProps {
  background?: number;
  label?: string;
  disabled?: boolean;
}

const Button = ({ background, label, disabled }: ButtonProps) => {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);
  const savePath = useRecoilValue(savePathState);

  const backgroundColor = useMemo(
    () => `#${(background ?? 0)?.toString(16).padStart(6, "0")}`,
    [background]
  );

  const updatePaths = async () => {
    if (!savePath || !label || !label.startsWith("\\")) {
      setImagePath(null);
      return;
    }

    const path = await join(savePath, IMAGES_FOLDER_NAME, label);
    setImagePath(convertFileSrc(path));
  };

  const isImage = label?.startsWith("\\");

  useEffect(() => {
    const resizeText = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        setFontSize(containerHeight * TEXT_HIGHT_PERCENTAGE);
        setBorderRadius(containerHeight * BORDER_RADIUS_PERCENTAGE);
      }
    };

    const observer = new ResizeObserver(() => {
      resizeText();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    updatePaths();
  }, [savePath, label]);

  return (
    <div
      className={`${styles.button} ${disabled ? styles.disabled : ""}`}
      style={{
        backgroundColor: backgroundColor,
        fontSize: fontSize,
        borderRadius: borderRadius,
        border: borderRadius ? undefined : "none",
      }}
      ref={containerRef}
    >
      {isImage ? (
        <img src={imagePath ?? ""} alt="image" className={styles.img} />
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
};

export default Button;
