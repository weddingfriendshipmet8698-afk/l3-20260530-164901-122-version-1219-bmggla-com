(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var movies = window.SEARCH_MOVIES || [];

  if (!form || !input || !results) {
    return;
  }

  input.value = initialQuery;

  function createCard(movie) {
    var link = document.createElement('a');
    link.className = 'movie-card';
    link.href = movie.href;
    link.innerHTML = [
      '<div class="poster-frame">',
      '<img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-badge">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>'
    ].join('');
    return link;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render() {
    var query = input.value.trim().toLowerCase();
    var words = query.split(/\s+/).filter(Boolean);
    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.type,
        movie.region,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });

    results.innerHTML = '';
    if (summary) {
      summary.textContent = query ? '找到 ' + matched.length + ' 部相关影片' : '输入关键词后可检索全部片库';
    }

    if (!query) {
      matched = movies.slice(0, 24);
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配结果，请尝试更换关键词。</div>';
      return;
    }

    matched.slice(0, 80).forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    window.history.replaceState(null, '', url);
    render();
  });

  input.addEventListener('input', render);
  render();
})();
