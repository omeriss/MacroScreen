import Modal from "react-modal";
import styles from "./EditScript.module.css";
import popupStyles from "./../../styles/popup.module.css";
import { useEffect, useMemo, useState } from "react";
import {
  writeFile,
  create,
  exists,
  readFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { useRecoilValue } from "recoil";
import { savePathState } from "../../store/store";
import { PROGRAMDATA_FOLDER_NAME } from "../../config/projectfolder.config";
import { join } from "@tauri-apps/api/path";
import { SCRIPT_EXTENSIONS } from "./EditScript.config";

interface EditScriptProps {
  value: string;
  setValue: (value: string) => void;
}

const EditScript = ({ value, setValue }: EditScriptProps) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [script, setScript] = useState("");
  const savePath = useRecoilValue(savePathState);
  const scriptType = useMemo(() => value.split(".")[1], [value]);

  const close = () => {
    setIsOpen(false);

    join(savePath!, PROGRAMDATA_FOLDER_NAME, value).then((path) => {
      writeFile(path, new TextEncoder().encode(script));
    });
  };

  const changeType = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    remove(await join(savePath!, PROGRAMDATA_FOLDER_NAME, value));
    const newValue = `${value.split(".")[0]}.${newType}`;
    setValue(newValue);
    writeFile(
      await join(savePath!, PROGRAMDATA_FOLDER_NAME, newValue),
      new TextEncoder().encode(script)
    );
  };

  const loadFile = async () => {
    if (!savePath) return;

    const path = await join(savePath!, PROGRAMDATA_FOLDER_NAME, value);

    if (value === "" || !(await exists(path))) {
      const val = `${crypto
        .getRandomValues(new Uint32Array(1))[0]
        .toString()}.${SCRIPT_EXTENSIONS.powershell}`;
      setValue(val);
      setScript("");

      await create(await join(savePath!, PROGRAMDATA_FOLDER_NAME, val));

      return;
    }

    setScript(new TextDecoder().decode(await readFile(path)));

    return;
  };

  useEffect(() => {
    if (!modalIsOpen) return;

    loadFile();
  }, [modalIsOpen]);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={close}
        className={`${popupStyles.modal} ${styles.modal}`}
        overlayClassName={popupStyles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        <div className={styles.modalMainSection}>
          <textarea
            className={styles.textArea}
            placeholder="Enter your script here"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          ></textarea>
          <div>
            <select
              className={styles.select}
              value={scriptType}
              onChange={changeType}
            >
              {Object.values(SCRIPT_EXTENSIONS).map((ext) => (
                <option key={ext} value={ext}>
                  {ext}
                </option>
              ))}
            </select>

            <button className={styles.editButton} onClick={close}>
              Save
            </button>
          </div>
        </div>
      </Modal>
      <button className={styles.editButton} onClick={() => setIsOpen(true)}>
        Edit Script
      </button>
    </>
  );
};

export default EditScript;
