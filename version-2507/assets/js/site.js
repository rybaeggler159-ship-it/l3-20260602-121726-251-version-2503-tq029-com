(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      var opened = body.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeHeroIndex = 0;
  var heroTimer = null;

  function setHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHeroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeHeroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeHeroIndex);
    });
  }

  function startHeroTimer() {
    if (heroSlides.length < 2) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      setHeroSlide(activeHeroIndex + 1);
    }, 5600);
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHeroSlide(index);
      startHeroTimer();
    });
  });

  setHeroSlide(0);
  startHeroTimer();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('.js-filter-panel'));

  filterForms.forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-target');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
    var keywordInput = panel.querySelector('[data-filter="keyword"]');
    var regionSelect = panel.querySelector('[data-filter="region"]');
    var yearSelect = panel.querySelector('[data-filter="year"]');
    var categorySelect = panel.querySelector('[data-filter="category"]');
    var emptyState = document.querySelector(panel.getAttribute('data-empty') || '');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && keywordInput) {
      keywordInput.value = q;
    }

    applyFilter();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var playButton = player.querySelector('.play-button');
    var errorBox = player.querySelector('.player-error');
    var url = player.getAttribute('data-video');
    var hlsInstance = null;
    var started = false;

    function showError() {
      if (errorBox) {
        errorBox.classList.add('is-visible');
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      if (!video || !url) {
        showError();
        return;
      }

      hideOverlay();

      if (started) {
        video.play().catch(showError);
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(showError);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 40,
          backBufferLength: 30,
          enableWorker: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(showError);
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }

      video.src = url;
      video.play().catch(showError);
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', hideOverlay);
      video.addEventListener('error', showError);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
