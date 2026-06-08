import { FunctionComponent, useRef } from "react";
import styles from "./ResizableSidePanel.module.css";

interface ResizableSidePanelProps {
  children: React.ReactNode;
  Subtitle?: FunctionComponent;
  title: string;
}

const ResizableSidePanel = ({
  children,
  Subtitle,
  title,
}: ResizableSidePanelProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = toolbarRef.current?.offsetWidth ?? 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (toolbarRef.current) {
        const newWidth = startWidth + e.clientX - startX;
        toolbarRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <section className={`toolbar-section ${styles.toolbar}`} ref={toolbarRef}>
      <div className="toolbar-section-head">
        <h2>{title}</h2>
      </div>
      {Subtitle && <Subtitle />}
      <div className="toolbar-section-main">{children}</div>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </section>
  );
};

export default ResizableSidePanel;
