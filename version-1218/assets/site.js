(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterRoot = qs('[data-tag-filter]');
  var filterList = qs('[data-filter-list]');

  if (filterRoot && filterList) {
    var filterButtons = qsa('[data-filter-tag]', filterRoot);
    var cards = qsa('.movie-card', filterList);

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var tag = button.getAttribute('data-filter-tag');

        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        cards.forEach(function (card) {
          if (tag === 'all') {
            card.classList.remove('is-filter-hidden');
            return;
          }

          var text = card.textContent || '';
          card.classList.toggle('is-filter-hidden', text.indexOf(tag) === -1);
        });
      });
    });
  }

  var searchResults = qs('[data-search-results]');
  var searchStatus = qs('[data-search-status]');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('.wide-search input[name="q"]');

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster" href="' + movie.url + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="badge-year">' + escapeHtml(movie.year) + '</span>',
        '    <span class="badge-region">' + escapeHtml(movie.region) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-line">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    if (!query) {
      searchResults.innerHTML = '<div class="search-empty">输入关键词后即可浏览相关内容。</div>';
    } else {
      var words = normalize(query).split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine,
          movie.summary
        ].join(' '));

        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      if (matches.length) {
        searchResults.innerHTML = matches.map(renderCard).join('');

        if (searchStatus) {
          searchStatus.textContent = '以下内容与“' + query + '”相关。';
        }
      } else {
        searchResults.innerHTML = '<div class="search-empty">没有找到相关内容，可以尝试更换关键词。</div>';

        if (searchStatus) {
          searchStatus.textContent = '没有找到与“' + query + '”相关的内容。';
        }
      }
    }
  }
})();
