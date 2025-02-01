import { useRef } from "react";
import FolderScreen from "../../interfaces/FolderScreen";
import FolderNavigationItem from "./components/FolderNavigationItem/FolderNavigationItem";
import styles from "./FolderNavigation.module.css";
import { MdCreateNewFolder, MdNoteAdd } from "react-icons/md";
import { Button, ButtonType } from "../../interfaces/Buttons";
import CreateButton, { CreateType } from "../CreateButton/CreateButton";
import { useRecoilValue } from "recoil";
import { rootScreenState } from "../../store/store";

interface FolderNavigationProps {
  addButton: (button: Button, key: string, modifyPath?: string[]) => void;
  removeButton: (key: string, modifyPath?: string[]) => void;
}

const FolderNavigation = ({
  addButton,
  removeButton,
}: FolderNavigationProps) => {
  const folders = useRecoilValue(rootScreenState);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = toolbarRef.current?.offsetWidth ?? 0;

    console.log(startWidth, "startWidth");
    console.log(startX, "startX");

    const handleMouseMove = (e: MouseEvent) => {
      console.log(e.clientX);
      if (toolbarRef.current) {
        const newWidth = startWidth + e.clientX - startX;
        console.log(newWidth, "newWidth");
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
        <h2>Explorer</h2>
      </div>
      <div className={`toolbar-section-subtitle ${styles.toolbarSubtitle}`}>
        <h3>test</h3>
        <div>
          <CreateButton type={CreateType.BUTTON} addButton={addButton}>
            <MdNoteAdd />
          </CreateButton>
          <CreateButton type={CreateType.FOLDER} addButton={addButton}>
            <MdCreateNewFolder />
          </CreateButton>
        </div>
      </div>
      <div className="toolbar-section-main">
        <FolderNavigationItem
          folders={folders}
          path={[]}
          addButton={addButton}
          removeButton={removeButton}
        />
      </div>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </section>
  );
};

export default FolderNavigation;
