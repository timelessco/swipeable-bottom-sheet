import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

import {
  $id,
  createElement,
  focusOnFirstElement,
  getCurrentCursorPosition,
  passiveIsSupported,
  trapFocus,
  wrapAll,
  enter,
  leave,
} from "./utils";

let bottomSheets = [];
let openedInstances = [];
let ID_COUNTER = 0;

const defaultOptions = {
  overlay: true,
  peek: "35vh",
};

/**
 * Swipeable Bottom Sheet.
 */
export class SwipeableBottomSheet {
  constructor(options) {
    // Combine default options with user options
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.bottomSheet = $id(this.options.bottomSheetId);

    if (!this.bottomSheet) {
      // Get the bottom sheet from the store
      this.bottomSheet = bottomSheets.find(
        sheet => sheet.getAttribute("id") === this.options.bottomSheetId,
      );
    }

    if (this.bottomSheet) {
      // Clone, Store & Remove the bottomsheet
      bottomSheets = [...bottomSheets, this.bottomSheet.cloneNode(true)];
      this.bottomSheet.remove();
    }

    this.trigger = $id(this.options.triggerId);

    if (!this.bottomSheet || !this.trigger) return false;

    // Eventlistener function binds
    this.openBottomSheet = this.openBottomSheet.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.enableInteractivity = this.enableInteractivity.bind(this);
    this.disableInteractivity = this.disableInteractivity.bind(this);
    this.toggleInteractivity = this.toggleInteractivity.bind(this);

    // Add listeners to open the bottomsheet on all the trigger.
    this.trigger.addEventListener("click", this.openBottomSheet);
  }

  /**
   * Click to open bottomsheet with transition
   */
  async openBottomSheet() {
    const getbottomSheetContent = () => {
      this.bottomSheetContent = createElement("content");
      this.bottomSheetContent.setAttribute("body-scroll-lock-ignore", true);
    };

    const getClonedBottomSheet = () => {
      this.clonedBottomSheet = this.bottomSheet.cloneNode(true);
      this.clonedBottomSheet.classList.add("bottom-sheet");

      // Create the content
      this.newBottomSheetContent = wrapAll(
        this.clonedBottomSheet,
        this.bottomSheetContent,
      );
      this.clonedBottomSheet.appendChild(this.newBottomSheetContent);

      // Trap the focus
      this.newBottomSheetContent.addEventListener("keydown", e => {
        trapFocus(this.newBottomSheetContent, e);
      });

      // focus on the fist focusable item inside the bottomsheet content
      focusOnFirstElement(this.newBottomSheetContent);

      // Add interactivity based on the type of bottom-sheet
      if (this.options.overlay)
        this.clonedBottomSheet.classList.add("interactive");
    };

    const getSwipeableBottomSheet = () => {
      this.swipeableBottomSheet = document.createElement("div");
      this.swipeableBottomSheet.appendChild(this.clonedBottomSheet);

      if (this.options.overlay)
        this.swipeableBottomSheet.appendChild(this.overlay);
    };

    const mq = window.matchMedia("(min-width: 640px)");
    if (mq.matches === false) {
      if ($id(this.options.bottomSheetId)) return;

      if (openedInstances.length > 0) {
        // Close all openedInstance with their listeners
        openedInstances.forEach(instance => {
          // eslint-disable-next-line no-param-reassign
          instance.bottomSheetDismissed = true;
          document.removeEventListener(
            "touchstart",
            instance.toggleInteractivity,
          );
          closeBottomSheet(instance.swipeableBottomSheet);
        });
      }

      // Set bottomsheet dismissed status to false
      this.bottomSheetDismissed = false;

      if (this.options.overlay) {
        this.overlay = createElement("overlay");
        this.overlay.classList.add("hidden");
      }

      this.bottomSheetPeek = createElement("peek");
      this.bottomSheetMargin = createElement("margin");
      this.bottomSheetPeek.style.top = this.options.peek;

      getbottomSheetContent();
      getClonedBottomSheet();

      // Improvise cloned bottom sheet content
      this.clonedBottomSheet.classList.add("disable-scrollbars");
      this.clonedBottomSheet.classList.add("hidden");
      this.clonedBottomSheet.insertBefore(
        this.bottomSheetPeek,
        this.clonedBottomSheet.firstChild,
      );
      this.clonedBottomSheet.insertBefore(
        this.bottomSheetMargin,
        this.clonedBottomSheet.firstChild,
      );
      this.clonedBottomSheet.addEventListener(
        "scroll",
        this.onScroll,
        passiveIsSupported ? { passive: true } : false,
      );

      // Create a new component container every time
      getSwipeableBottomSheet();

      // Add ID to each bottom sheet
      ID_COUNTER += 1;
      this.swipeableBottomSheet.dataset.bottomSheetId = ID_COUNTER;

      // Append the bottom sheet to the DOM
      document.body.appendChild(this.swipeableBottomSheet);

      if (this.options.onOpen)
        this.options.onOpen(this.bottomSheetContent, slide =>
          this.closeBottomSheet(this.swipeableBottomSheet, slide),
        );

      if (!this.options.overlay) {
        // Add ID to differentiate from two types of bottom sheet
        this.swipeableBottomSheet.setAttribute(
          "id",
          `swipeable-bottom-sheet-no-overlay`,
        );

        // Add Toggle Interactivity to the bottom sheet based on the mouse position
        document.addEventListener(
          "touchstart",
          this.toggleInteractivity,
          passiveIsSupported ? { passive: true } : false,
        );
      }

      // Store all the opened instances
      openedInstances = [...openedInstances, this];

      if (this.options.overlay) {
        // Disable the body scroll
        disableBodyScroll(this.clonedBottomSheet);

        await Promise.allSettled([
          enter(this.clonedBottomSheet, "slidein"),
          enter(this.overlay, "fade"),
        ]);

        const handleMarginClick = () =>
          closeBottomSheet(this.swipeableBottomSheet);

        // Click margin area to close the bottom sheet
        this.bottomSheetMargin.addEventListener("click", handleMarginClick, {
          once: true,
        });
      } else {
        await enter(this.clonedBottomSheet, "slidein");
      }

      this.closeThreshold = this.bottomSheetPeek.offsetTop * 0.5;

      // Handle Threshold exceptions
      if (
        this.options.closeThreshold &&
        this.options.closeThreshold < this.bottomSheetPeek.offsetTop
      ) {
        this.closeThreshold = this.options.closeThreshold;
      }
    } else {
      this.options.overlay = true;

      if (this.options.overlay) this.overlay = createElement("overlay");
      getbottomSheetContent();
      getClonedBottomSheet();

      // Append the bottom sheet to the DOM and disable body scroll
      getSwipeableBottomSheet();
      document.body.appendChild(this.swipeableBottomSheet);

      await enter(this.overlay, "fade");

      // Disable body scroll
      disableBodyScroll(this.clonedBottomSheet);

      const handleMarginClick = event => {
        if (!this.newBottomSheetContent.contains(event.target)) {
          closeBottomSheet(this.swipeableBottomSheet, false);
        }
      };

      // Click margin area to close the bottom sheet
      this.clonedBottomSheet.addEventListener("click", handleMarginClick, {
        once: true,
      });
    }
  }

