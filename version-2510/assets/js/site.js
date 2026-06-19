(function () {
  function getCards(container) {
    return Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    if (slides.length <= 1) {
      return;
    }

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  function setupFilters() {
    var filterBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));

    filterBlocks.forEach(function (block) {
      var input = block.querySelector('[data-filter-search]');
      var yearSelect = block.querySelector('[data-filter-year]');
      var typeSelect = block.querySelector('[data-filter-type]');
      var cardsContainer = document.querySelector(block.getAttribute('data-filter-target'));
      var noResults = document.querySelector(block.getAttribute('data-no-results'));

      if (!cardsContainer) {
        return;
      }

      var cards = getCards(cardsContainer);

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardYear = card.getAttribute('data-year');
          var cardType = card.getAttribute('data-type');
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || cardYear === year;
          var matchesType = !type || cardType === type;
          var visible = matchesKeyword && matchesYear && matchesType;

          card.style.display = visible ? '' : 'none';

          if (visible) {
            visibleCount += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle('show', visibleCount === 0);
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function setupVideoPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls]'));

    if (!videos.length) {
      return;
    }

    var currentScript = document.currentScript || document.querySelector('script[src$="site.js"]');
    var hlsModuleUrl = currentScript ? new URL('hls-module.js', currentScript.src).href : './hls-module.js';

    videos.forEach(function (video) {
      var hlsSource = video.getAttribute('data-hls');
      var mp4Source = video.getAttribute('data-mp4');

      function useFallback() {
        if (mp4Source) {
          video.src = mp4Source;
        } else if (hlsSource) {
          video.src = hlsSource;
        }
      }

      if (!hlsSource) {
        useFallback();
        return;
      }

      import(hlsModuleUrl)
        .then(function (module) {
          var Hls = module.H;

          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(hlsSource);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, function (_event, data) {
              if (data && data.fatal) {
                hls.destroy();
                useFallback();
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsSource;
          } else {
            useFallback();
          }
        })
        .catch(useFallback);
    });
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.background = 'linear-gradient(135deg, #1a1a3e, #6d3eed)';
        image.alt = image.alt || '影片封面';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupVideoPlayers();
    setupImageFallbacks();
  });
})();
