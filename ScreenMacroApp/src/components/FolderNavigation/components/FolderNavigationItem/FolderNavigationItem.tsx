import { useMemo } from "react";
import { Button } from "../../../../interfaces/Buttons";
import FolderScreen from "../../../../interfaces/FolderScreen";
import { isFolderButton } from "../../../../utils/buttonTypeUtils";
import { InnerFolderItem, InnerItem } from "../InnerItem/InnerItem";

interface FolderNavigationItemProps {
  folders: FolderScreen;
  path: string[];
  addButton: (button: Button, key: string, modifyPath?: string[]) => void;
  removeButton: (key: string, modifyPath?: string[]) => void;
}

const FolderNavigationItem = ({
  folders,
  path,
  addButton,
  removeButton,
}: FolderNavigationItemProps) => {
  const sortedButtons = useMemo(
    () =>
      Object.entries(folders.buttons).sort(([, a], [, b]) => a.index - b.index),
    [folders]
  );

  return (
    <>
      {sortedButtons.map(([key, button]) =>
        isFolderButton(button) ? (
          <InnerFolderItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            path={path}
            addButton={addButton}
            removeButton={removeButton}
          />
        ) : (
          <InnerItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            path={path}
            addButton={addButton}
            removeButton={removeButton}
          />
        )
      )}
    </>
  );
};

export default FolderNavigationItem;
