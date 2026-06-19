(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-source');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    if (!source) {
      return;
    }
    function bindSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }
    bindSource();
    function playVideo() {
      if (cover) {
        cover.classList.add('hidden');
      }
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (cover && video.currentTime === 0) {
        cover.classList.remove('hidden');
      }
    });
  }

  function initSearch() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('[data-search-input]');
    var results = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    function render(q) {
      var keyword = q.trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX;
      if (keyword) {
        list = list.filter(function (item) {
          return [item.title, item.region, item.type, item.genre, item.tags, item.desc]
            .join(' ')
            .toLowerCase()
            .indexOf(keyword) !== -1;
        });
      }
      list = list.slice(0, 80);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      results.innerHTML = list.map(function (item) {
        return '<article class="rank-item">'
          + '<span class="rank-num">▶</span>'
          + '<a href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '"></a>'
          + '<div class="rank-info"><h3><a href="' + item.url + '">' + item.title + '</a></h3><p>' + item.desc + '</p></div>'
          + '<strong class="rank-score">' + item.year + '</strong>'
          + '</article>';
      }).join('');
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var nextUrl = window.location.pathname + '?q=' + encodeURIComponent(input.value.trim());
      window.history.replaceState(null, '', nextUrl);
    });
    render(query);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPlayer();
    initSearch();
  });
})();
