
(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    const startTimer = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    const scope = panel.parentElement.querySelector('[data-filter-scope]') || document;
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const reset = panel.querySelector('[data-filter-reset]');

    const applyFilter = function () {
      const text = input ? input.value.trim().toLowerCase() : '';
      const selectedYear = year ? year.value : '';
      const selectedType = type ? type.value : '';

      cards.forEach(function (card) {
        const cardText = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' ').toLowerCase();
        const yearMatches = !selectedYear || card.dataset.year === selectedYear;
        const typeMatches = !selectedType || card.dataset.type === selectedType;
        const textMatches = !text || cardText.indexOf(text) !== -1;
        card.classList.toggle('is-hidden', !(yearMatches && typeMatches && textMatches));
      });
    };

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        applyFilter();
      });
    }
  });
}());

function setupMoviePlayer(streamUrl) {
  const video = document.querySelector('[data-player-video]');
  const layer = document.querySelector('[data-player-layer]');
  const status = document.querySelector('[data-player-status]');

  if (!video || !layer || !streamUrl) {
    return;
  }

  let attached = false;

  const attachStream = function () {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  };

  const play = function () {
    attachStream();
    layer.classList.add('is-hidden');
    video.controls = true;
    const attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        layer.classList.remove('is-hidden');
        if (status) {
          status.textContent = '点击继续播放';
        }
      });
    }
  };

  layer.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
