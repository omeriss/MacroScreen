import { useEffect, useMemo, useState } from "react";
import ScreenMacroLogo from "../../assets/ScreenMacro.png";
import ButtonsScreen from "../../components/ButtonsScreen/ButtonsScreen";
import Editor from "../../components/Editor/Editor";
import FolderNavigation from "../../components/FolderNavigation/FolderNavigation";
import styles from "./MainPage.module.css";
import FolderScreen from "../../interfaces/FolderScreen";
import { Button, ButtonType, FolderButton } from "../../interfaces/Buttons";
import { isFolderButton } from "../../utils/buttonTypeUtils";
import { useRecoilState } from "recoil";
import { pathState, rootScreenState } from "../../store/store";
import TopNavigation from "../../components/TopNavigation/TopNavigation";
import useProject from "../../hooks/project";

const MainPage = () => {
  const [path, setPath] = useRecoilState<string[]>(pathState);
  const [rootScreen, setRootScreen] =
    useRecoilState<FolderScreen>(rootScreenState);
  const project = useProject();

  useEffect(() => {
    project.tryOpenLastProject();
  }, []);

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
        Object.entries(currentScreen.buttons).map(([key, button]) => [
          key,
          button.index >= button.index
            ? { ...button, index: button.index + 1 }
            : button,
        ])
      );

      currentScreen.buttons[key] = button;

      return newRootScreen;
    });
  };

  const removeButton = (key: string, modifyPath?: string[]) => {
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
      console.log(modifyPath);
      const [newRootScreen, currentScreen] = deepCopyToPath(modifyPath, prev);
      currentScreen.buttons[modifyPath[modifyPath.length - 1]] = newButton;

      return newRootScreen;
    });
  };

  const currentScreen = useMemo(() => {
    return path.reduce(
      (screen, folder, index) =>
        index == path.length - 1
          ? screen
          : (screen.buttons[folder] as FolderButton).folder,
      rootScreen
    );
  }, [path, rootScreen]);

  return (
    <main className={styles.mainPage}>
      <nav className={styles.nav}>
        <section>
          <img
            className={styles.logo}
            src={ScreenMacroLogo}
            alt="ScreenMacro Logo"
          />
        </section>
        <TopNavigation />
      </nav>
      <div className={styles.contentContainer}>
        <section className={styles.sideSelection}></section>
        <FolderNavigation addButton={addButton} removeButton={removeButton} />
        <div className={`toolbar-section ${styles.editSection}`}>
          <div className="toolbar-section-head"></div>
          <div className="toolbar-section-subtitle">{path.join(" > ")}</div>
          <section className="toolbar-section-main">
            <div className={styles.displaySection}>
              <ButtonsScreen folderScreen={currentScreen} />
            </div>
          </section>
        </div>
        <Editor editButton={editButton} />
      </div>
    </main>
  );
};

export default MainPage;
