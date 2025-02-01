import { useState, useRef, useEffect } from "react";
import styles from "./ExpandedButtons.module.css";
import ButtonOption from "./interfaces/ButtonOption";

interface ExpandedButtonProps {
  children: React.ReactNode;
  buttons: ButtonOption[];
}

const ExpandedButton = ({ children, buttons }: ExpandedButtonProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.buttonContainer} ref={menuRef}>
      <button className={styles.mainButton} onClick={() => setOpen(!open)}>
        {children}
      </button>
      {open && (
        <div className={styles.menu}>
          {buttons.map((button, index) => (
            <button
              key={index}
              className={styles.menuButton}
              onClick={() => {
                button.onClick();
                setOpen(false);
              }}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpandedButton;
