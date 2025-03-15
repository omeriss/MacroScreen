import { atom } from "recoil";
import FolderScreen from "../interfaces/FolderScreen";
import { ButtonType } from "../interfaces/Buttons";

export const rootScreenState = atom<FolderScreen>({
  key: "rootScreen",
  default: {
    buttons: {},
  },
});

export const pathState = atom<string[]>({
  key: "path",
  default: [],
});

export const savePathState = atom<string | null>({
  key: "projectPath",
  default: null,
});

export const selectedNavigationPanelState = atom<number>({
  key: "selectedNavigationPanel",
  default: 0,
});

export enum CreateType {
  FOLDER = "folder",
  BUTTON = "button",
}

export const createButtonState = atom<{
  type: CreateType;
  path?: string[];
} | null>({
  key: "createButton",
  default: null,
});
