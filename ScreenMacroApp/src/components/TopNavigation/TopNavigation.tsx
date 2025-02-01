import ExpandedButton from "../ExpandedButton/ExpandedButton";
import styles from "./TopNavigation.module.css";
import { open } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, mkdir } from "@tauri-apps/plugin-fs";

const TopNavigation = () => {
  const fileButtons = [
    {
      label: "Open",
      onClick: () => {
        open({
          multiple: false,
          directory: true,
        })
          .then((result) => {
            mkdir(`${result}\\omer`!);
          })
          .then(() => console.log("Directory created"))
          .catch((error) => console.error(error));
      },
    },
    {
      label: "Save As",
      onClick: () => console.log("Save as clicked"),
    },
    {
      label: "Save",
      onClick: () => console.log("Save clicked"),
    },
  ];

  return (
    <div className={styles.topNavigation}>
      <ExpandedButton buttons={fileButtons}>File</ExpandedButton>
      <ExpandedButton>Edit</ExpandedButton>
      <ExpandedButton>Upload</ExpandedButton>
    </div>
  );
};

export default TopNavigation;
