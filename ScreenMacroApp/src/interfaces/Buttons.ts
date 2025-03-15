import AppSelection from "../components/AppSelection/AppSelection";
import Button from "../components/Button/Button";
import EditColor from "../components/EditColor/EditColor";
import EditLabel from "../components/EditLabel/EditLabel";
import EditScript from "../components/EditScript/EditScript";
import KeybindButton from "../components/KeyBindCapture/KeyBindCapture";
import FolderScreen from "./FolderScreen";

export enum ButtonType {
  Keyboard = "keyboard",
  Folder = "folder",
  App = "app",
  AudioControl = "audio",
  Gaming = "gaming",
  Script = "script",
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
  app: string;
}

export interface KeyboardButton extends BaseButton {
  press: number[];
}

export interface ScriptButton extends BaseButton {
  script: string;
}

export type Button =
  | BaseButton
  | FolderButton
  | AppButton
  | KeyboardButton
  | ScriptButton;
type ButtonKeys = keyof (BaseButton &
  FolderButton &
  AppButton &
  KeyboardButton &
  ScriptButton);

export const DEFUALT_BUTTONS_VALUES: { [key in ButtonType]: Button } = {
  [ButtonType.Keyboard]: {
    type: ButtonType.Keyboard,
    index: 0,
    label: "New Button",
    background: 0x000000,
    press: [],
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
    app: "",
  },
  [ButtonType.AudioControl]: {
    type: ButtonType.AudioControl,
    index: 0,
    label: "New Button",
    background: 0x000000,
  },
  [ButtonType.Gaming]: {
    type: ButtonType.Gaming,
    index: 0,
    label: "New Button",
    background: 0x000000,
  },
  [ButtonType.Script]: {
    type: ButtonType.Script,
    index: 0,
    label: "New Button",
    background: 0x000000,
    script: "",
  },
};

export const EDIT_COMPONENT: {
  [key in string]: null | React.FC<{
    value: any;
    setValue: (value: any) => void;
    setButton: (func: (button: Button) => Button) => void;
  }>;
} = {
  label: EditLabel,
  background: EditColor,
  press: KeybindButton,
  app: AppSelection,
  script: EditScript,
};
