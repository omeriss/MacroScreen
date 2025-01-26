import FolderScreen from "../../../../interfaces/FolderScreen";
import { isFolderButton } from "../../../../utils/buttonTypeUtils";
import { InnerFolderItem, InnerItem } from "../InnerItem/InnerItem";

interface FolderNavigationItemProps {
  folders: FolderScreen;
  path: string[];
  setPath: (path: string[]) => void;
  currentPath: string[];
}

const FolderNavigationItem = ({
  folders,
  path,
  setPath,
  currentPath,
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
          />
        ) : (
          <InnerItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            currentPath={currentPath}
            path={path}
            setPath={setPath}
          />
        )
      )}
    </>
  );
};

export default FolderNavigationItem;
