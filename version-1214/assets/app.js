(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mobilePanel.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  const hero = document.querySelector('.hero-slider');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-index]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-index')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  const liveSearch = document.querySelector('[data-live-search]');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('[data-empty-state]');
  const selects = Array.from(document.querySelectorAll('[data-filter-field]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function syncQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && liveSearch) {
      liveSearch.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    const query = normalize(liveSearch ? liveSearch.value : '');
    const filters = {};

    selects.forEach(function (select) {
      filters[select.getAttribute('data-filter-field')] = normalize(select.value);
    });

    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.getAttribute('data-search'));
      let matched = !query || haystack.includes(query);

      Object.keys(filters).forEach(function (key) {
        const filterValue = filters[key];

        if (!filterValue) {
          return;
        }

        const cardValue = normalize(card.getAttribute('data-' + key));

        if (cardValue !== filterValue) {
          matched = false;
        }
      });

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (liveSearch || selects.length) {
    syncQueryFromUrl();

    if (liveSearch) {
      liveSearch.addEventListener('input', filterCards);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });

    filterCards();
  }
}());
