import { useMemo, useState } from "react";
import ScreenMacroLogo from "../../assets/ScreenMacro.png";
import ButtonsScreen from "../../components/ButtonsScreen/ButtonsScreen";
import Editor from "../../components/Editor/Editor";
import FolderNavigation from "../../components/FolderNavigation/FolderNavigation";
import styles from "./MainPage.module.css";
import FolderScreen from "../../interfaces/FolderScreen";
import { Button, ButtonType, FolderButton } from "../../interfaces/Buttons";
import { isFolderButton } from "../../utils/buttonTypeUtils";

const MainPage = () => {
  const [path, setPath] = useState<string[]>([]);
  const [rootScreen, setRootScreen] = useState<FolderScreen>({
    buttons: {
      omer: {
        label: "omer",
        background: 0x000000,
        type: ButtonType.App,
        index: 0,
      },
      omer1: {
        label: "omer",
        background: 0x000000,
        type: ButtonType.App,
        index: 1,
      },
      omer2: {
        label: "folder",
        background: 0x000000,
        type: ButtonType.Folder,
        index: 1,
        folder: {
          buttons: {
            test: {
              label: "test",
              background: 0x000000,
              type: ButtonType.App,
              index: 0,
            },
            test2: {
              label: "test",
              background: 0x000000,
              type: ButtonType.Folder,
              index: 0,
              folder: {
                buttons: {
                  test3: {
                    label: "something",
                    background: 0x000000,
                    type: ButtonType.App,
                    index: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const addButton = (button: Button, key: string) => {
    const newRootScreen = { ...rootScreen };

    let currentScreen = newRootScreen;

    path.forEach((folder) => {
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

    currentScreen.buttons[key] = button;

    setRootScreen(newRootScreen);
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
        <section>File</section>
        <section>Edit</section>
        <section>Upload</section>
      </nav>
      <div className={styles.contentContainer}>
        <section className={styles.sideSelection}></section>
        <FolderNavigation
          folders={rootScreen}
          setPath={setPath}
          currentPath={path}
          addButton={addButton}
        />
        <div className={`toolbar-section ${styles.editSection}`}>
          <div className="toolbar-section-head"></div>
          <div className="toolbar-section-subtitle">{path.join(" > ")}</div>
          <section className="toolbar-section-main">
            <div className={styles.displaySection}>
              <ButtonsScreen folderScreen={currentScreen} />
            </div>
          </section>
        </div>
        <Editor />
      </div>
    </main>
  );
};

export default MainPage;
