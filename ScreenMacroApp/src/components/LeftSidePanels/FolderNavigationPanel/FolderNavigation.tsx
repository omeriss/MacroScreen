import FolderNavigationItem from "./components/FolderNavigationItem/FolderNavigationItem";
import styles from "./FolderNavigation.module.css";
import { MdCreateNewFolder, MdNoteAdd } from "react-icons/md";
import { useRecoilValue } from "recoil";
import { CreateType, rootScreenState } from "../../../store/store";
import ContextMenu from "../../ContextMenu/ContextMenu";
import useButtonControl from "../../../hooks/buttonControl";
import ResizableSidePanel from "../ResizableSidePanel/ResizableSidePanel";
import { toast } from "react-toastify";

interface FolderNavigationProps {}

const FolderNavigation = ({}: FolderNavigationProps) => {
  const folders = useRecoilValue(rootScreenState);
  const { removeButton, addButton, createButtonPopup } = useButtonControl();

  return (
    <ResizableSidePanel
      title="Explorer"
      Subtitle={() => (
        <div className={`toolbar-section-subtitle ${styles.toolbarSubtitle}`}>
          <h3>Folder View</h3>
          <div>
            <div onClick={() => createButtonPopup(CreateType.BUTTON)}>
              <MdNoteAdd />
            </div>
            <div onClick={() => createButtonPopup(CreateType.FOLDER)}>
              <MdCreateNewFolder />
            </div>
          </div>
        </div>
      )}
    >
      <FolderNavigationItem folders={folders} path={[]} />
      <ContextMenu
        style={{ height: "100%", minHeight: "100px" }}
        options={[
          {
            label: "Add Folder",
            onClick: () => createButtonPopup(CreateType.FOLDER, []),
          },
          {
            label: "Add Button",
            onClick: () => createButtonPopup(CreateType.BUTTON, []),
          },
        ]}
      >
        <div
          style={{ height: "100%" }}
          onDrop={(e) => {
            const data = e.dataTransfer.getData("application/json");
            const draggedItem = JSON.parse(data);

            if (folders.buttons[draggedItem.keyString] !== undefined) {
              toast.error("name already exists");
              return;
            }

            removeButton(draggedItem.keyString, draggedItem.path);
            addButton(draggedItem.button, draggedItem.keyString, []);
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
        />
      </ContextMenu>
    </ResizableSidePanel>
  );
};

export default FolderNavigation;
