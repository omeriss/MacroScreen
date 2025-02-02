import { appLocalDataDir, BaseDirectory, join } from "@tauri-apps/api/path";
import {
  create,
  exists,
  mkdir,
  readFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import {
  IMAGES_FOLDER_NAME,
  JSON_FILE_NAME,
  LAST_PROJECTS,
} from "../../config/projectfolder.config";
import { savePathState, pathState, rootScreenState } from "../../store/store";
import FolderScreen from "../../interfaces/FolderScreen";

const useProject = () => {
  const [savePath, setSavePath] = useRecoilState(savePathState);
  const [currentPath, setCurrentPath] = useRecoilState(pathState);
  const [rootScreen, setRootScreen] = useRecoilState(rootScreenState);

  const addProjectToLastProjects = async (newPath: string) => {
    let lastProjects: string[] = [];
    console.log(await appLocalDataDir());

    if (await exists(LAST_PROJECTS, { baseDir: BaseDirectory.AppLocalData })) {
      const file = await readFile(LAST_PROJECTS, {
        baseDir: BaseDirectory.AppLocalData,
      });

      lastProjects = JSON.parse(new TextDecoder().decode(file));
      lastProjects = lastProjects.filter(
        (path: string) => path.toLowerCase() !== newPath.toLowerCase()
      );

      lastProjects.unshift(newPath);
    } else {
      lastProjects.push(newPath);
    }

    writeTextFile(LAST_PROJECTS, JSON.stringify(lastProjects), {
      baseDir: BaseDirectory.AppLocalData,
    });
  };

  const openProjectPath = async (path: string) => {
    const projectFilePath = await join(path, JSON_FILE_NAME);

    if (!(await exists(projectFilePath))) {
      return "This folder does not contain a project file";
      return;
    }

    const projectFile = await readFile(projectFilePath);
    addProjectToLastProjects(path);

    setRootScreen(JSON.parse(new TextDecoder().decode(projectFile)));
    setSavePath(path);
    setCurrentPath([]);
  };

  const openProject = async () => {
    const result = await open({
      directory: true,
      multiple: false,
    });

    if (!result) return;

    const error = await openProjectPath(result);

    if (error) {
      toast.error(error);
    }
  };

  const save = async () => {
    if (!savePath) {
      toast.error("No project is open");
      return;
    }

    const projectFilePath = await join(savePath, JSON_FILE_NAME);

    await writeFile(
      projectFilePath,
      new TextEncoder().encode(JSON.stringify(rootScreen))
    );
  };

  const createProject = async (createPath: string) => {
    try {
      await mkdir(createPath);
      console.log(await join(createPath, IMAGES_FOLDER_NAME));
      await mkdir(await join(createPath, IMAGES_FOLDER_NAME));

      const emptyRoot: FolderScreen = {
        buttons: {},
      };

      const file = await create(await join(createPath, JSON_FILE_NAME));
      await file.write(new TextEncoder().encode(JSON.stringify(emptyRoot)));
      file.close();

      addProjectToLastProjects(createPath);
      setCurrentPath([]);
      setRootScreen(emptyRoot);
      setSavePath(createPath);
    } catch (error) {
      return "Error creating directory";
    }
  };

  const tryOpenLastProject = async () => {
    if (await exists(LAST_PROJECTS, { baseDir: BaseDirectory.AppLocalData })) {
      const file = await readFile(LAST_PROJECTS, {
        baseDir: BaseDirectory.AppLocalData,
      });

      const lastProjects = JSON.parse(new TextDecoder().decode(file));
      console.log(lastProjects);

      if (lastProjects.length > 0) {
        const error = await openProjectPath(lastProjects[0]);
      }
    }
  };

  return { save, openProject, createProject, tryOpenLastProject };
};

export default useProject;
