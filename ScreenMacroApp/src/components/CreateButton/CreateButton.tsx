import { useState } from "react";
import popupStyles from "../../styles/popup.module.css";
import Modal from "react-modal";
import { ButtonType, DEFUALT_BUTTONS_VALUES } from "../../interfaces/Buttons";
import useButtonControl from "../../hooks/buttonControl";
import { useRecoilState } from "recoil";
import { createButtonState, CreateType } from "../../store/store";

const CreateButton = () => {
  const [buttonType, setButtonType] = useState<ButtonType>(ButtonType.Keyboard);
  const [name, setName] = useState("");
  const { addButton } = useButtonControl();
  const [createState, setCreateState] = useRecoilState(createButtonState);

  const handleAddButton = () => {
    const selectedType =
      createState?.type === CreateType.BUTTON ? buttonType : ButtonType.Folder;

    const button = {
      ...DEFUALT_BUTTONS_VALUES[selectedType],
      label: name,
    };

    setCreateState(null);
    setName("");
    setButtonType(ButtonType.Keyboard);

    addButton(button, name, createState?.path);
  };

  return (
    <>
      <Modal
        isOpen={createState !== null}
        onRequestClose={() => setCreateState(null)}
        className={popupStyles.modal}
        overlayClassName={popupStyles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        <section>
          <h1>New {createState?.type}</h1>
          <fieldset className={popupStyles.fieldset}>
            <legend>Name:</legend>
            <input
              className={popupStyles.input}
              name="name"
              placeholder="Enter name..."
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
          {createState?.type === CreateType.BUTTON && (
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
            <button onClick={() => setCreateState(null)}>Cancel</button>
          </div>
        </section>
      </Modal>
    </>
  );
};

export default CreateButton;
