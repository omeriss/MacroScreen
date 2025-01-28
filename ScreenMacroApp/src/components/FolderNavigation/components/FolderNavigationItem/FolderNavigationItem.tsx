import { Button } from "../../../../interfaces/Buttons";
import FolderScreen from "../../../../interfaces/FolderScreen";
import { isFolderButton } from "../../../../utils/buttonTypeUtils";
import { InnerFolderItem, InnerItem } from "../InnerItem/InnerItem";

interface FolderNavigationItemProps {
  folders: FolderScreen;
  path: string[];
  setPath: (path: string[]) => void;
  currentPath: string[];
  addButton: (button: Button, key: string, modifyPath?: string[]) => void;
  removeButton: (key: string, modifyPath?: string[]) => void;
}

const FolderNavigationItem = ({
  folders,
  path,
  setPath,
  currentPath,
  addButton,
  removeButton,
}: FolderNavigationItemProps) => {
  return (
    <>
      {Object.entries(folders.buttons).map(([key, button]) =>
        isFolderButton(button) ? (
          <InnerFolderItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            currentPath={currentPath}
            path={path}
            setPath={setPath}
            addButton={addButton}
            removeButton={removeButton}
          />
        ) : (
          <InnerItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            currentPath={currentPath}
            path={path}
            setPath={setPath}
            addButton={addButton}
            removeButton={removeButton}
          />
        )
      )}
    </>
  );
};

export default FolderNavigationItem;
