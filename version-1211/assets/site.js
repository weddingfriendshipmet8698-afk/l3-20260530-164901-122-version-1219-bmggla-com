(function () {
  "use strict";

  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));

    if (!slides.length) {
      return;
    }

    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    const previousButton = slider.querySelector("[data-hero-prev]");
    const nextButton = slider.querySelector("[data-hero-next]");

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showSlide(activeIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(activeIndex + 1);
      });
    }

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);

    showSlide(0);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function initLocalFilter() {
    const filterInput = document.querySelector("[data-filter-input]");
    const cards = Array.from(document.querySelectorAll("[data-search-card]"));
    const counter = document.querySelector("[data-filter-count]");
    const empty = document.querySelector("[data-empty-state]");

    if (!filterInput || !cards.length) {
      return;
    }

    function applyFilter() {
      const keyword = normalizeText(filterInput.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalizeText(card.getAttribute("data-search"));
        const isVisible = !keyword || haystack.indexOf(keyword) !== -1;

        card.classList.toggle("hidden", !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visibleCount);
      }

      if (empty) {
        empty.style.display = visibleCount ? "none" : "block";
      }
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
  }

  function initSearchPage() {
    const page = document.querySelector("[data-search-page]");

    if (!page) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q") || "";
    const input = document.querySelector("[data-filter-input]");

    if (input) {
      input.value = keyword;
      input.dispatchEvent(new Event("input"));
    }
  }

  let hlsModulePromise = null;

  function loadHlsModule() {
    if (!hlsModulePromise) {
      hlsModulePromise = import("./hls-vendor-dru42stk.js").then(function (module) {
        return module.H;
      });
    }

    return hlsModulePromise;
  }

  function setPlayerStatus(container, message) {
    const status = container.querySelector("[data-player-status]");

    if (status) {
      status.textContent = message;
    }
  }

  async function startPlayback(container) {
    const video = container.querySelector("video[data-src]");
    const overlay = container.querySelector("[data-play-overlay]");

    if (!video) {
      return;
    }

    const sourceUrl = video.getAttribute("data-src");

    if (!sourceUrl) {
      setPlayerStatus(container, "当前影片暂未配置播放源。");
      return;
    }

    try {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        await video.play();
      } else {
        const Hls = await loadHlsModule();

        if (!Hls || !Hls.isSupported()) {
          setPlayerStatus(container, "当前浏览器不支持 HLS 播放，请换用支持 HLS 的浏览器。");
          return;
        }

        const hls = new Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setPlayerStatus(container, "播放源加载失败，请稍后重试。");
            hls.destroy();
          }
        });
      }

      video.setAttribute("controls", "controls");

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      setPlayerStatus(container, "正在播放，已启用 HLS 播放源。");
    } catch (error) {
      setPlayerStatus(container, "播放初始化失败，请检查网络或浏览器播放支持。");
    }
  }

  function initPlayers() {
    const players = Array.from(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      const overlay = player.querySelector("[data-play-overlay]");

      if (overlay) {
        overlay.addEventListener("click", function () {
          startPlayback(player);
        });
      }
    });
  }

  initHeroSlider();
  initLocalFilter();
  initSearchPage();
  initPlayers();
})();
