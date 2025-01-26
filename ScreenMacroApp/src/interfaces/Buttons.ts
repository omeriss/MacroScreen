import FolderScreen from "./FolderScreen";

export enum ButtonType {
  Keyboard = "keyboard",
  Folder = "folder",
  App = "app",
}

export interface BaseButton {
  background?: number;
  label?: string;
  type: ButtonType;
  index: number;
}

export interface FolderButton extends BaseButton {
  folder: FolderScreen;
}

export interface AppButton extends BaseButton {
  path: string;
}

export interface KeyboardButton extends BaseButton {
  key: string;
}

// make type Button
export type Button = BaseButton | FolderButton | AppButton | KeyboardButton;
