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

  return (
    <div className={sytles.screen}>
      {Object.entries(folderScreen.buttons).map(([key, button]) => (
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
