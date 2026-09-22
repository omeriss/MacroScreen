import { FolderButton, Button } from "../interfaces/Buttons";
import FolderScreen from "../interfaces/FolderScreen";
import { isFolderButton } from "../utils/buttonTypeUtils";
import { useRecoilState } from "recoil";
import {
  createButtonState,
  CreateType,
  pathState,
  rootScreenState,
} from "../store/store";
import { toast } from "react-toastify";

const useButtonControl = () => {
  const [path, setPath] = useRecoilState<string[]>(pathState);
  const [_, setRootScreen] = useRecoilState<FolderScreen>(rootScreenState);
  const [__, setCreateButton] = useRecoilState(createButtonState);

  const deepCopyToPath = (basePath: string[], screen: FolderScreen) => {
    const newRootScreen = { ...screen };

    let currentScreen = newRootScreen;

    basePath.forEach((folder) => {
      if (isFolderButton(currentScreen.buttons[folder])) {
        currentScreen.buttons = { ...currentScreen.buttons };
        currentScreen.buttons[folder] = { ...currentScreen.buttons[folder] };
        (currentScreen.buttons[folder] as FolderButton).folder = {
          ...(currentScreen.buttons[folder] as FolderButton).folder,
        };

        currentScreen = (currentScreen.buttons[folder] as FolderButton).folder;
      }
    });

    currentScreen.buttons = { ...currentScreen.buttons };

    return [newRootScreen, currentScreen];
  };

  const addButton = (
    button: Button,
    key: string,
    modifyPath?: string[],
    index?: number
  ) => {
    setRootScreen((prev) => {
      const [newRootScreen, currentScreen] = deepCopyToPath(
        modifyPath ?? path,
        prev
      );

      button.index = index ?? Object.keys(currentScreen.buttons).length;

      currentScreen.buttons = Object.fromEntries(
        Object.entries(currentScreen.buttons).map(([key, buttonTemp]) => [
          key,
          buttonTemp.index >= button.index
            ? { ...buttonTemp, index: button.index + 1 }
            : buttonTemp,
        ])
      );

      // check if there is a button with the same key
      if (currentScreen.buttons[key] != undefined) {
        toast.error("Button with the same name already exists");
        return prev;
      }

      currentScreen.buttons[key] = button;

      return newRootScreen;
    });
  };

  const removeButton = (key: string, modifyPath?: string[]) => {
    if (path.join("/") == [...(modifyPath ?? path), key].join("/")) {
      setPath((prev) => prev.slice(0, -1));
    }

    setRootScreen((prev) => {
      const [newRootScreen, currentScreen] = deepCopyToPath(
        modifyPath ?? path,
        prev
      );
      const index = currentScreen.buttons[key].index;
      delete currentScreen.buttons[key];
      currentScreen.buttons = Object.fromEntries(
        Object.entries(currentScreen.buttons).map(([key, button]) => [
          key,
          button.index > index
            ? { ...button, index: button.index - 1 }
            : button,
        ])
      );

      return newRootScreen;
    });
  };

  const editButton = (newButton: Button, modifyPath?: string[]) => {
    setRootScreen((prev) => {
      modifyPath = modifyPath ?? path;
      const [newRootScreen, currentScreen] = deepCopyToPath(
        modifyPath.slice(0, -1),
        prev
      );
      currentScreen.buttons[modifyPath[modifyPath.length - 1]] = newButton;

      return newRootScreen;
    });
  };

  const changeIndex = (
    key: string,
    newIndex: number,
    modifyPath?: string[]
  ) => {
    setRootScreen((prev) => {
      const [newRootScreen, currentScreen] = deepCopyToPath(
        (modifyPath ?? path).slice(0, -1),
        prev
      );
      const oldIndex = currentScreen.buttons[key].index;

      currentScreen.buttons = Object.fromEntries(
        Object.entries(currentScreen.buttons).map(([key, button]) => [
          key,
          button.index == oldIndex
            ? { ...button, index: newIndex }
            : button.index > oldIndex && button.index <= newIndex
            ? { ...button, index: button.index - 1 }
            : button.index < oldIndex && button.index >= newIndex
            ? { ...button, index: button.index + 1 }
            : button,
        ])
      );

      currentScreen.buttons[key].index = newIndex;

      return newRootScreen;
    });
  };

  const createButtonPopup = (type: CreateType, modifyPath?: string[]) => {
    setCreateButton({ type, path: modifyPath });
  };

  return {
    addButton,
    removeButton,
    editButton,
    changeIndex,
    createButtonPopup,
  };
};

export default useButtonControl;
