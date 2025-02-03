import Modal from "react-modal";
import popupStyles from "../../styles/popup.module.css";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { exists } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import useProject from "../../hooks/project";
import styles from "./CreateProjectModal.module.css";

interface CreateModelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal = ({ isOpen, onClose }: CreateModelProps) => {
  const [savePath, setSavePath] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const project = useProject();

  const handleSavePath = () => {
    open({
      multiple: false,
      directory: true,
    })
      .then((result) => {
        if (result === null) return;

        setSavePath(result);
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = async () => {
    const path = await join(savePath, name);

    if (name === "") {
      setError("Name cannot be empty");
      return;
    }

    if (savePath === "") {
      setError("Path cannot be empty");
      return;
    }

    if (await exists(path)) {
      setError("This path is not empty");
      return;
    }

    const error = await project.createProject(path);

    if (error) {
      setError(error);
      return;
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={popupStyles.modal}
      overlayClassName={popupStyles.overlay}
      appElement={document.getElementById("root") as HTMLElement}
    >
      <section>
        <h1>New Project</h1>
        <fieldset className={popupStyles.fieldset}>
          <legend>Name:</legend>
          <input
            className={popupStyles.input}
            name="input"
            placeholder="Enter name..."
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </fieldset>

        <fieldset className={popupStyles.fieldset} onClick={handleSavePath}>
          <legend>Save Path:</legend>
          <input
            className={styles.fileInput}
            name="input"
            placeholder="Choose path..."
            type="text"
            value={savePath}
          />
        </fieldset>
        <section className={styles.error}>{error}</section>
        <div className={popupStyles.buttons}>
          <button onClick={() => handleSubmit()}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </section>
    </Modal>
  );
};

export default CreateProjectModal;
