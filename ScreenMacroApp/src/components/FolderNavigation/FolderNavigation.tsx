import { useRef } from "react";
import FolderScreen from "../../interfaces/FolderScreen";
import FolderNavigationItem from "./components/FolderNavigationItem/FolderNavigationItem";
import styles from "./FolderNavigation.module.css";
import { MdCreateNewFolder, MdNoteAdd } from "react-icons/md";
import { Button, ButtonType } from "../../interfaces/Buttons";
import CreateButton from "../CreateButton/CreateButton";

interface FolderNavigationProps {
  folders: FolderScreen;
  setPath: (path: string[]) => void;
  currentPath: string[];
  addButton: (button: Button, key: string) => void;
}

const FolderNavigation = ({
  folders,
  setPath,
  currentPath,
  addButton,
}: FolderNavigationProps) => {
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
          <CreateButton>
            <MdNoteAdd />
          </CreateButton>
          <CreateButton>
            <MdCreateNewFolder />
          </CreateButton>
        </div>
      </div>
      <div className="toolbar-section-main">
        <FolderNavigationItem
          folders={folders}
          path={[]}
          setPath={setPath}
          currentPath={currentPath}
        />
      </div>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </section>
  );
};

export default FolderNavigation;