  onScroll() {
    /**
     * If bottomsheet is not dismissed and scrolled below half of peek element
     */
    if (
      !this.bottomSheetDismissed &&
      this.clonedBottomSheet.scrollTop < this.closeThreshold
    ) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;
      console.log("test");
      closeBottomSheet(this.swipeableBottomSheet);
    }
  }

  enableInteractivity() {
    if (!this.isInteractive) {
      this.isInteractive = true;
      // Add interactivity to the bottomsheet
      this.clonedBottomSheet.classList.add("interactive");
      disableBodyScroll(this.clonedBottomSheet);
    }
  }

  disableInteractivity() {
    if (this.isInteractive) {
      this.isInteractive = false;
      // Remove interactivity from the bottomsheet
      this.clonedBottomSheet.classList.remove("interactive");
      enableBodyScroll(this.clonedBottomSheet);
    }
  }

  toggleInteractivity(e) {
    const { y } = getCurrentCursorPosition(e);
    // If the mouse is on the bottomsheet enable the interactivity else disable it
    if (
      y >
      this.clonedBottomSheet.clientHeight +
        this.clonedBottomSheet.offsetTop -
        this.clonedBottomSheet.scrollTop
    ) {
      this.enableInteractivity();
    } else {
      this.disableInteractivity();
    }
  }
}

/**
 * Close bottom sheet with animation.
 */
async function closeBottomSheet(bottomSheetToClose, slide = true) {
  const bottomSheet = bottomSheetToClose.querySelector(".bottom-sheet");
  const overlay = bottomSheetToClose.querySelector(".overlay");

  if (slide) {
    await Promise.allSettled([
      leave(bottomSheet, "slidein"),
      leave(overlay, "fade"),
    ]);
  } else {
    await leave(bottomSheet, "slidein");
  }

  // Remove the instance that are going to be closed
  openedInstances = openedInstances.filter(
    instance => bottomSheetToClose !== instance.swipeableBottomSheet,
  );
  document.body.removeChild(bottomSheetToClose);
  enableBodyScroll(bottomSheet);
}
