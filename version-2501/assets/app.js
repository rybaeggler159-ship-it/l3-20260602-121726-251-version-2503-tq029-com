(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const navigation = document.querySelector('[data-site-nav]');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', () => {
            navigation.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    const showSlide = (index) => {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle('is-active', current === heroIndex);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle('is-active', current === heroIndex);
        });
    };

    const startHero = () => {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(() => {
            showSlide(heroIndex + 1);
        }, 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                startHero();
            }
        });
    });

    showSlide(0);
    startHero();

    const searchInput = document.querySelector('.js-search');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    let activeFilter = 'all';

    const applyFilters = () => {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        cards.forEach((card) => {
            const haystack = card.getAttribute('data-search') || '';
            const kind = card.getAttribute('data-kind') || '';
            const matchedKeyword = !keyword || haystack.includes(keyword);
            const matchedFilter = activeFilter === 'all' || kind === activeFilter;
            card.classList.toggle('is-hidden', !(matchedKeyword && matchedFilter));
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach((item) => {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });
})();
