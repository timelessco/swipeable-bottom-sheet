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
class SwipeableBottomSheet {
  constructor(options) {
    // Combine default options with user options
    this.options = {
      ...defaultOptions,
      ...options,
    };

    // Get the bottomsheet and trigger
    const bottomSheetNode = document.getElementById(this.options.bottomSheetId);

    const triggerNode = document.getElementById(this.options.triggerId);

    // Handle trigger id error
    if (triggerNode == null) {
      return;
    }

    if (bottomSheetNode) {
      // Deep close the original bottom sheet contents
      const bottomSheet = bottomSheetNode.cloneNode(true);

      // Initialization for the component
      this.bottomSheet = bottomSheet;

      // Store the bottom sheets in a store before they are destroyed
      bottomSheets = [...bottomSheets, bottomSheet];
      // Remove the original bottom sheet contents
      bottomSheetNode.remove();
    } else {
      // Get the bottom sheet from the store
      this.bottomSheet = bottomSheets.find((sheet) => sheet.getAttribute("id") === this.options.bottomSheetId);

      // Handle bottom sheet id error
      if (this.bottomSheet == null) {
        return;
      }
    }

    // Get all the trigger elements
    this.trigger = triggerNode;

    // Eventlistener function binds
    this.openBottomSheet = this.openBottomSheet.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.closeBottomSheet = this.closeBottomSheet.bind(this);
    this.enableInteractivity = this.enableInteractivity.bind(this);
    this.disableInteractivity = this.disableInteractivity.bind(this);
    this.toggleInteractivity = this.toggleInteractivity.bind(this);

    // Add listeners to open the bottomsheet on all the trigger.
    this.trigger.addEventListener("click", this.openBottomSheet);
  }

  /**
   * Click to open bottomsheet with transition
   */
  openBottomSheet() {
    const getbottomSheetContent = () => {
      this.bottomSheetContent = createElement("content");
      this.bottomSheetContent.setAttribute("body-scroll-lock-ignore", true);
    };

    const getClonedBottomSheet = () => {
      this.clonedBottomSheet = this.bottomSheet.cloneNode(true);
      this.clonedBottomSheet.classList.add("bottom-sheet");

      // Create the content
      this.newBottomSheetContent = wrapAll(this.clonedBottomSheet, this.bottomSheetContent);
      this.clonedBottomSheet.appendChild(this.newBottomSheetContent);

      // Add interactivity based on the type of bottom-sheet
      if (this.options.overlay) this.clonedBottomSheet.classList.add("interactive");
    };

    const getSwipeableBottomSheet = () => {
      this.swipeableBottomSheet = document.createElement("div");
      this.swipeableBottomSheet.appendChild(this.clonedBottomSheet);

      if (this.options.overlay) this.swipeableBottomSheet.appendChild(this.overlay);
    };

    // Fade In animation on Overlay
    const fadeInOverlayAnimation = () => {
      const overlayAnimatoinEnd = () => {
        this.overlay.classList.remove("fade-in");
      };

      this.overlay.addEventListener("animationend", overlayAnimatoinEnd, {
        once: true,
      });

      this.overlay.classList.add("fade-in");
    };

    // Slide animation on bottom sheet
    const slideInBottomSheetAnimation = () => {
      const bottomSheetAnimatoinEnd = () => {
        this.clonedBottomSheet.classList.remove("slide-in");
      };

      this.clonedBottomSheet.addEventListener("animationend", bottomSheetAnimatoinEnd, {
        once: true,
      });

      this.clonedBottomSheet.classList.add("slide-in");
    };

    let mq = window.matchMedia("(min-width: 640px)");

    if (mq.matches === false) {
      const openedBottomSheet = document.getElementById(this.options.bottomSheetId);

      if (openedBottomSheet) {
        return;
      }

      if (openedInstances.length > 0) {
        // Close all openedInstance with their listeners
        openedInstances.forEach((instance) => {
          instance.bottomSheetDismissed = true;
          document.removeEventListener("touchstart", instance.toggleInteractivity);
          this.closeBottomSheet(instance.swipeableBottomSheet);
        });
      }

      // Set bottomsheet dismissed status to false
      this.bottomSheetDismissed = false;

      if (this.options.overlay) this.overlay = createElement("overlay");
      this.bottomSheetPeek = createElement("peek");
      this.bottomSheetMargin = createElement("margin");
      this.bottomSheetPeek.style.top = this.options.peek;

      getbottomSheetContent();
      getClonedBottomSheet();

      // Improvise cloned bottom sheet content
      this.clonedBottomSheet.classList.add("disable-scrollbars");
      this.clonedBottomSheet.insertBefore(this.bottomSheetPeek, this.clonedBottomSheet.firstChild);
      this.clonedBottomSheet.insertBefore(this.bottomSheetMargin, this.clonedBottomSheet.firstChild);
      this.clonedBottomSheet.addEventListener("scroll", this.onScroll, passiveIsSupported ? { passive: true } : false);

      // Create a new component container every time
      getSwipeableBottomSheet();

      // Add ID to each bottom sheet
      this.id = ++ID_COUNTER;
      this.swipeableBottomSheet.dataset.bottomSheetId = this.id;

      // Append the bottom sheet to the DOM
      document.body.appendChild(this.swipeableBottomSheet);

      if (!this.options.overlay) {
        // Add ID to differentiate from two types of bottom sheet
        this.swipeableBottomSheet.setAttribute("id", `swipeable-bottom-sheet-no-overlay`);

        // Add Toggle Interactivity to the bottom sheet based on the mouse position
        document.addEventListener(
          "touchstart",
          this.toggleInteractivity,
          passiveIsSupported ? { passive: true } : false
        );
      }

      // Scroll the bottom sheet till the peek position
      this.clonedBottomSheet.scrollTop = this.bottomSheetPeek.offsetTop;
      this.closeThreshold = this.bottomSheetPeek.offsetTop * 0.5;

      // Handle Threshold exceptions
      if (this.options.closeThreshold && this.options.closeThreshold < this.bottomSheetPeek.offsetTop) {
        this.closeThreshold = this.options.closeThreshold;
      }

      // Store all the opened instances
      openedInstances = [...openedInstances, this];

      /**
       * Open Animation.
       */
      slideInBottomSheetAnimation();

      if (this.options.overlay) {
        // Disable the body scroll
        bodyScrollLock.disableBodyScroll(this.clonedBottomSheet);

        fadeInOverlayAnimation();

        const handleMarginClick = () => this.closeBottomSheet(this.swipeableBottomSheet);

        // Click margin area to close the bottom sheet
        this.bottomSheetMargin.addEventListener("click", handleMarginClick, { once: true });
      }
    } else {
      this.options.overlay = true;

      if (this.options.overlay) this.overlay = createElement("overlay");
      getbottomSheetContent();
      getClonedBottomSheet();

      // Append the bottom sheet to the DOM and disable body scroll
      getSwipeableBottomSheet();
      document.body.appendChild(this.swipeableBottomSheet);

      fadeInOverlayAnimation();

      // Disable body scroll
      bodyScrollLock.disableBodyScroll(this.clonedBottomSheet);

      const handleMarginClick = () => {
        if (!this.newBottomSheetContent.contains(event.target)) {
          this.closeBottomSheet(this.swipeableBottomSheet, false);
        }
      };

      // Click margin area to close the bottom sheet
      this.clonedBottomSheet.addEventListener("click", handleMarginClick, { once: true });
    }
  }

