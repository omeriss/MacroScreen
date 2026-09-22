import { Button, ButtonType, FolderButton } from "../interfaces/Buttons";

export const isFolderButton = (button: Button): button is FolderButton => {
  return button.type === ButtonType.Folder;
};
