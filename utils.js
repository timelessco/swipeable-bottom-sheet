/**
 * See if passive is supported by the browsers to improve the performance.
 *
 * @see MDN 😍    https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 */
function passiveIsSupported() {
  let isSupported = false;

  try {
    const options = {
      get passive() {
        passiveSupported = true;
        return false;
      },
    };

    window.addEventListener("test", null, options);
    window.removeEventListener("test", null, options);
  } catch (e) {}

  return isSupported;
}

/**
 * Get Current cursor position from any events types
 *
 * @see StackOverflow 😛     https://stackoverflow.com/a/61732450/10858781
 */
function getCurrentCursorPosition(e) {
  let x, y;

  if (
    e.type == "touchstart" ||
    e.type == "touchmove" ||
    e.type == "touchend" ||
    e.type == "touchcancel"
  ) {
    var evt = typeof e.originalEvent === "undefined" ? e : e.originalEvent;
    var touch = evt.touches[0] || evt.changedTouches[0];
    x = touch.pageX;
    y = touch.pageY;
  } else if (
    e.type == "mousedown" ||
    e.type == "mouseup" ||
    e.type == "mousemove" ||
    e.type == "mouseover" ||
    e.type == "mouseout" ||
    e.type == "mouseenter" ||
    e.type == "mouseleave"
  ) {
    x = e.clientX;
    y = e.clientY;
  }

  return { x, y };
}

/**
 * Get if the current device is touch supported.
 *
 * @see StackOverflow 😛    https://stackoverflow.com/a/34146257/10858781
 */
function getIsTouchSupported() {
  return (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch) ||
    navigator.maxTouchPoints > 0 ||
    window.navigator.msMaxTouchPoints > 0
  );
}

const FOCUSABLE_ELEMENTS_QUERY = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "details",
  "summary",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
].join(",");

function focusOnFirstElement(elm) {
  const focusable = elm.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY);
  const firstFocusable = focusable[0];
  window.setTimeout(() => firstFocusable.focus());
}

function trapFocus(elm, event) {
  let focusableNodes = elm.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY);

  // no focusable nodes
  if (focusableNodes.length === 0) return;

  /**
   * Filters nodes which are hidden to prevent
   * focus leak outside modal
   */
  focusableNodes = [...focusableNodes].filter((node) => {
    return node.offsetParent !== null;
  });

  // if disableFocus is true
  if (!elm.contains(document.activeElement)) {
    focusableNodes[0].focus();
  } else {
    const focusedItemIndex = focusableNodes.indexOf(document.activeElement);

    if (event.shiftKey && focusedItemIndex === 0) {
      focusableNodes[focusableNodes.length - 1].focus();
      event.preventDefault();
    }

    if (
      !event.shiftKey &&
      focusableNodes.length > 0 &&
      focusedItemIndex === focusableNodes.length - 1
    ) {
      focusableNodes[0].focus();
      event.preventDefault();
    }
  }
}
