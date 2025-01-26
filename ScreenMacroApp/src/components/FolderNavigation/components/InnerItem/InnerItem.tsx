import { useState } from "react";
import { Button, FolderButton } from "../../../../interfaces/Buttons";
import styles from "./InnerItem.module.css";
import {
  FOLDER_PADDING_DEC,
  ICONS,
  INIT_TAB,
  PADDING,
} from "./InnerItem.config";
import {
  MdChevronRight,
  MdDescription,
  MdFolder,
  MdFolderOpen,
} from "react-icons/md";
import FolderNavigationItem from "../FolderNavigationItem/FolderNavigationItem";

interface InnerItemProps {
  keyString: string;
  path: string[];
  setPath: (path: string[]) => void;
  currentPath: string[];
}

const isSelected = (path: string[], keyString: string, currentPath: string[]) =>
  [...path, keyString].join("/") === currentPath.join("/");

export const InnerItem = ({
  keyString,
  button,
  path,
  setPath,
  currentPath,
}: InnerItemProps & { button: Button }) => {
  const padding = (INIT_TAB + path.length) * PADDING;

  return (
    <>
      <div
        className={`${styles.item} ${
          isSelected(path, keyString, currentPath) ? styles.selected : ""
        }`}
        style={{ paddingLeft: padding }}
        onClick={() => setPath([...path, keyString])}
      >
        <div>
          {(ICONS[button.type] ?? MdDescription)({})}
          {keyString}
        </div>
      </div>
    </>
  );
};

export const InnerFolderItem = ({
  keyString,
  button,
  path,
  setPath,
  currentPath,
}: InnerItemProps & { button: FolderButton }) => {
  const [open, setOpen] = useState(false);

  const padding = (INIT_TAB + path.length) * PADDING - FOLDER_PADDING_DEC;

  return (
    <>
      <div
        className={`${styles.item} ${
          isSelected(path, keyString, currentPath) ? styles.selected : ""
        }`}
        style={{ paddingLeft: padding }}
        onDoubleClick={() => setOpen(!open)}
        onClick={() => setPath([...path, keyString])}
      >
        <div>
          <MdChevronRight
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
            style={{ transform: open ? "rotate(90deg)" : "" }}
          />
          {open ? <MdFolderOpen /> : <MdFolder />}
          {keyString}
        </div>
      </div>
      {open && (
        <FolderNavigationItem
          folders={button.folder}
          path={[...path, keyString]}
          setPath={setPath}
          currentPath={currentPath}
        />
      )}
    </>
  );
};
