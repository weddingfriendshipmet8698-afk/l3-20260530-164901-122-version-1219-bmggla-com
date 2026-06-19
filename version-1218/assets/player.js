function initMoviePlayer(source) {
  var video = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-play-trigger]');
  var hls = null;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function startVideo() {
    loadVideo();

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', loadVideo);

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
