import { useEffect, useState } from "react";
import styles from "./AppSelection.module.css";
import popupStyles from "../../styles/popup.module.css";
import Modal from "react-modal";
import { homeDir, dirname, join } from "@tauri-apps/api/path";
import { DirEntry, readDir } from "@tauri-apps/plugin-fs";
import {
  COMPUTER_PROGRAMS,
  LINK_FILE_TYPES,
  USER_PROGRAMS,
} from "./AppSelection.config";
import { useRecoilValue } from "recoil";
import { savePathState } from "../../store/store";
import { IMAGES_FOLDER_NAME } from "../../config/projectfolder.config";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Button } from "../../interfaces/Buttons";

interface Program {
  name: string;
  path: string;
}

interface AppSelectionProps {
  value: string;
  setValue: (value: string) => void;
  setButton: (func: (button: Button) => Button) => void;
}

const AppSelection = ({ value, setValue, setButton }: AppSelectionProps) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Program>();
  const [imgPath, setImgPath] = useState<string>();
  const savePath = useRecoilValue(savePathState);

  const close = () => {
    setIsOpen(false);
  };

  const getLinksRecursive = async (path: string): Promise<Program[]> => {
    const files = await readDir(path);

    const links = await Promise.all(
      files
        .filter((file) =>
          LINK_FILE_TYPES.some((link) => file.name.toLowerCase().endsWith(link))
        )
        .map(
          async (file): Promise<Program> => ({
            name: file.name.replace(/\.[^/.]+$/, ""),
            path: await join(path, file.name),
          })
        )
    );

    const linksFromDirectories = await Promise.all(
      files
        .filter((file) => file.isDirectory)
        .map((directory: DirEntry) =>
          join(path, directory.name).then((dirPath) =>
            getLinksRecursive(dirPath)
          )
        )
    );

    return [...links, ...linksFromDirectories.flat()];
  };

  useEffect(() => {
    if (!modalIsOpen) return;

    const fetchApps = async () => {
      const home = await homeDir();

      setApps([
        ...(await getLinksRecursive(await join(home, USER_PROGRAMS))),
        ...(await getLinksRecursive(
          await join(await dirname(await dirname(home)), COMPUTER_PROGRAMS)
        )),
      ]);

      const app = apps.find((app) => app.name === value);

      if (app) {
        setSelectedApp(app);
      }
    };

    fetchApps();
  }, [modalIsOpen]);

  const convertImgNameToPng = (name: string) =>
    `${name.replace(/ /g, "-").replace(/\./g, "-")}.png`;

  const updateLinkImg = async () => {
    if (!savePath || !selectedApp) return;

    const path = await join(
      savePath,
      IMAGES_FOLDER_NAME,
      convertImgNameToPng(selectedApp?.name)
    );

    try {
      await invoke("save_file_icon", {
        path: selectedApp?.path,
        savePath: path,
      });

      console.log(path);

      setImgPath(path);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    updateLinkImg();
  }, [selectedApp]);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={close}
        className={`${popupStyles.modal} ${styles.modal}`}
        overlayClassName={popupStyles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        {
          <section>
            <h1>Apps</h1>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
            <ul className={styles.appsList}>
              {apps
                .filter((app) =>
                  app.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((app) => (
                  <li
                    key={app.path}
                    className={
                      selectedApp?.name === app.name ? styles.selected : ""
                    }
                    onClick={() => {
                      setValue(app.name);
                      setSelectedApp(app);
                    }}
                  >
                    {app.name}
                  </li>
                ))}
            </ul>
            {imgPath && (
              <div className={styles.appIcon}>
                <img src={convertFileSrc(imgPath)} alt="App icon" />
                <button
                  onClick={() =>
                    setButton((button) => ({
                      ...button,
                      label: `/${convertImgNameToPng(selectedApp?.name ?? "")}`,
                    }))
                  }
                >
                  set as img
                </button>
              </div>
            )}
          </section>
        }
      </Modal>
      <section className={styles.appSelect} onClick={() => setIsOpen(true)}>
        <div>
          <label>App</label>
          <input type="text" disabled placeholder="Path" value={value} />
        </div>
      </section>
    </>
  );
};

export default AppSelection;
