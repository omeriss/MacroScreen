import { useMemo } from "react";
import { Button } from "../../../../interfaces/Buttons";
import FolderScreen from "../../../../interfaces/FolderScreen";
import { isFolderButton } from "../../../../utils/buttonTypeUtils";
import { InnerFolderItem, InnerItem } from "../InnerItem/InnerItem";

interface FolderNavigationItemProps {
  folders: FolderScreen;
  path: string[];
}

const FolderNavigationItem = ({ folders, path }: FolderNavigationItemProps) => {
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
          />
        ) : (
          <InnerItem
            key={`${path.join("/")}/${key}`}
            keyString={key}
            button={button}
            path={path}
          />
        )
      )}
    </>
  );
};

export default FolderNavigationItem;
