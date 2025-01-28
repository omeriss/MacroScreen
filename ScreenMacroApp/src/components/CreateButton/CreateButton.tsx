import { useState } from "react";
import styles from "./CreateButton.module.css";
import Modal from "react-modal";

interface CreateButtonProps {
  children: React.ReactNode;
}

const CreateButton = ({ children }: CreateButtonProps) => {
  const [modalIsOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        <section>
          <h1>New</h1>
        </section>
      </Modal>
      <div onClick={() => setIsOpen(true)}>{children}</div>
    </>
  );
};

export default CreateButton;
