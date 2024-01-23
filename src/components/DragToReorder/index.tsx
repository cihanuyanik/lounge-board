import "./index.css";
import { children, createEffect, JSX, on, onCleanup, onMount } from "solid-js";

export type DragStartCallback = (
  draggingItemId: string,
  startPos: { x: number; y: number },
  startBoundRect: DOMRect,
  draggingItem: HTMLElement,
) => void;

export type DragMoveCallback = (
  draggingItemId: string,
  movePos: { x: number; y: number },
  moveBoundRect: DOMRect,
  draggingItem: HTMLElement,
) => void;

export type DragFinishCallback = (
  draggingItemId: string,
  oldIndex: number,
  newIndex: number,
  endPos: { x: number; y: number },
  endBoundRect: DOMRect,
  draggingItem: HTMLElement,
) => void;

type DragToReorderProps = {
  children: JSX.Element;
  ids: string[];
  onDragStart?: DragStartCallback;
  onDragMove?: DragMoveCallback;
  onDragFinish?: DragFinishCallback;
};

export default function (props: DragToReorderProps) {
  const childContainer = children(() => props.children);

  let dragManager: DragManager;

  onMount(() => {
    dragManager = new DragManager({
      onDragStart: props.onDragStart,
      onDragMove: props.onDragMove,
      onDragFinish: props.onDragFinish,
    });
  });

  onCleanup(() => {
    if (dragManager) dragManager.destroy();
  });

  createEffect(
    on(
      () => props.ids,
      () => dragManager.initialize(childContainer() as HTMLDivElement),
    ),
  );

  return childContainer();
}

/////////////////////////////////////////////////////////////////////////////////
// IMPLEMENTATION
/////////////////////////////////////////////////////////////////////////////////

class DragManager {
  private listContainer!: HTMLElement;
  private draggableItem!: HTMLElement | null | undefined;
  private dragStartPos = { x: 0, y: 0 };
  private dragMovePos = { x: 0, y: 0 };
  private dragEndPos = { x: 0, y: 0 };
  private dragOffset = { x: 0, y: 0 };

  private items: HTMLElement[] = [];
  private prevRect = {} as DOMRect;
  private readonly onDragStartCb: DragStartCallback | undefined;
  private readonly onDragMoveCb: DragMoveCallback | undefined;
  private readonly onDragFinishCb: DragFinishCallback | undefined;

  private unsubscribeList = new Map<string, Unsubscribe>();
  constructor({
    onDragStart,
    onDragMove,
    onDragFinish,
  }: {
    onDragStart?: DragStartCallback;
    onDragMove?: DragMoveCallback;
    onDragFinish?: DragFinishCallback;
  }) {
    this.onDragStartCb = onDragStart;
    this.onDragMoveCb = onDragMove;
    this.onDragFinishCb = onDragFinish;
  }

  initialize(container: HTMLElement) {
    // Call destroy for guaranteeing that there is no residual event listeners
    this.destroy();

    this.listContainer = container;
    if (!this.listContainer) {
      throw new Error("List Container for dragging is not found");
    }

    // register pointer events
    this.unsubscribeList.set(
      "pointerdown",
      this.listContainer.registerEventListener(
        "pointerdown",
        this.dragStart.bind(this),
      ),
    );

    this.unsubscribeList.set(
      "pointerup",
      this.listContainer.registerEventListener(
        "pointerup",
        this.dragEnd.bind(this),
      ),
    );
  }

  destroy() {
    this.unsubscribeList.forEach((unsub) => unsub());
    this.unsubscribeList.clear();
  }

  dragStart(e: PointerEvent) {
    const target = e.target as HTMLElement;

    if (target.classList.contains("drag-handle")) {
      this.draggableItem = target.closest(".drag-item") as HTMLElement;
    }

    if (!this.draggableItem) return;

    // Set container style
    if (!this.listContainer.classList.contains("drag-container")) {
      this.listContainer.classList.add("drag-container");
    }

    this.dragStartPos.x = e.clientX;
    this.dragStartPos.y = e.clientY;

    // Initialize draggable item
    if (!this.draggableItem.classList.contains("dragging")) {
      this.draggableItem.classList.add("dragging");
    }

    // Initialize item state
    if (!this.draggableItem) return;
    const draggableItemIndex = this.getAllItems(true).indexOf(
      this.draggableItem,
    );

    // Mark items above draggable item
    this.getIdleItems().forEach((item, i) => {
      if (draggableItemIndex > i) {
        item.dataset.isAbove = "";
      }
    });

    // Set draggable item first rect
    this.prevRect = this.draggableItem.getBoundingClientRect();

    // Hold pointer capture
    this.listContainer.setPointerCapture(e.pointerId);

    // Register move capture
    this.unsubscribeList.set(
      "pointermove",
      this.listContainer.registerEventListener(
        "pointermove",
        this.dragMove.bind(this),
      ),
    );

    if (this.onDragStartCb) {
      this.onDragStartCb(
        this.draggableItem.id,
        this.dragStartPos,
        this.prevRect,
        this.draggableItem,
      );
    }
  }

