(function () {
  function setupPlayer(player) {
    var video = player.querySelector('[data-video]');
    var button = player.querySelector('[data-play]');
    if (!video || !button) {
      return;
    }

    var url = video.getAttribute('data-url');
    var started = false;
    var hls = null;

    function safePlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!url) {
        return;
      }

      if (started) {
        safePlay();
        return;
      }

      started = true;
      player.classList.add('is-started');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        safePlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          safePlay();
        });
        return;
      }

      video.src = url;
      safePlay();
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
