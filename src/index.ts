// Include custom styles into the script to be injected into web pages.
// Remove this line to reduce script output size if you do not need styles.

import "./index.css";
import pThrottle from "p-throttle";
const doneClassName = "__codecov_wide_count_done";

const init = () => {
  document
    .querySelectorAll(`.circular.mini.label:not(.${doneClassName})`)
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      el.classList.add(doneClassName);
      el.style.height = "unset";
      el.style.width = "unset";
      const groups = el.title
        .trim()
        .replace(/\s/g, "")
        .match(/Builds?:(\d+),Suites?:(\d+)/i);
      if (groups === null) return;
      el.textContent = `${groups[1]}:${groups[2]}`;
    });
};

const pInit = pThrottle(init, 1, 500);

init();

window.addEventListener("hashchange", () => {
  pInit();
});

const observer = new MutationObserver(pInit);

observer.observe(document.documentElement, {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true,
});