  dragMove(e: PointerEvent) {
    if (!this.draggableItem) return;
    e.preventDefault();

    this.dragMovePos.x = e.clientX;
    this.dragMovePos.y = e.clientY;

    this.dragOffset.x = this.dragMovePos.x - this.dragStartPos.x;
    this.dragOffset.y = this.dragMovePos.y - this.dragStartPos.y;

    this.draggableItem.style.transform = `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;

    this.updateIdleItemsStateAndPosition();

    if (this.onDragMoveCb) {
      this.onDragMoveCb(
        this.draggableItem.id,
        this.dragMovePos,
        this.draggableItem.getBoundingClientRect(),
        this.draggableItem,
      );
    }
  }

  dragEnd(e: PointerEvent) {
    if (!this.draggableItem) return;

    // Unregister events
    this.listContainer.releasePointerCapture(e.pointerId);
    this.unsubscribeList.get("pointermove")?.();
    this.unsubscribeList.delete("pointermove");

    this.applyNewItemsOrder(e);

    // Remove item states
    this.getAllItems().forEach((item) => {
      delete item.dataset.isAbove;
      delete item.dataset.isToggled;
      item.style.transform = "";
    });

    this.items = [];

    // Set container style
    if (this.listContainer?.classList.contains("drag-container")) {
      this.listContainer.classList.remove("drag-container");
    }
  }

  private applyNewItemsOrder(e: MouseEvent) {
    if (!this.draggableItem) return;

    const reorderedItems = [] as HTMLElement[];

    this.getAllItems().forEach((item, index) => {
      if (item === this.draggableItem) {
        return;
      }

      if (!this.isItemToggled(item)) {
        reorderedItems[index] = item;
        return;
      }

      const newIndex = this.isItemAbove(item) ? index + 1 : index - 1;

      reorderedItems[newIndex] = item;
    });

    for (let index = 0; index < this.getAllItems().length; index++) {
      const item = reorderedItems[index];
      if (typeof item === "undefined") {
        reorderedItems[index] = this.draggableItem;
      }
    }

    // Find old and new index of the dragged item
    const oldIndex = this.getAllItems().indexOf(this.draggableItem);

    const newIndex = reorderedItems.indexOf(this.draggableItem);

    this.dragEndPos.x = e.clientX;
    this.dragEndPos.y = e.clientY;

    this.dragOffset.x = this.dragEndPos.x - this.dragStartPos.x;
    this.dragOffset.y = this.dragEndPos.y - this.dragStartPos.y;

    //notify subscriber about dragend
    if (this.onDragFinishCb) {
      this.onDragFinishCb(
        this.draggableItem.id,
        oldIndex,
        newIndex,
        this.dragEndPos,
        this.draggableItem.getBoundingClientRect(),
        this.draggableItem,
      );
    }

    this.draggableItem.style.transform = "";

    requestAnimationFrame(() => {
      if (!this.draggableItem) return;
      const rect = this.draggableItem.getBoundingClientRect();
      const yDiff = this.prevRect.y - rect.y;

      this.draggableItem.style.transform = `translate(${this.dragOffset.x}px, ${
        this.dragOffset.y + yDiff
      }px)`;

      requestAnimationFrame(() => {
        if (!this.draggableItem) return;
        if (this.draggableItem.classList.contains("dragging"))
          this.draggableItem.classList.remove("dragging");

        this.draggableItem.setAttribute("style", "");

        this.draggableItem = null;
      });
    });
  }

  private getIdleItems() {
    return this.getAllItems().filter(
      (item) => !item.classList.contains("dragging"),
    );
  }

  private getAllItems(hardRefresh = false) {
    if (!this.items?.length || hardRefresh) {
      this.items = Array.from(
        this.listContainer.querySelectorAll(".drag-item"),
      );
    }
    return this.items;
  }

  private isItemAbove(item: HTMLElement) {
    return item.hasAttribute("data-is-above");
  }

  private isItemToggled(item: HTMLElement) {
    return item.hasAttribute("data-is-toggled");
  }

  private updateIdleItemsStateAndPosition() {
    if (!this.draggableItem) return;
    const dItemRect = this.draggableItem.getBoundingClientRect();
    const dItemCenter = dItemRect.top + dItemRect.height / 2;

    // Update state
    this.getIdleItems().forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;

      if (this.isItemAbove(item)) {
        if (dItemCenter <= itemCenter) {
          item.dataset.isToggled = "";
        } else {
          delete item.dataset.isToggled;
        }
      } else {
        if (dItemCenter >= itemCenter) {
          item.dataset.isToggled = "";
        } else {
          delete item.dataset.isToggled;
        }
      }
    });

    // Update position
    this.getIdleItems().forEach((item) => {
      if (this.isItemToggled(item)) {
        const direction = this.isItemAbove(item) ? 1 : -1;
        item.style.transform = `translateY(${direction * dItemRect.height}px)`;
      } else {
        item.style.transform = "";
      }
    });
  }
}
