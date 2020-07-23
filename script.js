const triggers = Array.from(document.querySelectorAll(".triggers .trigger"));
const bottomSheet = document.querySelector(".bottom-sheet");

window.addEventListener("DOMContentLoaded", function () {
  // cssScrollSnapPolyfill();
  triggers.forEach((trigger) => {
    new SwipeableBottomSheet({ trigger, bottomSheet });
  });
});

const defaultOptions = {};

class SwipeableBottomSheet {
  constructor(options) {
    // Combine default options with user options
    this.options = {
      ...defaultOptions,
      ...options,
    };

    // Get all the trigger elements
    this.trigger = this.options.trigger;
    // Get the bottomsheet element
    this.bottomSheet = this.options.bottomSheet;
    // Get the bottom sheet margin element
    this.bottomSheetMargin = this.bottomSheet.querySelector(".margin");
    // Get the bottom sheet peek element
    this.bottomSheetPeek = this.bottomSheet.querySelector(".peek");
    // Get the bottom sheet container element
    this.bottomSheetContainer = this.bottomSheet.querySelector(".container");

    // Add `disable-scrollbars` class to hide the scrolls across all the browsers
    this.bottomSheet.classList.add("disable-scrollbars");
    // Hide the bottomsheet at startup
    this.bottomSheet.classList.add("hidden");

    // Eventlistener function binds
    this.openBottomSheet = this.openBottomSheet.bind(this);
    this.enableInteractivity = this.enableInteractivity.bind(this);
    this.disableInteractivity = this.disableInteractivity.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.toggleInteractivity = this.toggleInteractivity.bind(this);

    // Add listeners to open the bottomsheet on all the trigger.
    this.trigger.addEventListener("click", this.openBottomSheet, passiveIsSupported ? { passive: true } : false);
  }

  onScroll() {
    /**
     * If bottomsheet scrollTop reached its client height, enable the body scroll.
     */
    if (this.bottomSheetScrolled && this.bottomSheet.scrollTop < this.bottomSheet.clientHeight) {
      // Set bottomSheet scrolled to false
      this.bottomSheetScrolled = false;

      // Disable the body scroll when bottom sheet opens.
      enableBodyScroll(this.bottomSheet);
    }

    /**
     * If bottomsheet scrollTop reached its client height, disable the body scroll.
     */
    if (!this.bottomSheetScrolled && this.bottomSheet.scrollTop >= this.bottomSheet.clientHeight) {
      // Set bottomSheet scrolled to true
      this.bottomSheetScrolled = true;

      // Disable the body scroll when bottom sheet opens.
      disableBodyScroll(this.bottomSheet);
    }

    /**
     * If bottomsheet is not dismissed and scrolled below half of peek element
     */
    if (!this.bottomSheetDismissed && this.bottomSheet.scrollTop < this.bottomSheetPeek.offsetTop * 0.5) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;
      // Remove Scroll listener on the bottomsheet
      this.bottomSheet.removeEventListener("scroll", this.onScroll);

      // Add bottomsheet leave animation class
      this.bottomSheet.classList.add("bottom-sheet-leave");

      const onAnimationEnd = () => {
        // Remove bottomsheet leave animation class
        this.bottomSheet.classList.remove("bottom-sheet-leave");
        // Hide the bottomsheet
        this.bottomSheet.classList.add("hidden");
      };

      // Add AnimationEnd listener
      this.bottomSheet.addEventListener("animationend", onAnimationEnd, {
        once: true,
      });
    }
  }

  enableInteractivity() {
    if (!this.isInteractive) {
      this.isInteractive = true;
      // Add interactivity to the bottomsheet
      this.bottomSheet.classList.add("interactive");
    }
  }

  disableInteractivity() {
    if (this.isInteractive) {
      this.isInteractive = false;
      // Remove interactivity from the bottomsheet
      this.bottomSheet.classList.remove("interactive");
    }
  }

  toggleInteractivity(event) {
    const { y } = getCurrentCursorPosition(event);

    // If the mouse is on the bottomsheet enable the interactivity else disable it
    if (y > this.bottomSheet.clientHeight + this.bottomSheet.offsetTop - this.bottomSheet.scrollTop) {
      this.enableInteractivity();
    } else {
      this.disableInteractivity();
    }
  }

  /**
   * Click to open bottomsheet with transition
   */
  openBottomSheet() {
    // Set bottomsheet dismissed status to false
    this.bottomSheetDismissed = false;
    // Set bottomsheet scrolled status to false
    this.bottomSheetScrolled = false;

    // Show the bottomsheet
    this.bottomSheet.classList.remove("hidden");
    // Scroll bottomsheet till peek element
    this.bottomSheet.scrollTop = this.bottomSheetPeek.offsetTop;

    const onAnimationEnd = () => {
      // Remove bottomsheet enter animation class
      this.bottomSheet.classList.remove("bottom-sheet-enter");
    };

    // Add bottomsheet enter animation class
    this.bottomSheet.classList.add("bottom-sheet-enter");
    // Add AnimationEnd listener
    this.bottomSheet.addEventListener("animationend", onAnimationEnd, {
      once: true,
    });

    // Add Scroll listener on the bottomsheet
    this.bottomSheet.addEventListener("scroll", this.onScroll, passiveIsSupported ? { passive: true } : false);

    const isTouchSupported = getIsTouchSupported();

    if (isTouchSupported) {
      // Add Toggle Interactivity to the bottom sheet based on the mouse position
      document.addEventListener("touchstart", this.toggleInteractivity, passiveIsSupported ? { passive: true } : false);
    } else {
      document.addEventListener("mousemove", this.toggleInteractivity, passiveIsSupported ? { passive: true } : false);
    }
  }
}
