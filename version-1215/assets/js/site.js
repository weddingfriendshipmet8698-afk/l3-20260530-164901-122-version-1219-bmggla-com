(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-toolbar]"));
        toolbars.forEach(function (toolbar) {
            var input = toolbar.querySelector("[data-filter-input]");
            var sortSelect = toolbar.querySelector("[data-sort-select]");
            var count = toolbar.querySelector("[data-filter-count]");
            var list = document.querySelector("[data-filter-list]");
            if (!input || !list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var matched = !query || text.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "显示 " + visible + " / " + cards.length + " 部";
                }
            }

            function sortCards() {
                if (!sortSelect) {
                    return;
                }
                var mode = sortSelect.value;
                var sorted = cards.slice().sort(function (a, b) {
                    var yearA = parseInt(a.getAttribute("data-year"), 10) || 0;
                    var yearB = parseInt(b.getAttribute("data-year"), 10) || 0;
                    var scoreA = parseFloat(a.getAttribute("data-score")) || 0;
                    var scoreB = parseFloat(b.getAttribute("data-score")) || 0;
                    var titleA = normalize(a.querySelector("h3") ? a.querySelector("h3").textContent : "");
                    var titleB = normalize(b.querySelector("h3") ? b.querySelector("h3").textContent : "");
                    if (mode === "year-asc") {
                        return yearA - yearB;
                    }
                    if (mode === "score-desc") {
                        return scoreB - scoreA;
                    }
                    if (mode === "title-asc") {
                        return titleA.localeCompare(titleB, "zh-Hans-CN");
                    }
                    return yearB - yearA;
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            input.addEventListener("input", apply);
            if (sortSelect) {
                sortSelect.addEventListener("change", function () {
                    sortCards();
                    apply();
                });
            }
            sortCards();
            apply();
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player-shell]"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video[data-video-src]");
            var button = shell.querySelector("[data-play-button]");
            var status = shell.querySelector("[data-video-status]");
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute("data-video-src");
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                if (video.getAttribute("data-ready") === "true") {
                    video.play().catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放器。")
                    });
                    return;
                }
                shell.classList.add("playing");
                setStatus("正在加载播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute("data-ready", "true");
                        video.play().catch(function () {
                            setStatus("播放已就绪，请再次点击播放器。")
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        setStatus("播放源加载异常，可刷新页面后重试。")
                    });
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        video.setAttribute("data-ready", "true");
                        video.play().catch(function () {
                            setStatus("播放已就绪，请再次点击播放器。")
                        });
                    }, { once: true });
                    return;
                }

                video.src = source;
                video.setAttribute("data-ready", "true");
                video.play().catch(function () {
                    shell.classList.remove("playing");
                    setStatus("当前浏览器不支持此播放源。")
                });
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                shell.classList.add("playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
