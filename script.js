window.addEventListener("DOMContentLoaded", function () {
  new SwipeableBottomSheet({ triggerId: "trigger-1", bottomSheetId: "swipeable-bottom-sheet-1" });
  new SwipeableBottomSheet({ triggerId: "trigger-2", bottomSheetId: "swipeable-bottom-sheet-2", peek: "50vh" });
  new SwipeableBottomSheet({ triggerId: "trigger-3", bottomSheetId: "swipeable-bottom-sheet", overlay: false });
  new SwipeableBottomSheet({ triggerId: "trigger-4", bottomSheetId: "swipeable-bottom-sheet-2" });
  new SwipeableBottomSheet({
    triggerId: "trigger-5",
    bottomSheetId: "swipeable-bottom-sheet",
    closeThreshold: "100",
  });
  new SwipeableBottomSheet({ triggerId: "trigger-6", bottomSheetId: "swipeable-bottom-sheet" });
  new SwipeableBottomSheet({ triggerId: "trigger-7", bottomSheetId: "swipeable-bottom-sheet" });
  new SwipeableBottomSheet({ triggerId: "trigger-8", bottomSheetId: "swipeable-bottom-sheet" });
});
