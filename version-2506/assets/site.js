(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(card) {
    return [
      card.dataset.title || "",
      card.dataset.year || "",
      card.dataset.region || "",
      card.dataset.type || "",
      card.dataset.genre || "",
      card.dataset.tags || ""
    ].join(" ").toLowerCase();
  }

  function applyFilter(scope, query, filter) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");
    var q = (query || "").trim().toLowerCase();
    var f = (filter || "全部").trim();
    var shown = 0;

    cards.forEach(function (card) {
      var text = textOf(card);
      var matchQuery = !q || text.indexOf(q) !== -1;
      var matchFilter = f === "全部" || text.indexOf(f.toLowerCase()) !== -1;
      var visible = matchQuery && matchFilter;
      card.style.display = visible ? "" : "none";
      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.style.display = shown ? "none" : "block";
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll(".hero").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      if (!slides.length) {
        return;
      }
      var current = 0;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      show(0);
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var active = "全部";
      var params = new URLSearchParams(window.location.search);
      var incoming = params.get("q") || "";
      if (input && incoming) {
        input.value = incoming;
      }
      buttons.forEach(function (button) {
        if (button.dataset.filter === active) {
          button.classList.add("active");
        }
        button.addEventListener("click", function () {
          active = button.dataset.filter || "全部";
          buttons.forEach(function (b) {
            b.classList.toggle("active", b === button);
          });
          applyFilter(scope, input ? input.value : "", active);
        });
      });
      if (input) {
        input.addEventListener("input", function () {
          applyFilter(scope, input.value, active);
        });
      }
      applyFilter(scope, input ? input.value : "", active);
    });
  });

  window.bindStaticPlayer = function (source, videoId, triggerId) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    if (!video || !trigger || !source) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function loadVideo() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function start() {
      loadVideo();
      trigger.hidden = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          trigger.hidden = false;
        });
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      trigger.hidden = true;
    });
    video.addEventListener("ended", function () {
      trigger.hidden = false;
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
