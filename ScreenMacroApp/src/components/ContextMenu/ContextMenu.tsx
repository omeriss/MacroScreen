import { MouseEventHandler, useEffect, useRef, useState } from "react";
import styles from "./ContextMenu.module.css";

export interface Option {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  options: Option[];
}

const ContextMenu = ({ children, style, options }: ContextMenuProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu: MouseEventHandler = (event) => {
    event.preventDefault();

    if (!containerRef.current) return;

    setPosition({
      x: event.pageX,
      y: event.pageY,
    });

    setMenuVisible(true);
  };

  useEffect(() => {
    if (!menuVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        event.target &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(
          containerRef.current?.contains(event.target as Node) &&
          event.type === "contextmenu"
        )
      ) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [menuVisible]);

  return (
    <div
      onContextMenu={handleContextMenu}
      ref={containerRef}
      className={styles.container}
      style={style}
    >
      {children}
      {menuVisible && (
        <ul
          ref={menuRef}
          className={styles.menu}
          style={{ top: position.y, left: position.x }}
        >
          {options.map((option, index) => (
            <li
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                option.onClick();
                setMenuVisible(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContextMenu;
