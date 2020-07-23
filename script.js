const triggers = Array.from(document.querySelectorAll(".triggers .trigger"));

window.addEventListener("DOMContentLoaded", function () {
  // cssScrollSnapPolyfill();
  triggers.forEach((trigger) => {
    new SwipeableBottomSheet({ trigger });
  });
});

const defaultOptions = {};

/**
 * Swipeable Bottom Sheet.
 */
let ID_COUNTER = 0;

class SwipeableBottomSheet {
  constructor(options) {
    // Combine default options with user options
    this.options = {
      ...defaultOptions,
      ...options,
    };

    // Get all the trigger elements
    this.trigger = this.options.trigger;

    const bottomSheetNode = document.querySelector("#swipeable-bottom-sheet");

    if (bottomSheetNode) {
      window.bottomSheet = bottomSheetNode.cloneNode(true);

      bottomSheetNode.remove();
    }
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
     * If bottomsheet is not dismissed and scrolled below half of peek element
     */
    if (!this.bottomSheetDismissed && this.clonedbottomSheet.scrollTop < this.bottomSheetPeek.offsetTop * 0.5) {
      // Set dismissed to true
      this.bottomSheetDismissed = true;

      this.swipeableBottomSheet.onanimationend = (e) => {
        if (e.srcElement.classList.contains("fade-out")) {
          // Remove Scroll listener on the bottomsheet
          this.clonedbottomSheet.removeEventListener("scroll", this.onScroll);
          bodyScrollLock.enableBodyScroll(this.clonedbottomSheet);

          document.body.removeChild(this.swipeableBottomSheet);
        }
      };

      this.clonedbottomSheet.classList.add("slide-out");
      this.swipeableBottomSheet.classList.add("fade-out");
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
    // Add ID to each bottom sheet
    this.id = `swipeable-bottom-sheet-${++ID_COUNTER}`;

    this.swipeableBottomSheet = document.createElement("div");
    this.swipeableBottomSheet.setAttribute("id", this.id);

    this.overlay = document.createElement("div");
    this.overlay.classList.add("overlay");

    this.clonedbottomSheet = window.bottomSheet.cloneNode(true);

    this.clonedbottomSheet.classList.add("bottom-sheet");
    this.clonedbottomSheet.classList.add("disable-scrollbars");
    // Add Scroll listener on the bottomsheet
    this.clonedbottomSheet.addEventListener("scroll", this.onScroll, passiveIsSupported ? { passive: true } : false);

    const wrapAll = (target, wrapper = document.createElement("div")) => {
      [...target.childNodes].forEach((child) => wrapper.appendChild(child));
      target.appendChild(wrapper);
      return wrapper;
    };

    this.bottomSheetContent = document.createElement("div");
    this.bottomSheetContent.classList.add("content");
    this.bottomSheetContent.setAttribute("body-scroll-lock-ignore", true);

    const newBottomSheetContent = wrapAll(this.clonedbottomSheet, this.bottomSheetContent);
    this.clonedbottomSheet.appendChild(newBottomSheetContent);

    this.bottomSheetPeek = document.createElement("div");
    this.bottomSheetPeek.classList.add("peek");

    this.clonedbottomSheet.insertBefore(this.bottomSheetPeek, this.clonedbottomSheet.firstChild);

    this.bottomSheetMargin = document.createElement("div");
    this.bottomSheetMargin.classList.add("margin");

    this.clonedbottomSheet.insertBefore(this.bottomSheetMargin, this.clonedbottomSheet.firstChild);

    /* =========================================================================*/
    this.swipeableBottomSheet.appendChild(this.overlay);
    this.swipeableBottomSheet.appendChild(this.clonedbottomSheet);
    document.body.appendChild(this.swipeableBottomSheet);
    this.overlay.classList.add("fade-in");
    this.clonedbottomSheet.classList.add("slide-in");

    /* =========================================================================*/
    bodyScrollLock.disableBodyScroll(this.clonedbottomSheet);
    /* =========================================================================*/

    this.overlay.onanimationend = () => {
      this.overlay.classList.remove("fade-in");
    };
    this.clonedbottomSheet.onanimationend = () => {
      this.clonedbottomSheet.classList.remove("slide-in");
    };

    this.clonedbottomSheet.scrollTop = this.bottomSheetPeek.offsetTop;

    // https://stackoverflow.com/a/61931093/10858781
    this.bottomSheetMargin.addEventListener(
      "click",
      () => {
        this.swipeableBottomSheet.onanimationend = (e) => {
          if (e.srcElement.classList.contains("fade-out")) {
            bodyScrollLock.enableBodyScroll(this.clonedbottomSheet);

            document.body.removeChild(this.swipeableBottomSheet);
          }
        };

        this.swipeableBottomSheet.classList.add("fade-out");
        this.clonedbottomSheet.classList.add("slide-out");
      },
      { once: true }
    );
  }
}
