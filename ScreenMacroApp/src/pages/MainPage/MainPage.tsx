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
import {
  pathState,
  rootScreenState,
  selectedNavigationPanelState,
} from "../../store/store";
import TopNavigation from "../../components/TopNavigation/TopNavigation";
import useProject from "../../hooks/project";
import { MdContentCopy, MdUpload, MdHistory } from "react-icons/md";
import { navigationPanels } from "../../config/navigationPanels";

const MainPage = () => {
  const [path, setPath] = useRecoilState<string[]>(pathState);
  const [rootScreen, setRootScreen] =
    useRecoilState<FolderScreen>(rootScreenState);
  const project = useProject();
  const [selectedNavigationPanel, setNavigationPanel] = useRecoilState(
    selectedNavigationPanelState
  );

  useEffect(() => {
    project.tryOpenLastProject();
  }, []);

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
        <section className={styles.sideSelection}>
          {navigationPanels.map((icon, index) => {
            const Icon = icon.icon;
            return (
              <div
                key={index}
                className={`${styles.selectionItem} ${
                  selectedNavigationPanel === index ? styles.iconSelected : ""
                }`}
                onClick={() => setNavigationPanel(index)}
              >
                <Icon />
              </div>
            );
          })}
        </section>
        {navigationPanels[selectedNavigationPanel].component({})}
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
