import { SwipeableBottomSheet } from "../swipeable-bottom-sheet";

window.addEventListener("DOMContentLoaded", function () {
  const handleOnOpen = () => {
    const box = document.querySelectorAll(".box");
    console.log("%c box", "color: #e57373", box);
  };

  new SwipeableBottomSheet({
    triggerId: "trigger-1",
    bottomSheetId: "swipeable-bottom-sheet-1",
    onOpen: handleOnOpen,
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-2",
    bottomSheetId: "swipeable-bottom-sheet-2",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-3",
    bottomSheetId: "swipeable-bottom-sheet-1",
    overlay: false,
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-10",
    bottomSheetId: "swipeable-bottom-sheet-2",
    overlay: false,
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-4",
    bottomSheetId: "swipeable-bottom-sheet-2",
    peek: "50vh",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-5",
    bottomSheetId: "swipeable-bottom-sheet",
    closeThreshold: "100",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-6",
    bottomSheetId: "swipeable-bottom-sheet",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-7",
    bottomSheetId: "swipeable-bottom-sheet",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-8",
    bottomSheetId: "swipeable-bottom-sheet",
  });
  new SwipeableBottomSheet({
    triggerId: "trigger-9",
    bottomSheetId: "swipeable-bottom-sheet",
  });
});
