import { FaBeer } from "react-icons/fa";
import { ButtonType } from "../../../../interfaces/Buttons";
import { IconType } from "react-icons";

export const PADDING = 25;
export const FOLDER_PADDING_DEC = 21;
export const INIT_TAB = 1;

export const ICONS: { [key: string]: IconType } = {
  [ButtonType.Folder]: FaBeer,
};
