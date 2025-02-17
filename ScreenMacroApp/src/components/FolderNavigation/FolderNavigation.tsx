import { useRef } from "react";
import FolderNavigationItem from "./components/FolderNavigationItem/FolderNavigationItem";
import styles from "./FolderNavigation.module.css";
import { MdCreateNewFolder, MdNoteAdd } from "react-icons/md";
import CreateButton, { CreateType } from "../CreateButton/CreateButton";
import { useRecoilValue } from "recoil";
import { rootScreenState } from "../../store/store";
import ContextMenu from "../ContextMenu/ContextMenu";
import useButtonControl from "../../hooks/buttonControl";

interface FolderNavigationProps {}

const FolderNavigation = ({}: FolderNavigationProps) => {
  const folders = useRecoilValue(rootScreenState);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { removeButton, addButton } = useButtonControl();

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
          <CreateButton type={CreateType.BUTTON}>
            <MdNoteAdd />
          </CreateButton>
          <CreateButton type={CreateType.FOLDER}>
            <MdCreateNewFolder />
          </CreateButton>
        </div>
      </div>
      <div className="toolbar-section-main" style={{ flexGrow: 1 }}>
        <FolderNavigationItem folders={folders} path={[]} />
        <ContextMenu
          style={{ height: "100%", minHeight: "100px" }}
          options={[]}
        >
          <div
            style={{ height: "100%" }}
            onDrop={(e) => {
              const data = e.dataTransfer.getData("application/json");
              const draggedItem = JSON.parse(data);

              removeButton(draggedItem.keyString, draggedItem.path);
              addButton(draggedItem.button, draggedItem.keyString, []);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
          />
        </ContextMenu>
      </div>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </section>
  );
};

export default FolderNavigation;
