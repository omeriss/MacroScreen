import { CheckMenuItem } from "@tauri-apps/api/menu";
import styles from "./EditLabel.module.css";
import { event } from "@tauri-apps/api";
import ImageModal from "../ImageModal/ImageModal";

interface EditLabelProps {
  value: string;
  setValue: (value: string) => void;
}

const EditLabel = ({ value, setValue }: EditLabelProps) => {
  const isImage = value.startsWith("\\");

  return (
    <div className={styles.selectType}>
      <label htmlFor="label">Label</label>
      <div>
        <input
          type="checkbox"
          id="label"
          checked={!isImage}
          onClick={() => isImage && setValue("")}
          onChange={() => {}}
        />
        <input
          type="text"
          placeholder="Text"
          value={!isImage ? value : ""}
          disabled={isImage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            !e.target.value.includes("\\") && setValue(e.target.value);
          }}
        />
      </div>
      <div>
        <ImageModal setLabel={setValue}>
          <input
            type="checkbox"
            id="label"
            checked={isImage}
            onChange={() => {}}
          />
          <input
            disabled
            type="text"
            placeholder="Image"
            value={isImage ? value : ""}
          />
        </ImageModal>
      </div>
    </div>
  );
};

export default EditLabel;
