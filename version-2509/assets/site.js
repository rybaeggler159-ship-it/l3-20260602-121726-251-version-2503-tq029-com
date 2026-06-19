let HlsModulePromise = null;

function loadHlsClass() {
  if (!HlsModulePromise) {
    HlsModulePromise = import('./hls-dru42stk.js').then((module) => module.H);
  }
  return HlsModulePromise;
}

function setupMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  function showSlide(nextIndex) {
    if (slides.length === 0) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(index + 1), 5000);
  }

  previous?.addEventListener('click', () => {
    showSlide(index - 1);
    startTimer();
  });

  next?.addEventListener('click', () => {
    showSlide(index + 1);
    startTimer();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      startTimer();
    });
  });

  showSlide(0);
  startTimer();
}

function setupLocalFilters() {
  const input = document.querySelector('[data-local-filter]');
  const count = document.querySelector('[data-filter-count]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  if (!input || cards.length === 0) {
    return;
  }

  function applyFilter() {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const matched = !query || text.includes(query);
      card.classList.toggle('hidden-by-filter', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `${visible} 部内容`;
    }
  }

  input.addEventListener('input', applyFilter);
}

async function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  if (players.length === 0) {
    return;
  }

  for (const player of players) {
    const video = player.querySelector('video');
    const startButton = player.querySelector('[data-player-start]');
    const errorBox = player.querySelector('[data-player-error]');
    const source = player.dataset.videoSrc;

    if (!video || !source) {
      continue;
    }

    video.controls = true;

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        player.classList.add('is-ready');
      } else {
        const Hls = await loadHlsClass();
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            player.classList.add('is-ready');
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data && data.fatal) {
              showPlayerError(player, errorBox, '播放源加载失败，请刷新页面或稍后重试。');
            }
          });
        } else {
          showPlayerError(player, errorBox, '当前浏览器暂不支持 HLS 播放。');
        }
      }
    } catch (error) {
      showPlayerError(player, errorBox, '播放器初始化失败，请检查网络或浏览器设置。');
    }

    startButton?.addEventListener('click', async () => {
      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        showPlayerError(player, errorBox, '点击后仍无法播放，请稍后重试。');
      }
    });

    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
  }
}

function showPlayerError(player, errorBox, message) {
  player.classList.add('has-error');
  player.classList.add('is-ready');
  if (errorBox) {
    errorBox.textContent = message;
  }
}

function setupPlayerScrollButtons() {
  document.querySelectorAll('[data-scroll-player]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const player = document.querySelector('[data-player]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

function setupSearchPage() {
  const root = document.querySelector('[data-search-page]');
  if (!root) {
    return;
  }

  const input = root.querySelector('[data-search-input]');
  const regionFilter = root.querySelector('[data-region-filter]');
  const typeFilter = root.querySelector('[data-type-filter]');
  const resetButton = root.querySelector('[data-search-reset]');
  const results = root.querySelector('[data-search-results]');
  const summary = root.querySelector('[data-search-summary]');
  const data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (input && initialQuery) {
    input.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function movieMatches(movie, query, region, type) {
    const text = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.categoryName,
      movie.oneLine,
      movie.genreRaw,
      (movie.tags || []).join(' ')
    ].join(' '));

    if (query && !text.includes(query)) {
      return false;
    }
    if (region && movie.region !== region) {
      return false;
    }
    if (type && movie.type !== type) {
      return false;
    }
    return true;
  }

  function renderMovie(movie) {
    const tags = (movie.tags || []).slice(0, 2).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
      <article class="movie-card compact-card" data-movie-card>
        <a href="${escapeAttribute(movie.url)}" class="poster-wrap" aria-label="观看 ${escapeAttribute(movie.title)}">
          <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy">
          <span class="year-badge">${escapeHtml(movie.year)}</span>
          <span class="play-hover">▶</span>
        </a>
        <div class="movie-card-body">
          <div class="card-meta">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
          </div>
          <h3><a href="${escapeAttribute(movie.url)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine)}</p>
          <div class="tag-row">${tags}</div>
        </div>
      </article>`;
  }

  function applySearch() {
    const query = normalize(input?.value.trim());
    const region = regionFilter?.value || '';
    const type = typeFilter?.value || '';
    const matched = data.filter((movie) => movieMatches(movie, query, region, type));
    const visible = matched.slice(0, 240);

    if (results) {
      results.innerHTML = visible.map(renderMovie).join('');
    }

    if (summary) {
      const moreText = matched.length > visible.length ? `，当前展示前 ${visible.length} 部` : '';
      summary.textContent = `找到 ${matched.length} 部相关内容${moreText}。`;
    }
  }

  input?.addEventListener('input', applySearch);
  regionFilter?.addEventListener('change', applySearch);
  typeFilter?.addEventListener('change', applySearch);
  resetButton?.addEventListener('click', () => {
    if (input) {
      input.value = '';
    }
    if (regionFilter) {
      regionFilter.value = '';
    }
    if (typeFilter) {
      typeFilter.value = '';
    }
    applySearch();
  });

  if (initialQuery) {
    applySearch();
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHeroSlider();
  setupLocalFilters();
  setupPlayerScrollButtons();
  setupSearchPage();
  setupPlayers();
});
