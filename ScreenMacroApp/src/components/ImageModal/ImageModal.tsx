import { useState } from "react";
import Modal from "react-modal";
import styles from "./ImageModal.module.css";
import Cropper, { Area } from "react-easy-crop";
import { documentDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { IMAGE_SIZE } from "./ImageModal.config";

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => resolve(reader.result as string),
      false
    );
    reader.readAsDataURL(file);
  });
};

const ImageModal = () => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await readFile(file);

      setIsOpen(true);
      setImageSrc(imageDataUrl);
    }
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log(croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
    getCroppedImage();
  };

  const getCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      IMAGE_SIZE,
      IMAGE_SIZE
    );

    canvas.toBlob(async (blob) => {
      const arrayBuffer = await blob?.arrayBuffer();

      if (!arrayBuffer) return;

      const uint8Array = new Uint8Array(arrayBuffer);

      // tauri save to file in desktop

      const path = await join(await documentDir(), "randomimage.png");

      await writeFile(path, uint8Array);

      console.log(uint8Array);
    }, "image/png");
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        className={styles.modal}
      >
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        )}
      </Modal>
      <div className={styles.childrenContainer}>
        <label htmlFor="file-upload" className={styles.customFileUpload}>
          Choose File
        </label>
        <input
          type="file"
          id="file-upload"
          className={styles.fileUpload}
          onChange={onFileChange}
        />
      </div>
    </>
  );
};

export default ImageModal;
