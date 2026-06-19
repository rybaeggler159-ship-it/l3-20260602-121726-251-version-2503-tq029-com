(function () {
  var mobileButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener("click", function () {
      var opened = mobilePanel.classList.toggle("is-open");
      mobileButton.setAttribute("aria-expanded", opened ? "true" : "false");
      mobileButton.textContent = opened ? "×" : "☰";
    });
  }

  var hero = document.querySelector(".hero");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector(".hero-control.prev");
    var next = hero.querySelector(".hero-control.next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
    var targetSelector = input.getAttribute("data-filter-input");
    var items = Array.prototype.slice.call(document.querySelectorAll(targetSelector));

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();

      items.forEach(function (item) {
        var content = item.getAttribute("data-search") || "";
        item.style.display = content.indexOf(keyword) >= 0 ? "" : "none";
      });
    });
  });

  var searchRoot = document.querySelector("[data-search-results]");

  if (searchRoot && window.movieIndex) {
    var params = new URLSearchParams(window.location.search);
    var input = document.querySelector("#searchPageInput");
    var keyword = (params.get("q") || "").trim();

    if (input) {
      input.value = keyword;
      input.addEventListener("input", function () {
        renderResults(input.value.trim());
      });
    }

    function movieTemplate(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class="movie-card" data-search="">" +
        "<a class="poster-link" href="./" + encodeURI(movie.file) + "" aria-label="" + escapeHtml(movie.title) + "">" +
        "<span class="poster-frame">" +
        "<img src="" + encodeURI(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
        "<span class="corner-badge">" + escapeHtml(movie.category) + "</span>" +
        "<span class="score-badge">★ " + escapeHtml(movie.rating) + "</span>" +
        "</span>" +
        "</a>" +
        "<div class="movie-card-body">" +
        "<h2><a href="./" + encodeURI(movie.file) + "">" + escapeHtml(movie.title) + "</a></h2>" +
        "<p class="movie-meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
        "<p class="movie-desc">" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class="tag-row">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function renderResults(value) {
      var needle = value.toLowerCase();
      var list = window.movieIndex.filter(function (movie) {
        return !needle || movie.search.indexOf(needle) >= 0;
      }).slice(0, 120);

      if (!list.length) {
        searchRoot.innerHTML = "<div class="search-results-empty">没有找到匹配的影片。</div>";
        return;
      }

      searchRoot.innerHTML = list.map(movieTemplate).join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          """: "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    renderResults(keyword);
  }
})();
