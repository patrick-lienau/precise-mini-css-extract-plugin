/* eslint-env browser */
/*
  eslint-disable
  no-console,
  func-names
*/

/** @typedef {any} TODO */

const normalizeUrl = require("./normalize-url");

const srcByModuleId = Object.create(null);

const noDocument = typeof document === "undefined";

const { forEach } = Array.prototype;

/**
 * @param {function} fn
 * @param {number} time
 * @returns {(function(): void)|*}
 */
function debounce(fn, time) {
  let timeout = 0;

  return function () {
    // @ts-ignore
    const self = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    const functionCall = function functionCall() {
      return fn.apply(self, args);
    };

    clearTimeout(timeout);

    // @ts-ignore
    timeout = setTimeout(functionCall, time);
  };
}

function noop() {}

/**
 * @param {TODO} moduleId
 * @returns {TODO}
 */
function getCurrentScriptUrl(moduleId) {
  let src = srcByModuleId[moduleId];

  if (!src) {
    if (document.currentScript) {
      ({ src } = /** @type {HTMLScriptElement} */ (document.currentScript));
    } else {
      const scripts = document.getElementsByTagName("script");
      const lastScriptTag = scripts[scripts.length - 1];

      if (lastScriptTag) {
        ({ src } = lastScriptTag);
      }
    }

    srcByModuleId[moduleId] = src;
  }

  /**
   * @param {string} fileMap
   * @returns {null | string[]}
   */
  return function (fileMap) {
    if (!src) {
      return null;
    }

    const splitResult = src.split(/([^\\/]+)\.js$/);
    const filename = splitResult && splitResult[1];

    if (!filename) {
      return [src.replace(".js", ".css")];
    }

    if (!fileMap) {
      return [src.replace(".js", ".css")];
    }

    return fileMap.split(",").map((mapRule) => {
      const reg = new RegExp(`${filename}\\.js$`, "g");

      return normalizeUrl(
        src.replace(reg, `${mapRule.replace(/{fileName}/g, filename)}.css`)
      );
    });
  };
}

/**
 * @param {TODO} el
 * @param {string} [url]
 */
function updateCss(el, url) {
  if (!url) {
    if (!el.href) {
      return;
    }

    // eslint-disable-next-line
    url = el.href.split("?")[0];
  }

  if (!isUrlRequest(/** @type {string} */ (url))) {
    return;
  }

  if (el.isLoaded === false) {
    // We seem to be about to replace a css link that hasn't loaded yet.
    // We're probably changing the same file more than once.
    return;
  }

  if (!url || !(url.indexOf(".css") > -1)) {
    return;
  }

  // eslint-disable-next-line no-param-reassign
  el.visited = true;

  const newEl = el.cloneNode();

  newEl.isLoaded = false;

  newEl.addEventListener("load", () => {
    if (newEl.isLoaded) {
      return;
    }

    newEl.isLoaded = true;
    el.parentNode.removeChild(el);
  });

  newEl.addEventListener("error", () => {
    if (newEl.isLoaded) {
      return;
    }

    newEl.isLoaded = true;
    el.parentNode.removeChild(el);
  });

  newEl.href = `${url}?${Date.now()}`;

  if (el.nextSibling) {
    el.parentNode.insertBefore(newEl, el.nextSibling);
  } else {
    el.parentNode.appendChild(newEl);
  }
}

/**
 * @param {string} href
 * @param {TODO} src
 * @returns {TODO}
 */
function getReloadUrl(href, src) {
  let ret;

  // eslint-disable-next-line no-param-reassign
  href = normalizeUrl(href);

  src.some(
    /**
     * @param {string} url
     */
    // eslint-disable-next-line array-callback-return
    (url) => {
      if (href.indexOf(src) > -1) {
        ret = url;
      }
    }
  );

  return ret;
}

/**
 * @param {string} [src]
 * @returns {boolean}
 */
function reloadStyle(src) {
  if (!src) {
    return false;
  }

  const elements = document.querySelectorAll("link");
  let loaded = false;

  forEach.call(elements, (el) => {
    if (!el.href) {
      return;
    }

    const url = getReloadUrl(el.href, src);

    if (!isUrlRequest(url)) {
      return;
    }

    if (el.visited === true) {
      return;
    }

    if (url) {
      updateCss(el, url);

      loaded = true;
    }
  });

  return loaded;
}

/**
 * @param {((el: HTMLLinkElement) => boolean)} [predicate]
 */
function reloadAll(predicate) {
  const elements = document.querySelectorAll("link");

  forEach.call(elements, (el) => {
    if (el.visited === true) {
      return;
    }
    if (!predicate || predicate(el)) {
      updateCss(el);
    }
  });
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isUrlRequest(url) {
  // An URL is not an request if

  // It is not http or https
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
    return false;
  }

  return true;
}

let warned = false;
/**
 * @param {TODO} moduleId
 * @param {TODO} options
 * @returns {TODO}
 */
module.exports = function (moduleId, options) {
  if (noDocument) {
    if (!warned) {
      console.log("no window.document found, will not HMR CSS");
      warned = true;
    }

    return noop;
  }
  const getScriptSrc = getCurrentScriptUrl(moduleId);

  function update() {
    const src = getScriptSrc(options.filename);
    const reloaded = reloadStyle(src);

    if (options.locals) {
      if (
        options.shouldReloadLink === "always" ||
        options.shouldReloadLink === "alwaysLocals"
      ) {
        console.log("[HMR] detected css module update(s): reloading all css");
        reloadAll();
      } else if (options.shouldReloadLink === "never") {
        console.log(
          "[HMR] detected css module update(s): reloading is disabled."
        );
      } else {
        console.log(
          "[HMR] detected css module updates(s): reloading css matching predicate"
        );
        reloadAll(options.shouldReloadLink);
      }
    } else if (reloaded) {
      console.log("[HMR] detected css update(s): reloading %s", src.join(" "));
    } else if (options.shouldReloadLink === "always") {
      console.log("[HMR] detected css update(s): reloading all css");
      reloadAll();
    } else if (typeof options.shouldReloadLink === "function") {
      console.log(
        "[HMR] detected css update(s): reloading css matching predicate"
      );
      reloadAll(options.shouldReloadLink);
    } else {
      console.log("[HMR] detected css update(s): reloading is disabled");
    }
  }
  return debounce(update, 50);
};
