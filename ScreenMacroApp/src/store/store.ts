import { atom } from "recoil";
import FolderScreen from "../interfaces/FolderScreen";
import { ButtonType } from "../interfaces/Buttons";

export const rootScreenState = atom<FolderScreen>({
  key: "rootScreen",
  default: {
    buttons: {
      omer: {
        label: "omer",
        background: 64576,
        type: ButtonType.App,
        index: 0,
      },
      omer1: {
        label: "\\omer",
        background: 0x000000,
        type: ButtonType.App,
        index: 1,
      },
      omer2: {
        label: "folder",
        background: 0x000000,
        type: ButtonType.Folder,
        index: 1,
        folder: {
          buttons: {
            test: {
              label: "test",
              background: 0x000000,
              type: ButtonType.App,
              index: 0,
            },
            test2: {
              label: "test",
              background: 0x000000,
              type: ButtonType.Folder,
              index: 0,
              folder: {
                buttons: {
                  test3: {
                    label: "something",
                    background: 0x000000,
                    type: ButtonType.App,
                    index: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export const pathState = atom<string[]>({
  key: "path",
  default: [],
});
