export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $id(selector, scope = document) {
  return scope.getElementById(selector);
}

export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function listen(type, selector, callback) {
  document.addEventListener(type, event => {
    const target = event.target.closest(selector);

    if (target) {
      callback(event, target);
    }
  });
}

export function scroll(callback) {
  window.addEventListener(
    "scroll",
    callback,
    passiveIsSupported ? { passive: true } : false,
  );
}

/**
 * See if passive is supported by the browsers to improve the performance.
 *
 * @see MDN 😍    https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 */
export function passiveIsSupported() {
  let isSupported = false;

  try {
    const options = {
      get passive() {
        isSupported = true;
        return false;
      },
    };

    window.addEventListener("test", null, options);
    window.removeEventListener("test", null, options);
  } catch (e) {
    console.warn(e);
  }

  return isSupported;
}

/**
 * Get Current cursor position from any events types
 *
 * @see StackOverflow 😛     https://stackoverflow.com/a/61732450/10858781
 */
export function getCurrentCursorPosition(e) {
  let x;
  let y;

  if (
    e.type === "touchstart" ||
    e.type === "touchmove" ||
    e.type === "touchend" ||
    e.type === "touchcancel"
  ) {
    const evt = typeof e.originalEvent === "undefined" ? e : e.originalEvent;
    const touch = evt.touches[0] || evt.changedTouches[0];
    x = touch.pageX;
    y = touch.pageY;
  } else if (
    e.type === "mousedown" ||
    e.type === "mouseup" ||
    e.type === "mousemove" ||
    e.type === "mouseover" ||
    e.type === "mouseout" ||
    e.type === "mouseenter" ||
    e.type === "mouseleave"
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
export function getIsTouchSupported() {
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

export function focusOnFirstElement(elm) {
  const focusable = elm.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY);
  const firstFocusable = focusable[0];
  window.setTimeout(() => firstFocusable.focus());
}

export function trapFocus(elm, event) {
  let focusableNodes = elm.querySelectorAll(FOCUSABLE_ELEMENTS_QUERY);

  // no focusable nodes
  if (focusableNodes.length === 0) return;

  /**
   * Filters nodes which are hidden to prevent
   * focus leak outside modal
   */
  focusableNodes = [...focusableNodes].filter(node => {
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

/**
 * Wrap the target element with a div deeply.
 */
export function wrapAll(target, wrapper = document.createElement("div")) {
  [...target.childNodes].forEach(child => wrapper.appendChild(child));
  target.appendChild(wrapper);

  return wrapper;
}

/**
 * Create an element with its class.
 */
export function createElement(classname) {
  const element = document.createElement("div");
  element.classList.add(classname);

  return element;
}

// Transition Enter / Transition Leave Animation
// https://sebastiandedeyne.com/javascript-framework-diet/enter-leave-transitions/
function nextFrame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function afterTransition(element) {
  return new Promise(resolve => {
    const duration =
      Number(getComputedStyle(element).transitionDuration.replace("s", "")) *
      1000;

    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export const enter = async (element, transition) => {
  element.classList.remove("hidden");

  element.classList.add(`${transition}-enter`);
  element.classList.add(`${transition}-enter-start`);

  await nextFrame();

  element.classList.remove(`${transition}-enter-start`);
  element.classList.add(`${transition}-enter-end`);

  await afterTransition(element);

  element.classList.remove(`${transition}-enter-end`);
  element.classList.remove(`${transition}-enter`);
};

export const leave = async (element, transition) => {
  element.classList.add(`${transition}-leave`);
  element.classList.add(`${transition}-leave-start`);

  await nextFrame();

  element.classList.remove(`${transition}-leave-start`);
  element.classList.add(`${transition}-leave-end`);

  await afterTransition(element);

  element.classList.remove(`${transition}-leave-end`);
  element.classList.remove(`${transition}-leave`);
  element.classList.add("hidden");
};
