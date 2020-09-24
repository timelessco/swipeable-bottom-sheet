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

  if (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend" || e.type == "touchcancel") {
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

/**
 * Wrap the target element with a div deeply.
 */
function wrapAll(target, wrapper = document.createElement("div")) {
  [...target.childNodes].forEach((child) => wrapper.appendChild(child));
  target.appendChild(wrapper);

  return wrapper;
}

/**
 * Create an element with its class.
 */
function createElement(classname) {
  const element = document.createElement("div");
  element.classList.add(classname);

  return element;
}
