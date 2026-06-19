import { H as Hls } from "./hls-vendor.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function bindMenu() {
  const button = document.querySelector("[data-menu-button]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }
  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function bindHero() {
  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length || !dots.length) {
    return;
  }
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
    });
  };

  const play = () => {
    timer = window.setInterval(() => {
      show(active + 1);
    }, 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (timer) {
        window.clearInterval(timer);
      }
      show(index);
      play();
    });
  });

  show(0);
  play();
}

function bindFilter() {
  const roots = Array.from(document.querySelectorAll("[data-filter-root]"));
  roots.forEach((root) => {
    const input = root.querySelector("[data-search-input]");
    const scope = root.closest("main") || document;
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    const empty = scope.querySelector("[data-no-results]");
    let value = "";

    const apply = () => {
      const text = ((input && input.value) || "").trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || "",
          card.dataset.year || "",
          card.dataset.key || ""
        ].join(" ").toLowerCase();
        const matchedText = !text || haystack.includes(text);
        const matchedValue = !value || haystack.includes(value.toLowerCase());
        const visible = matchedText && matchedValue;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    root.querySelectorAll("[data-filter-value]").forEach((button) => {
      button.addEventListener("click", () => {
        value = button.dataset.filterValue || "";
        apply();
      });
    });

    apply();
  });
}

export function setupVideo(videoId, coverId, buttonId, src) {
  const video = document.getElementById(videoId);
  const cover = document.getElementById(coverId);
  const button = document.getElementById(buttonId);
  if (!video || !src) {
    return;
  }

  let loaded = false;
  let hls = null;

  const load = () => {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  };

  const start = () => {
    load();
    video.controls = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  };

  if (cover) {
    cover.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

ready(() => {
  bindMenu();
  bindHero();
  bindFilter();
});
