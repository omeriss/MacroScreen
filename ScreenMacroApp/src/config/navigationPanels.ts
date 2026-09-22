import { MdContentCopy, MdHistory, MdUpload } from "react-icons/md";
import FolderNavigation from "../components/LeftSidePanels/FolderNavigationPanel/FolderNavigation";
import UploadPanel from "../components/LeftSidePanels/UploadPanel/UploadPanel";

export const NAVIGATION_PANELS = [
  {
    icon: MdContentCopy,
    component: FolderNavigation,
  },
  {
    icon: MdUpload,
    component: UploadPanel,
  },
  {
    icon: MdHistory,
    component: FolderNavigation,
  },
];
