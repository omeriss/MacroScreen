import { useEffect, useState } from "react";
import ResizableSidePanel from "../ResizableSidePanel/ResizableSidePanel";
import styles from "./UploadPanel.module.css";
import { invoke } from "@tauri-apps/api/core";
import { MdUpload } from "react-icons/md";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { savePathState } from "../../../store/store";
import useProject from "../../../hooks/project";

const UploadPanel = () => {
  const [isServiceRunning, setIsServiceRunning] = useState(true);
  const [uploading, setUploading] = useState(false);
  const savePath = useRecoilValue(savePathState);
  const project = useProject();

  const updateServiceStatus = async () => {
    const serviceStatus = await invoke("is_service_running");

    setIsServiceRunning(serviceStatus as boolean);
  };

  useEffect(() => {
    updateServiceStatus();
  }, []);

  const upload = async () => {
    setUploading(true);
    await project.save();

    try {
      const data = await invoke("upload", { uploadPath: savePath });
      if (data) toast.error("error uploading data");
      else toast.success("data uploaded");
    } catch (e) {
      toast.error("Failed to upload");
    } finally {
      updateServiceStatus();
      setUploading(false);
    }
  };

  return (
    <ResizableSidePanel title="Upload">
      <div className={styles.uploadPanel}>
        <button
          className={`${styles.startService} ${
            !isServiceRunning ? styles.serviceIsNotRunning : ""
          }`}
          disabled={isServiceRunning}
          onClick={() => invoke("start_service_new").then(updateServiceStatus)}
        >
          {isServiceRunning ? "Service Is Running" : "Service Is Not Running"}
        </button>

        {isServiceRunning && (
          <>
            {!uploading ? (
              <button
                className={styles.uploadButton}
                onClick={() => {
                  upload();
                }}
              >
                Upload <MdUpload />
              </button>
            ) : (
              <>
                <div>
                  <div className={styles.loadingspinner}>
                    <div id="square1" className={styles.square1}></div>
                    <div id="square2" className={styles.square2}></div>
                    <div id="square3" className={styles.square3}></div>
                    <div id="square4" className={styles.square4}></div>
                    <div id="square5" className={styles.square5}></div>
                  </div>
                </div>
                <p className={styles.uploadingText}>Uploading...</p>
                <p className={styles.uploadingText}>
                  please keep the device connected
                </p>
              </>
            )}
          </>
        )}
      </div>
    </ResizableSidePanel>
  );
};

export default UploadPanel;
