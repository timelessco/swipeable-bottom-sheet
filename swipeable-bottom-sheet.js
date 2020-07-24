let bottomSheets = [];
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

    // Add listeners to open the bottomsheet on all the trigger.
    this.trigger.addEventListener("click", this.openBottomSheet, passiveIsSupported ? { passive: true } : false);
  }

  /**
   * Click to open bottomsheet with transition
   */
  openBottomSheet() {
    const openedBottomSheet = document.getElementById(this.options.bottomSheetId);

    if (openedBottomSheet) {
      return;
    }

    this.overlayBottomSheet = document.getElementById("swipeable-bottom-sheet-no-overlay");

    if (this.overlayBottomSheet) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;
      this.closeBottomSheet(this.overlayBottomSheet);
    }

    // Set bottomsheet dismissed status to false
    this.bottomSheetDismissed = false;
    // Add ID to each bottom sheet
    this.id = ++ID_COUNTER;

    // Create a new component container every time
    this.swipeableBottomSheet = document.createElement("div");
    this.swipeableBottomSheet.dataset.bottomSheetId = this.id;

    // Get the cloned bottom sheet content
    this.clonedbottomSheet = this.bottomSheet.cloneNode(true);
    this.clonedbottomSheet.classList.add("bottom-sheet");
    this.clonedbottomSheet.classList.add("disable-scrollbars");

    if (!this.options.overlay) {
      this.swipeableBottomSheet.setAttribute("id", `swipeable-bottom-sheet-no-overlay`);
    }

    // Add Scroll listener on the bottomsheet
    this.clonedbottomSheet.addEventListener("scroll", this.onScroll, passiveIsSupported ? { passive: true } : false);

    // Append the content
    this.bottomSheetContent = document.createElement("div");
    this.bottomSheetContent.classList.add("content");
    this.bottomSheetContent.setAttribute("body-scroll-lock-ignore", true);
    const newBottomSheetContent = wrapAll(this.clonedbottomSheet, this.bottomSheetContent);
    this.clonedbottomSheet.appendChild(newBottomSheetContent);

    // Append the peek
    this.bottomSheetPeek = document.createElement("div");
    this.bottomSheetPeek.classList.add("peek");
    this.bottomSheetPeek.style.top = this.options.peek;
    this.clonedbottomSheet.insertBefore(this.bottomSheetPeek, this.clonedbottomSheet.firstChild);

    // Append the margin
    this.bottomSheetMargin = document.createElement("div");
    this.bottomSheetMargin.classList.add("margin");
    this.clonedbottomSheet.insertBefore(this.bottomSheetMargin, this.clonedbottomSheet.firstChild);

    // Append Overlay
    if (this.options.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.classList.add("overlay");
      this.swipeableBottomSheet.appendChild(this.overlay);
    }

    // Append the bottom sheet to the DOM
    this.swipeableBottomSheet.appendChild(this.clonedbottomSheet);
    document.body.appendChild(this.swipeableBottomSheet);
    // Disable the body scroll
    bodyScrollLock.disableBodyScroll(this.clonedbottomSheet);
    // Scroll the bottom sheet till the peek position
    this.clonedbottomSheet.scrollTop = this.bottomSheetPeek.offsetTop;
    this.closeThreshold = this.bottomSheetPeek.offsetTop * 0.5;

    // Handle Threshold exceptions
    if (this.options.closeThreshold) {
      if (this.options.closeThreshold > this.bottomSheetPeek.offsetTop) {
      } else {
        this.closeThreshold = this.options.closeThreshold;
      }
    }

    /**
     * Open Animation.
     */
    if (this.options.overlay) {
      // Fade animation on Overlay
      const overlayAnimatoinEnd = () => {
        this.overlay.classList.remove("fade-in");
      };
      this.overlay.addEventListener("animationend", overlayAnimatoinEnd, { once: true });
      this.overlay.classList.add("fade-in");

      const handleMarginClick = () => this.closeBottomSheet(this.swipeableBottomSheet);

      // Click margin area to close the bottom sheet
      this.bottomSheetMargin.addEventListener("click", handleMarginClick, { once: true });
    }

    // Slide animation on bottom sheet
    const bottomSheetAnimatoinEnd = () => {
      this.clonedbottomSheet.classList.remove("slide-in");
    };
    this.clonedbottomSheet.addEventListener("animationend", bottomSheetAnimatoinEnd, { once: true });
    this.clonedbottomSheet.classList.add("slide-in");
  }

  onScroll() {
    /**
     * If bottomsheet is not dismissed and scrolled below half of peek element
     */
    if (!this.bottomSheetDismissed && this.clonedbottomSheet.scrollTop < this.closeThreshold) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;
      this.closeBottomSheet(this.swipeableBottomSheet);
    }
  }

  /**
   * Close bottom sheet with animation.
   */
  closeBottomSheet(bottomSheetToClose) {
    const bottomSheet = bottomSheetToClose.querySelector(".bottom-sheet");

    const onAnimationEnd = (e) => {
      if (e.srcElement.classList.contains("fade-out")) {
        bodyScrollLock.enableBodyScroll(bottomSheet);

        document.body.removeChild(bottomSheetToClose);
      }
    };

    bottomSheetToClose.addEventListener("animationend", onAnimationEnd, { once: true });

    // Close Aniamation
    bottomSheetToClose.classList.add("fade-out");
    bottomSheet.classList.add("slide-out");
  }
}
