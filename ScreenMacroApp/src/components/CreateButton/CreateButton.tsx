import { useState } from "react";
import popupStyles from "../../styles/popup.module.css";
import Modal from "react-modal";
import { ButtonType, DEFUALT_BUTTONS_VALUES } from "../../interfaces/Buttons";
import useButtonControl from "../../hooks/buttonControl";

export enum CreateType {
  FOLDER = "folder",
  BUTTON = "button",
}

interface CreateButtonProps {
  children: React.ReactNode;
  type: CreateType;
}

const CreateButton = ({ children, type }: CreateButtonProps) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [buttonType, setButtonType] = useState<ButtonType>(ButtonType.Keyboard);
  const [name, setName] = useState("");
  const { addButton } = useButtonControl();

  const handleAddButton = () => {
    const selectedType =
      type === CreateType.BUTTON ? buttonType : ButtonType.Folder;

    const button = {
      ...DEFUALT_BUTTONS_VALUES[selectedType],
      label: name,
    };

    setIsOpen(false);
    setName("");
    setButtonType(ButtonType.Keyboard);

    addButton(button, name);
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        className={popupStyles.modal}
        overlayClassName={popupStyles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        <section>
          <h1>New {type}</h1>
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
          {type === CreateType.BUTTON && (
            <fieldset className={popupStyles.fieldset}>
              <legend>Type:</legend>
              <select
                className={popupStyles.select}
                onChange={(e) => setButtonType(e.target.value as ButtonType)}
                value={buttonType}
              >
                {Object.values(ButtonType).map(
                  (key) =>
                    key != ButtonType.Folder && (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    )
                )}
              </select>
            </fieldset>
          )}
          <div className={popupStyles.buttons}>
            <button onClick={handleAddButton}>Ok</button>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </section>
      </Modal>
      <div onClick={() => setIsOpen(true)}>{children}</div>
    </>
  );
};

export default CreateButton;
