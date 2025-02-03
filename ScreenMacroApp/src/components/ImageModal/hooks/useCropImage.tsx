import { documentDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useEffect, useRef, useState } from "react";
import { Area, MediaSize } from "react-easy-crop";
import { IMAGE_SIZE } from "../ImageModal.config";

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

const useCropImage = (setIsOpen: (open: boolean) => void) => {
  const [imageSrc, setImageSrc] = useState<string>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 });
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [minZoom, setMinZoom] = useState(1);
  const [lastMediaSize, setLastMediaSize] = useState<MediaSize>();

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
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const saveImage = async () => {
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

      const path = await join(await documentDir(), "randomimage.png");

      await writeFile(path, uint8Array);
    }, "image/png");
  };

  const setNewCropSize = (mediaSize: MediaSize) => {
    const size =
      Math.min(
        cropContainerRef.current?.clientHeight ?? 0,
        cropContainerRef.current?.clientWidth ?? 0
      ) * 0.8;

    const newCropSize = {
      width: size,
      height: size,
    };

    if (
      newCropSize.width === cropSize.width &&
      newCropSize.height === cropSize.height
    )
      return;

    setCropSize(newCropSize);

    const newMinZoom = Math.max(
      newCropSize.width / mediaSize.width,
      newCropSize.height / mediaSize.height
    );

    setMinZoom(newMinZoom);
    setZoom(newMinZoom);
  };

  const onMediaLoaded = (mediaSize: MediaSize) => {
    setLastMediaSize({ ...mediaSize });
    setNewCropSize({ ...mediaSize });
  };

  useEffect(() => {
    const handleResize = () => {
      if (lastMediaSize) {
        setNewCropSize(lastMediaSize);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [lastMediaSize, cropContainerRef.current]);

  const cleanMedia = () => {
    setImageSrc(undefined);
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    setCroppedAreaPixels(undefined);
    setMinZoom(1);
    setLastMediaSize(undefined);
    setCropSize({ width: 200, height: 200 });
  };

  return {
    onFileChange,
    imageSrc,
    crop,
    setCrop,
    rotation,
    setRotation,
    zoom,
    setZoom,
    croppedAreaPixels,
    cropSize,
    setCropSize,
    onCropComplete,
    saveImage,
    cropContainerRef,
    minZoom,
    onMediaLoaded,
    cleanMedia,
    setNewCropSize,
    lastMediaSize,
  };
};

export default useCropImage;
