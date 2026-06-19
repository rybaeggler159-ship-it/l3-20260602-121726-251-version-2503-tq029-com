document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupBackTop();
    setupHeroCarousel();
    setupFilters();
    setupImageFallbacks();
});

function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
    });
}

function setupBackTop() {
    var buttons = document.querySelectorAll('[data-back-top]');

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
}

function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
        return;
    }

    function activate(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            activate(index);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function setupFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
        var scope = panel.closest('section') || document;
        var grid = scope.querySelector('[data-movie-grid]');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')) : [];
        var searchInput = panel.querySelector('[data-search-input]');
        var categorySelect = panel.querySelector('[data-filter-category]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var sortSelect = panel.querySelector('[data-sort-select]');
        var count = panel.querySelector('[data-visible-count]');
        var empty = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var query = normalize(searchInput ? searchInput.value : '');
            var category = categorySelect ? categorySelect.value : 'all';
            var region = regionSelect ? regionSelect.value : 'all';
            var visible = [];

            cards.forEach(function (card) {
                var haystack = normalize(card.dataset.search);
                var cardCategory = card.dataset.category || '';
                var cardRegion = card.dataset.region || '';
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesCategory = category === 'all' || cardCategory === category;
                var matchesRegion = region === 'all' || cardRegion === region;
                var shouldShow = matchesQuery && matchesCategory && matchesRegion;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visible.push(card);
                }
            });

            sortVisible(visible);

            if (count) {
                count.textContent = String(visible.length);
            }

            if (empty) {
                empty.classList.toggle('visible', visible.length === 0);
            }
        }

        function sortVisible(visible) {
            if (!grid || !sortSelect) {
                return;
            }

            var mode = sortSelect.value;
            var sorted = visible.slice();

            if (mode === 'rating') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                });
            } else if (mode === 'year') {
                sorted.sort(function (a, b) {
                    return Number(String(b.dataset.year || '').replace(/\D/g, '') || 0) - Number(String(a.dataset.year || '').replace(/\D/g, '') || 0);
                });
            } else if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [searchInput, categorySelect, regionSelect, sortSelect].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });

        apply();
    });
}

function setupImageFallbacks() {
    var images = document.querySelectorAll('img');

    images.forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
            var wrapper = image.parentElement;

            if (wrapper && !wrapper.dataset.fallbackReady) {
                wrapper.dataset.fallbackReady = 'true';
                wrapper.style.background = 'linear-gradient(135deg, #fce7f3, #ffedd5)';
                wrapper.title = image.alt || '电影封面';
            }
        });
    });
}
