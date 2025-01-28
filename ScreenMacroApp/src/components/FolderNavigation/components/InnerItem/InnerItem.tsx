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
  addButton: (button: Button, key: string, modifyPath?: string[]) => void;
  removeButton: (key: string, modifyPath?: string[]) => void;
}

const isSelected = (path: string[], keyString: string, currentPath: string[]) =>
  [...path, keyString].join("/") === currentPath.join("/");

export const InnerItem = ({
  keyString,
  button,
  path,
  setPath,
  currentPath,
  addButton,
  removeButton,
}: InnerItemProps & { button: Button }) => {
  const padding = (INIT_TAB + path.length) * PADDING;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ button, path, keyString })
    );

    console.log("drag start", button, path);
  };

  return (
    <>
      <div
        className={`${styles.item} ${
          isSelected(path, keyString, currentPath) ? styles.selected : ""
        }`}
        style={{ paddingLeft: padding }}
        onClick={() => setPath([...path, keyString])}
        draggable
        onDragStart={handleDragStart}
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
  addButton,
  removeButton,
}: InnerItemProps & { button: FolderButton }) => {
  const [open, setOpen] = useState(false);

  const padding = (INIT_TAB + path.length) * PADDING - FOLDER_PADDING_DEC;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ button, path, keyString })
    );
    e.dataTransfer.effectAllowed = "all";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.boxShadow = "none";

    const data = e.dataTransfer.getData("application/json");
    const draggedItem = JSON.parse(data);

    if (
      `${path.join("/")}${keyString}`.startsWith(
        `${draggedItem.path.join("/")}${draggedItem.keyString}`
      )
    ) {
      return;
    }

    removeButton(draggedItem.keyString, draggedItem.path);
    addButton(draggedItem.button, draggedItem.keyString, [...path, keyString]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    const data = e.dataTransfer.getData("application/json");
    const draggedItem = JSON.parse(data);

    if (
      `${path.join("/")}${keyString}`.startsWith(
        `${draggedItem.path.join("/")}${draggedItem.keyString}`
      )
    ) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.dataTransfer.dropEffect = "move";

    const targetRect = e.currentTarget.getBoundingClientRect();
    const dropPosition =
      e.clientY - targetRect.top < targetRect.height / 2 ? "top" : "bottom";

    (e.currentTarget as HTMLElement).style.boxShadow =
      dropPosition === "top"
        ? "0 1px 0 0 black inset, 0 -1px 0 0 black"
        : "0 -1px 0 0 black inset, 0 1px 0 0 black";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  };

  return (
    <>
      <div
        className={`${styles.item} ${
          isSelected(path, keyString, currentPath) ? styles.selected : ""
        }`}
        style={{ paddingLeft: padding }}
        onDoubleClick={() => setOpen(!open)}
        onClick={() => setPath([...path, keyString])}
        draggable
        onDragStart={handleDragStart}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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
          addButton={addButton}
          removeButton={removeButton}
        />
      )}
    </>
  );
};
