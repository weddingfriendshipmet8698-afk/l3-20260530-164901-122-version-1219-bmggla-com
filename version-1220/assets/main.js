(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    var navSearch = document.querySelector('.nav-search');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
        if (navSearch) {
          navSearch.classList.toggle('is-open');
        }
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = bySelector('[data-hero-slide]', hero);
      var thumbs = bySelector('[data-hero-thumb]', hero);
      var activeIndex = 0;

      function activate(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === activeIndex);
        });
        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle('is-active', i === activeIndex);
        });
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
          activate(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate(activeIndex + 1);
        }, 6200);
      }
    }

    bySelector('[data-filter-input]').forEach(function (input) {
      var target = input.getAttribute('data-filter-input');
      var cards = bySelector(target || '.movie-card');
      input.addEventListener('input', function () {
        var term = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' '));
          card.style.display = !term || haystack.indexOf(term) !== -1 ? '' : 'none';
        });
      });
    });

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchForm = document.querySelector('[data-search-form]');

    if (searchResults && searchInput && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      searchInput.value = initial;

      function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
          '<article class="movie-card compact-card">' +
            '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">' +
              '<div class="poster-wrap">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="card-badge">' + escapeHtml(movie.year) + '</span>' +
              '</div>' +
              '<div class="card-body">' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</div>' +
                '<div class="mini-tags">' + tags + '</div>' +
              '</div>' +
            '</a>' +
          '</article>';
      }

      function render() {
        var term = normalize(searchInput.value);
        var matches = window.SEARCH_MOVIES.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine,
            movie.year
          ].join(' '));
          return !term || haystack.indexOf(term) !== -1;
        }).slice(0, term ? 240 : 80);

        if (!matches.length) {
          searchResults.innerHTML = '<div class="search-results-empty">没有找到匹配影片，可以换一个关键词继续搜索。</div>';
          return;
        }

        searchResults.innerHTML = matches.map(movieCard).join('');
      }

      if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
          event.preventDefault();
          render();
          var nextUrl = './search.html';
          if (searchInput.value.trim()) {
            nextUrl += '?q=' + encodeURIComponent(searchInput.value.trim());
          }
          history.replaceState(null, '', nextUrl);
        });
      }

      searchInput.addEventListener('input', render);
      render();
    }
  });
})();
