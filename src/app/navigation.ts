import type { MouseEvent } from "react";

export function navigateTo(href: string) {
  const url = new URL(href, window.location.origin);
  const nextPath = `${url.pathname}${url.search}${url.hash}`;

  window.history.pushState({}, "", nextPath);
  window.dispatchEvent(new PopStateEvent("popstate"));

  if (url.hash) {
    window.setTimeout(() => {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function isInternalClick(event: MouseEvent<HTMLAnchorElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0;
}
