(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
    });
  });

  document.querySelectorAll('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function scheduleHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        scheduleHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        scheduleHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        scheduleHero();
      });
    });

    scheduleHero();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var form = document.querySelector('[data-filter-form]');
    var input = form ? form.querySelector('[data-filter-input]') : null;
    var clear = form ? form.querySelector('[data-clear-filter]') : null;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var activeYear = 'all';

    function matchesYear(card, value) {
      var raw = card.getAttribute('data-year') || '';
      var year = parseInt(raw.replace(/\D/g, ''), 10);
      if (value === 'all') {
        return true;
      }
      if (value === '2020s') {
        return year >= 2020;
      }
      if (value === 'classic') {
        return year && year < 2015;
      }
      return raw.indexOf(value) !== -1;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matched = (!query || text.indexOf(query) !== -1) && matchesYear(card, activeYear);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        activeYear = 'all';
        document.querySelectorAll('[data-year-filter]').forEach(function (chip) {
          chip.classList.toggle('is-active', chip.getAttribute('data-year-filter') === 'all');
        });
        applyFilter();
      });
    }

    document.querySelectorAll('[data-year-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeYear = chip.getAttribute('data-year-filter') || 'all';
        document.querySelectorAll('[data-year-filter]').forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilter();
      });
    });
  });

  var searchResults = document.getElementById('search-results');
  if (searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var searchInput = document.querySelector('[data-search-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchEmpty = document.getElementById('search-empty');

    if (searchInput) {
      searchInput.value = query;
    }

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card">' +
          '<a href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<div class="poster-frame">' +
              '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
            '</div>' +
            '<div class="movie-card-body">' +
              '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
              '<h3>' + escapeHtml(movie.title) + '</h3>' +
              '<p>' + escapeHtml(movie.oneLine) + '</p>' +
              '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
          '</a>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var list = window.SITE_MOVIES.filter(function (movie) {
      if (!query) {
        return true;
      }
      var text = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, query ? 160 : 36);

    if (searchTitle) {
      searchTitle.textContent = query ? '搜索：' + query : '精选影片';
    }
    searchResults.innerHTML = list.map(movieCard).join('');
    searchResults.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
    if (searchEmpty) {
      searchEmpty.classList.toggle('is-visible', list.length === 0);
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('.player-overlay');
    var source = stage.getAttribute('data-src');
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (!video || !source || prepared) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      prepare();
      if (!video) {
        return;
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    }

    stage.addEventListener('click', function (event) {
      if (event.target === video || event.target === button || (button && button.contains(event.target))) {
        return;
      }
      if (video && video.paused) {
        playVideo();
      }
    });
  });
})();
