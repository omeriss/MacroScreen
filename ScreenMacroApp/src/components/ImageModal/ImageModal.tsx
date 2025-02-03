import { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "./ImageModal.module.css";
import Cropper, { Area, MediaSize } from "react-easy-crop";
import { documentDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { IMAGE_SIZE } from "./ImageModal.config";
import popupStyles from "./../../styles/popup.module.css";
import useCropImage from "./hooks/useCropImage";

interface ImageModalProps {
  children: React.ReactNode;
  setLabel: (label: string) => void;
}

const ImageModal = ({ children, setLabel }: ImageModalProps) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedUploadType, setSelectedUploadType] =
    useState<string>("upload");
  const cropImage = useCropImage(setIsOpen, setLabel);

  const updateSelectedUploadType = (
    radioEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedUploadType(radioEvent.target.value);
    cropImage.cleanMedia();
  };

  const close = () => {
    setIsOpen(false);
    cropImage.cleanMedia();
  };

  const [forceRender, setForceRender] = useState(0);
  const handleForceRender = () => {
    setForceRender((prev) => prev + 1);
  };
  useEffect(() => {
    handleForceRender();
  }, [cropImage.cropSize]);

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={close}
        className={styles.modal}
        overlayClassName={popupStyles.overlay}
        appElement={document.getElementById("root") as HTMLElement}
      >
        <section className={styles.modalMainSection}>
          <div className={styles.radioInputs}>
            <label className={styles.radio}>
              <input
                type="radio"
                name="radio"
                onChange={updateSelectedUploadType}
                value={"upload"}
                defaultChecked
              />
              <span className={styles.name}>Upload Image</span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="radio"
                onChange={updateSelectedUploadType}
                value={"used"}
              />
              <span className={styles.name}>Used Image</span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="radio"
                onChange={updateSelectedUploadType}
                value={"library"}
              />
              <span className={styles.name}>From Library</span>
            </label>
          </div>
          {
            {
              upload: (
                <>
                  {!cropImage.imageSrc && (
                    <>
                      <input
                        type="file"
                        id="file-upload"
                        className={styles.fileUpload}
                        onChange={cropImage.onFileChange}
                      />
                      <label
                        htmlFor="file-upload"
                        className={styles.uploadLabel}
                      >
                        Upload Image
                      </label>
                    </>
                  )}
                  {cropImage.imageSrc && (
                    <>
                      <div
                        className={styles.cropperContainer}
                        ref={cropImage.cropContainerRef}
                      >
                        <Cropper
                          key={forceRender}
                          image={cropImage.imageSrc}
                          crop={cropImage.crop}
                          rotation={cropImage.rotation}
                          zoom={cropImage.zoom}
                          aspect={1}
                          maxZoom={10000}
                          minZoom={cropImage.minZoom}
                          cropSize={cropImage.cropSize}
                          onCropChange={cropImage.setCrop}
                          onRotationChange={cropImage.setRotation}
                          onCropComplete={cropImage.onCropComplete}
                          onZoomChange={cropImage.setZoom}
                          onMediaLoaded={cropImage.onMediaLoaded}
                          showGrid={false}
                          zoomSpeed={0.15}
                          objectFit="contain"
                          nonce="cropper"
                        />
                      </div>
                      <div className={popupStyles.buttons}>
                        <button
                          onClick={() => {
                            cropImage.saveImage().then(() => {
                              cropImage.cleanMedia();
                              close();
                            });
                          }}
                        >
                          Save
                        </button>
                        <button onClick={cropImage.cleanMedia}>Cancel</button>
                      </div>
                    </>
                  )}
                </>
              ),
              used: <div>Used</div>,
              library: (
                <div>Not Available yet, pealse wait for future updates</div>
              ),
            }[selectedUploadType]
          }
        </section>
      </Modal>
      <div className={styles.childrenContainer} onClick={() => setIsOpen(true)}>
        <div>{children}</div>
      </div>
    </>
  );
};

export default ImageModal;
