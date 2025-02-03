import { useState } from "react";
import CreateProjectModal from "../CreateProjectModal/CreateProjectModal";
import ExpandedButton from "../ExpandedButton/ExpandedButton";
import styles from "./TopNavigation.module.css";

import useProject from "../../hooks/project";

const TopNavigation = () => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const project = useProject();

  const fileButtons = [
    {
      label: "Open",
      onClick: () => project.openProject(),
    },
    {
      label: "Save As",
      onClick: () => {},
    },
    {
      label: "Save",
      onClick: () => project.save(),
    },
    {
      label: "New Project",
      onClick: () => setCreateProjectOpen(true),
    },
  ];

  return (
    <div className={styles.topNavigation}>
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />
      <ExpandedButton buttons={fileButtons}>File</ExpandedButton>
      <ExpandedButton>Edit</ExpandedButton>
      <ExpandedButton>Upload</ExpandedButton>
    </div>
  );
};

export default TopNavigation;
