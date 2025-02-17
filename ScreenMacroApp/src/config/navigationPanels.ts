import { MdContentCopy, MdHistory, MdUpload } from "react-icons/md";
import FolderNavigation from "../components/FolderNavigation/FolderNavigation";

export const navigationPanels = [
  {
    icon: MdContentCopy,
    component: FolderNavigation,
  },
  {
    icon: MdUpload,
    component: FolderNavigation,
  },
  {
    icon: MdHistory,
    component: FolderNavigation,
  },
];