  onScroll() {
    /**
     * If bottomsheet is not dismissed and scrolled below half of peek element
     */
    if (!this.bottomSheetDismissed && this.clonedBottomSheet.scrollTop < this.closeThreshold) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;
      this.closeBottomSheet(this.swipeableBottomSheet);
    }
  }

  /**
   * Close bottom sheet with animation.
   */
  closeBottomSheet(bottomSheetToClose, slide = true) {
    const bottomSheet = bottomSheetToClose.querySelector(".bottom-sheet");

    const onAnimationEnd = (e) => {
      if (e.srcElement.classList.contains("fade-out")) {
        // Enable  body scroll lock
        bodyScrollLock.enableBodyScroll(bottomSheet);
        // Remove the instance that are going to be closed
        openedInstances = openedInstances.filter((instance) => bottomSheetToClose !== instance.swipeableBottomSheet);

        document.body.removeChild(bottomSheetToClose);
      }
    };

    bottomSheetToClose.addEventListener("animationend", onAnimationEnd, { once: true });

    // Close Aniamation
    bottomSheetToClose.classList.add("fade-out");

    if (slide) {
      bottomSheet.classList.add("slide-out");
    }
  }

  enableInteractivity() {
    if (!this.isInteractive) {
      this.isInteractive = true;
      // Add interactivity to the bottomsheet
      this.clonedBottomSheet.classList.add("interactive");
      bodyScrollLock.disableBodyScroll(this.clonedBottomSheet);
    }
  }

  disableInteractivity() {
    if (this.isInteractive) {
      this.isInteractive = false;
      // Remove interactivity from the bottomsheet
      this.clonedBottomSheet.classList.remove("interactive");
      bodyScrollLock.enableBodyScroll(this.clonedBottomSheet);
    }
  }

  toggleInteractivity(e) {
    const { y } = getCurrentCursorPosition(e);
    // If the mouse is on the bottomsheet enable the interactivity else disable it
    if (y > this.clonedBottomSheet.clientHeight + this.clonedBottomSheet.offsetTop - this.clonedBottomSheet.scrollTop) {
      this.enableInteractivity();
    } else {
      this.disableInteractivity();
    }
  }
}
