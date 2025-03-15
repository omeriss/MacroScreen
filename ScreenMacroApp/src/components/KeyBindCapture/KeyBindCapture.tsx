import { useState, useEffect, useMemo } from "react";
import { KEY_CODES, REPLACEMENTS } from "./KeyBind.config";
import styles from "./KeybindButton.module.css";

interface KeybindButtonProps {
  value: number[];
  setValue: (value: number[]) => void;
}

const KeybindButton = ({ value, setValue }: KeybindButtonProps) => {
  const [listening, setListening] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const formatKeybind = (keys: Set<string>) => {
    console.log(keys);
    return [...keys]
      .map((key) =>
        Object.entries(REPLACEMENTS).reduce(
          (acc, keyName) => acc.replace(keyName[0], keyName[1]),
          key
        )
      )
      .sort((a, b) => (a.length > b.length ? -1 : 1))
      .map((key) => (KEY_CODES[key] as number) || key.charCodeAt(0));
  };

  useEffect(() => {
    if (!listening) return;

    const handleKeydown = (event: KeyboardEvent) => {
      event.preventDefault();
      setPressedKeys((prev) => new Set(prev).add(event.key));
    };

    const handleKeyup = () => {
      if (pressedKeys.size > 0) {
        setValue(formatKeybind(pressedKeys));
        setPressedKeys(new Set());
        setListening(false);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);
    };
  }, [listening, pressedKeys]);

  const keybind = useMemo(() => {
    if (!Array.isArray(value)) return "ERROR";

    return value
      .map((key) => {
        const keyName = Object.keys(KEY_CODES).find(
          (keyName) => KEY_CODES[keyName] === key
        );

        if (keyName) return keyName;
        return String.fromCharCode(key);
      })
      .join(" + ");
  }, [value]);

  return (
    <>
      <label htmlFor="color">Keys</label>
      <button
        onClick={() => {
          setListening(true);
          setValue([]);
        }}
        className={styles.button}
        id="color"
      >
        {listening ? "Press any key..." : keybind || "Set Keybind"}
      </button>
    </>
  );
};

export default KeybindButton;
