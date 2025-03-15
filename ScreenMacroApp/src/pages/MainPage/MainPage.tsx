import { useEffect, useMemo } from "react";
import ScreenMacroLogo from "../../assets/ScreenMacro.png";
import ButtonsScreen from "../../components/ButtonsScreen/ButtonsScreen";
import Editor from "../../components/Editor/Editor";
import styles from "./MainPage.module.css";
import FolderScreen from "../../interfaces/FolderScreen";
import { FolderButton } from "../../interfaces/Buttons";
import { useRecoilState } from "recoil";
import {
  pathState,
  rootScreenState,
  selectedNavigationPanelState,
} from "../../store/store";
import TopNavigation from "../../components/TopNavigation/TopNavigation";
import useProject from "../../hooks/project";
import { NAVIGATION_PANELS } from "../../config/navigationPanels";
import CreateButton from "../../components/CreateButton/CreateButton";

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

  const PanelComponent = NAVIGATION_PANELS[selectedNavigationPanel].component;

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
          {NAVIGATION_PANELS.map((icon, index) => {
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
        <PanelComponent />
        <CreateButton />
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
