import { useEffect, useRef, useState } from "react";
import CreateProjectModal from "../CreateProjectModal/CreateProjectModal";
import ExpandedButton from "../ExpandedButton/ExpandedButton";
import styles from "./TopNavigation.module.css";

import useProject from "../../hooks/project";
import {
  rootScreenState,
  selectedNavigationPanelState,
  savePathState,
} from "../../store/store";
import { useRecoilState, useRecoilValue } from "recoil";
import FolderScreen from "../../interfaces/FolderScreen";
import { MAX_UNDO_ITEMS } from "./TopNavigatoin.config";

const TopNavigation = () => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [_, setNavigationPanel] = useRecoilState(selectedNavigationPanelState);
  const savePath = useRecoilValue(savePathState);
  const [rootScreen, setRootScreen] = useRecoilState(rootScreenState);
  const [rootScreenStack, setRootScreenStack] = useState<FolderScreen[]>([]);
  const [rootScreenStackIndex, setRootScreenStackIndex] = useState(0);
  const preventUpdate = useRef(false);

  useEffect(() => {
    if (preventUpdate.current) {
      preventUpdate.current = false;
      return;
    }

    const removeStart = rootScreenStackIndex >= MAX_UNDO_ITEMS;
    console.log(removeStart);

    setRootScreenStack((prev) => {
      const newStack = [...prev];
      newStack[rootScreenStackIndex + 1] = rootScreen;
      newStack.splice(rootScreenStackIndex + 2);
      if (removeStart) newStack.shift();

      return newStack;
    });

    if (!removeStart) setRootScreenStackIndex((prev) => prev + 1);
  }, [rootScreen]);

  useEffect(() => {
    setRootScreenStackIndex(0);
    setRootScreenStack([rootScreen]);
  }, [savePath]);

  const undo = () => {
    if (rootScreenStackIndex > 0) {
      preventUpdate.current = true;
      setRootScreenStackIndex((prev) => prev - 1);
      setRootScreen(rootScreenStack[rootScreenStackIndex - 1]);
    }
  };

  const redo = () => {
    if (rootScreenStackIndex < rootScreenStack.length - 1) {
      preventUpdate.current = true;
      setRootScreenStackIndex((prev) => prev + 1);
      setRootScreen(rootScreenStack[rootScreenStackIndex + 1]);
    }
  };

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

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        project.save();
      }
      if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        project.openProject();
      }
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        setCreateProjectOpen(true);
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleShortcuts);

    return () => document.removeEventListener("keydown", handleShortcuts);
  }, [
    project.savePath,
    project.currentPath,
    project.rootScreen,
    rootScreenStackIndex,
    rootScreenStack,
  ]);

  return (
    <div className={styles.topNavigation}>
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />
      <ExpandedButton buttons={fileButtons}>File</ExpandedButton>
      <ExpandedButton buttons={[]}>Edit</ExpandedButton>
      <ExpandedButton
        buttons={[
          {
            label: "Upload To Device",
            onClick: () => {
              setNavigationPanel(1);
            },
          },
        ]}
      >
        Upload
      </ExpandedButton>
    </div>
  );
};

export default TopNavigation;
