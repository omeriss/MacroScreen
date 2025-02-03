import Button from "../components/Button/Button";
import EditColor from "../components/EditColor/EditColor";
import EditLabel from "../components/EditLabel/EditLabel";
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
  press: string;
}

export type Button = BaseButton | FolderButton | AppButton | KeyboardButton;
type ButtonKeys = keyof (BaseButton &
  FolderButton &
  AppButton &
  KeyboardButton);

export const DEFUALT_BUTTONS_VALUES: { [key in ButtonType]: Button } = {
  [ButtonType.Keyboard]: {
    type: ButtonType.Keyboard,
    index: 0,
    label: "New Button",
    background: 0x000000,
    press: "A",
  },
  [ButtonType.Folder]: {
    type: ButtonType.Folder,
    index: 0,
    label: "New Button",
    background: 0x000000,
    folder: {
      buttons: {},
    },
  },
  [ButtonType.App]: {
    type: ButtonType.App,
    index: 0,
    label: "New Button",
    background: 0x000000,
    path: "",
  },
};

export const EDIT_COMPONENT: {
  [key in string]: null | React.FC<{
    value: any;
    setValue: (value: any) => void;
  }>;
} = {
  label: EditLabel,
  background: EditColor,
};
