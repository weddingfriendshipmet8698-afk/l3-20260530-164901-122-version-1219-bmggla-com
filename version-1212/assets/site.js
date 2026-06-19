(function () {
  const body = document.body;
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      body.classList.toggle(
        "menu-open",
        mobilePanel.classList.contains("is-open"),
      );
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-list]").forEach(function (list) {
    const section = list.closest("main") || document;
    const input = section.querySelector("[data-local-search]");
    const buttons = Array.from(section.querySelectorAll("[data-tag-filter]"));
    const cards = Array.from(list.querySelectorAll(".movie-card"));
    let tag = "all";

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        const haystack = (card.dataset.search || "").toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesTag =
          tag === "all" || haystack.includes(tag.toLowerCase());
        card.classList.toggle("hidden-card", !(matchesQuery && matchesTag));
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        tag = button.dataset.tagFilter || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  });

  const startPlayer = function (player) {
    const video = player.querySelector("video");
    if (!video) {
      return;
    }
    const source = video.dataset.playSrc;
    if (!source) {
      return;
    }
    player.classList.add("is-ready");

    if (video.dataset.bound !== "true") {
      if (globalThis.Hls && globalThis.Hls.isSupported()) {
        const hls = new globalThis.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(globalThis.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
      }
      video.dataset.bound = "true";
    }

    video.play().catch(function () {});
  };

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const button = player.querySelector(".player-button");
    const video = player.querySelector("video");

    if (button) {
      button.addEventListener("click", function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.dataset.bound !== "true") {
          startPlayer(player);
        }
      });
    }
  });

  const results = document.getElementById("searchResults");
  if (results) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    const input = document.querySelector("[data-search-page-input]");
    const title = document.querySelector("[data-search-title]");
    const items = Array.isArray(globalThis.SiteSearch)
      ? globalThis.SiteSearch
      : [];

    const escapeHtml = function (value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const renderCard = function (item) {
      return [
        '<article class="movie-card">',
        '<a class="movie-poster" href="' + escapeHtml(item.url) + '">',
        '<img src="./' +
          escapeHtml(item.image) +
          '" alt="' +
          escapeHtml(item.title) +
          ' 封面" loading="lazy" decoding="async">',
        '<span class="play-chip">播放</span>',
        "</a>",
        '<div class="movie-card-body">',
        '<h3><a href="' +
          escapeHtml(item.url) +
          '">' +
          escapeHtml(item.title) +
          "</a></h3>",
        '<div class="movie-meta"><span>' +
          escapeHtml(item.year) +
          "</span><span>" +
          escapeHtml(item.region) +
          "</span><span>" +
          escapeHtml(item.type) +
          "</span></div>",
        "<p>" + escapeHtml(item.oneLine) + "</p>",
        '<div class="tag-row"><span>' +
          escapeHtml(item.category) +
          "</span></div>",
        "</div>",
        "</article>",
      ].join("");
    };

    if (input) {
      input.value = query;
    }

    if (!query) {
      if (title) {
        title.textContent = "热门搜索推荐";
      }
      results.innerHTML = items.slice(0, 40).map(renderCard).join("");
    } else {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matched = items.filter(function (item) {
        const text = String(item.text || "").toLowerCase();
        return terms.every(function (term) {
          return text.includes(term);
        });
      });
      if (title) {
        title.textContent = "“" + query + "” 的搜索结果";
      }
      results.innerHTML = matched.length
        ? matched.slice(0, 120).map(renderCard).join("")
        : '<div class="empty-result">没有找到相关影片，换一个关键词试试。</div>';
    }
  }
})();
