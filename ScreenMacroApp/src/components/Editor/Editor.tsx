import { useRecoilState, useRecoilValue } from "recoil";
import FolderScreen from "../../interfaces/FolderScreen";
import { pathState, rootScreenState } from "../../store/store";
import styles from "./Editor.module.css";
import { useMemo } from "react";
import { Button, EDIT_COMPONENT, FolderButton } from "../../interfaces/Buttons";
import useButtonControl from "../../hooks/buttonControl";

interface EditorProps {}

const Editor = ({}: EditorProps) => {
  const path = useRecoilValue<string[]>(pathState);
  const rootScreen = useRecoilValue<FolderScreen>(rootScreenState);
  const { editButton } = useButtonControl();

  const [currentKey, currentButton] = useMemo(() => {
    const folder = path.reduce(
      (screen, folder, index) =>
        index == path.length - 1
          ? screen
          : (screen.buttons[folder] as FolderButton).folder,
      rootScreen
    );

    return [path[path.length - 1], folder.buttons[path[path.length - 1]]];
  }, [path, rootScreen]);

  const edit = (key: string) => (newValue: any) => {
    console.log("edit", key, newValue);
    editButton({ ...currentButton, [key]: newValue }, path);
  };

  return (
    <>
      {path.length !== 0 && (
        <section className={`toolbar-section ${styles.toolbar}`}>
          <div className="toolbar-section-head"></div>
          <div className="toolbar-section-subtitle">Edit {currentKey}</div>
          <div className="toolbar-section-main">
            <section className={styles.editor}>
              {Object.entries(currentButton).map(([key, value]) => (
                <div key={key}>
                  {(() => {
                    const Component = EDIT_COMPONENT[key];
                    if (Component == undefined) return <></>;
                    return (
                      <Component
                        value={value}
                        setValue={edit(key)}
                        setButton={(func: (button: Button) => Button) =>
                          editButton(func(currentButton), path)
                        }
                      />
                    );
                  })()}
                </div>
              ))}
            </section>
          </div>
        </section>
      )}
    </>
  );
};

export default Editor;
