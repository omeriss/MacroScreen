import { useMemo } from "react";
import FolderScreen from "../../interfaces/FolderScreen";
import Button from "../Button/Button";
import sytles from "./ButtonsScreen.module.css";
import { ButtonsInScreen } from "./ButtonsScreen.config";

interface ButtonsScreenProps {
  folderScreen: FolderScreen;
}

const ButtonsScreen = ({ folderScreen }: ButtonsScreenProps) => {
  const keysLength = Object.keys(folderScreen.buttons).length;

  // sort the buttons by index
  const sortedButtons = useMemo(
    () =>
      Object.entries(folderScreen.buttons).sort(
        ([, a], [, b]) => a.index - b.index
      ),
    [folderScreen]
  );

  return (
    <div className={sytles.screen}>
      {sortedButtons.map(([key, button]) => (
        <Button key={key} {...button} />
      ))}
      {keysLength < ButtonsInScreen &&
        Array.from({
          length: ButtonsInScreen - keysLength,
        }).map((_, i) => <Button key={`disabled-${i}`} disabled={true} />)}
    </div>
  );
};

export default ButtonsScreen;
