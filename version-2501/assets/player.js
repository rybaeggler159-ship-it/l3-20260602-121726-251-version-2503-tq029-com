(() => {
    const wrap = document.querySelector('[data-stream]');
    const video = document.getElementById('movie-player');
    const button = document.querySelector('.player-start');

    if (!wrap || !video || !button) {
        return;
    }

    const stream = wrap.getAttribute('data-stream');
    let hlsInstance = null;
    let ready = false;

    const attachStream = () => {
        if (ready || !stream) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else {
            video.src = stream;
        }

        ready = true;
    };

    const playVideo = () => {
        attachStream();
        wrap.classList.add('is-playing');
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {});
        }
    };

    button.addEventListener('click', playVideo);
    video.addEventListener('click', () => {
        if (!ready) {
            playVideo();
        }
    });

    window.addEventListener('pagehide', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();
