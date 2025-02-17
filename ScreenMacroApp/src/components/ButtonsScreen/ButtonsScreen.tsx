import { useEffect, useMemo, useRef, useState } from "react";
import FolderScreen from "../../interfaces/FolderScreen";
import Button from "../Button/Button";
import sytles from "./ButtonsScreen.module.css";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  UniqueIdentifier,
  DragEndEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import useButtonControl from "../../hooks/buttonControl";
import { ButtonsInScreen } from "./ButtonsScreen.config";
import { useRecoilValue } from "recoil";
import { pathState } from "../../store/store";

interface ButtonsScreenProps {
  folderScreen: FolderScreen;
}

const ButtonsScreen = ({ folderScreen }: ButtonsScreenProps) => {
  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null);
  const { changeIndex } = useButtonControl();
  const currentPath = useRecoilValue(pathState);
  const [page, setPage] = useState(0);
  const switchPageTimeout = useRef<number | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastPathPart = currentPath[currentPath.length - 1];
    if (!lastPathPart) return;
    const item = Object.entries(folderScreen.buttons).find(
      ([key]) => key === lastPathPart
    );
    if (!item) return;
    const button = item[1];

    setPage(Math.floor(button.index / ButtonsInScreen));
  }, [currentPath, folderScreen]);

  const sortedButtons = useMemo(
    () =>
      Object.entries(folderScreen.buttons)
        .filter(
          ([, button]) =>
            button.index >= page * ButtonsInScreen &&
            button.index < (page + 1) * ButtonsInScreen
        )
        .sort(([, a], [, b]) => a.index - b.index),
    [folderScreen, page]
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const pages = Math.floor(
    Object.entries(folderScreen.buttons).length / ButtonsInScreen
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    if (!event.over || event.active.id === event.over.id) return;

    changeIndex(
      event.active.id as string,
      folderScreen.buttons[event.over.id].index
    );
  };

  const checkPageMove = (event: DragMoveEvent) => {
    if (!event.active) return 0;
    const translated = event.active.rect.current.translated;
    if (!translated) return 0;
    const x = translated.left + translated.width / 2;

    const threshold = 50;
    const container = gridContainerRef.current;
    if (!container) return 0;

    const { left, right } = container.getBoundingClientRect();

    if (x < left + threshold && page > 0) {
      return -1;
    } else if (x > right - threshold && page < pages) {
      return 1;
    }

    return 0;
  };

  const switchPageWithDelay = (newPage: number) => {
    if (newPage == page) {
      if (switchPageTimeout.current) {
        clearTimeout(switchPageTimeout.current);
        switchPageTimeout.current = null;
      }

      return;
    }
    if (switchPageTimeout.current) return;

    switchPageTimeout.current = setTimeout(() => {
      setPage(newPage);
      changeIndex(draggingId as string, newPage * ButtonsInScreen);
      switchPageTimeout.current = null;
    }, 500);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    switchPageWithDelay(checkPageMove(event) + page);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setDraggingId(active.id)}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        <SortableContext
          items={sortedButtons.map(([key]) => key)}
          strategy={rectSortingStrategy}
        >
          <div className={sytles.screen} ref={gridContainerRef}>
            {sortedButtons.map(([key, button]) => (
              <Button key={key} {...button} buttonKey={key} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className={sytles.pagination}>
        <button onClick={() => setPage((page) => Math.max(page - 1, 0))}>
          {"<"}
        </button>
        <span>{page + 1}</span>
        <button onClick={() => setPage(Math.min(page + 1, pages))}>
          {">"}
        </button>
      </div>
    </>
  );
};

export default ButtonsScreen;
