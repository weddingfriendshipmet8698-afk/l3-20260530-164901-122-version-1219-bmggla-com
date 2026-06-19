(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');

    if (slides.length <= 1) {
      return;
    }

    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initCategoryTools() {
    var input = qs('[data-card-filter]');
    var cards = qsa('[data-title][data-year][data-hot]');
    var buttons = qsa('[data-sort]');
    var grid = qs('[data-card-grid]');

    if (!grid || !cards.length) {
      return;
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var category = (card.getAttribute('data-category') || '').toLowerCase();
        var visible = !keyword || title.indexOf(keyword) !== -1 || category.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
      });
    }

    function sortCards(mode) {
      var sorted = cards.slice().sort(function (left, right) {
        if (mode === 'hot') {
          return Number(right.getAttribute('data-hot')) - Number(left.getAttribute('data-hot'));
        }

        if (mode === 'title') {
          return (left.getAttribute('data-title') || '').localeCompare(right.getAttribute('data-title') || '', 'zh-Hans-CN');
        }

        return Number(right.getAttribute('data-year')) - Number(left.getAttribute('data-year'));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        sortCards(button.getAttribute('data-sort'));
        filterCards();
      });
    });
  }

  function initSearchPage() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var result = qs('[data-search-results]');
    var note = qs('[data-search-note]');

    if (!form || !input || !result || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function render(query) {
      var keyword = query.trim().toLowerCase();
      var matches = [];

      if (keyword) {
        matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
          return [item.title, item.year, item.genre, item.category, item.oneLine].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);
      }

      if (!keyword) {
        note.textContent = '输入片名、类型、年份或分类关键词后开始搜索。';
        result.innerHTML = '';
        return;
      }

      note.textContent = '搜索“' + query + '”找到 ' + matches.length + ' 个结果。';

      if (!matches.length) {
        result.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
        return;
      }

      result.innerHTML = matches.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster" href="' + item.href + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="play-chip">播放</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="movie-meta"><span>' + item.year + '</span><span>' + escapeHtml(item.category) + '</span></div>',
          '    <h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p>' + escapeHtml(item.oneLine) + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });

    var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    input.value = initialQuery;
    render(initialQuery);
  }

  function initPlayers() {
    qsa('[data-video-url]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      var cover = qs('[data-player-cover]', shell);
      var status = qs('[data-player-status]', shell);
      var videoUrl = shell.getAttribute('data-video-url');
      var initialized = false;

      if (!video || !button || !videoUrl) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function startPlayback() {
        if (!initialized) {
          initialized = true;
          setStatus('正在连接播放源...');

          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('播放源已就绪，可使用浏览器控制栏调节进度、音量与全屏。');
              video.play().catch(function () {
                setStatus('播放源已加载，请再次点击播放按钮。');
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('播放连接暂时不可用，请刷新页面后重试。');
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', function () {
              setStatus('播放源已就绪。');
              video.play().catch(function () {
                setStatus('播放源已加载，请再次点击播放按钮。');
              });
            });
          } else {
            video.src = videoUrl;
            setStatus('当前浏览器可能需要 HLS 支持，请使用新版浏览器访问。');
          }
        } else {
          video.play();
        }

        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      button.addEventListener('click', startPlayback);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initCategoryTools();
    initSearchPage();
    initPlayers();
  });
})();
