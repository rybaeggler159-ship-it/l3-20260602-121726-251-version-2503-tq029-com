(function() {
  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player-box]"));

  boxes.forEach(function(box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play-button]");
    var source = box.getAttribute("data-video-src");

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function start() {
      bindSource();
      if (button) {
        button.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function() {
      if (button) {
        button.classList.add("hidden");
      }
    });
  });
})();
