import { H as Hls } from './hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        setupPlayer(player);
    });
});

function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var hlsInstance = null;

    if (!video || !button) {
        return;
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function loadSource() {
        var source = video.dataset.videoSrc;

        if (!source) {
            setStatus('未找到视频源');
            return Promise.reject(new Error('Missing video source'));
        }

        if (video.dataset.ready === 'true') {
            return Promise.resolve();
        }

        setStatus('正在加载视频源...');
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            setStatus('原生 HLS 播放');
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            video.dataset.ready = 'true';

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('HLS 已就绪');
            });

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放遇到错误，正在尝试恢复');

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                }
            });

            return Promise.resolve();
        }

        setStatus('当前浏览器不支持 M3U8 播放');
        return Promise.reject(new Error('HLS is not supported'));
    }

    function play() {
        loadSource()
            .then(function () {
                button.classList.add('is-hidden');
                return video.play();
            })
            .then(function () {
                setStatus('正在播放');
            })
            .catch(function () {
                button.classList.remove('is-hidden');
                setStatus('请再次点击播放或检查浏览器权限');
            });
    }

    button.addEventListener('click', play);

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            setStatus('已暂停');
        }
    });

    video.addEventListener('ended', function () {
        setStatus('播放结束');
        button.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
