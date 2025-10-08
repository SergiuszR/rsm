$(document).ready(function() {
// Lazy-load the YouTube Iframe API only on first interaction
var ytApiReady = false;
var ytApiLoading = false;
var ytApiReadyResolvers = [];

function loadYTApiOnce() {
    if (ytApiReady && window.YT && YT.Player) return Promise.resolve();
    if (ytApiLoading) return new Promise(function(resolve) { ytApiReadyResolvers.push(resolve); });
    ytApiLoading = true;

    // Ensure privacy-enhanced (no-cookie) host is used by the API
    window.YTConfig = { host: 'https://www.youtube-nocookie.com' };

    var s = document.createElement('script');
    s.id = 'yt-iframe-api';
    s.src = 'https://www.youtube.com/iframe_api';
    (document.head || document.body || document.documentElement).appendChild(s);

    return new Promise(function(resolve) { ytApiReadyResolvers.push(resolve); });
}

function playerVars() {
    return {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1
    };
}

function ytThumb(id) {
    // Try maxres; if not available YouTube serves a smaller image automatically
    return 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
}

function forceIdle(p) {
    try { p.pauseVideo(); } catch(e) {}
    try { p.seekTo(0, true); } catch(e) {}
}

function bindHover($wrap, p) {
    var hovering = false;

    $wrap.on('mouseenter', function() {
        hovering = true;
        $wrap.addClass('is-playing');
        try { p.mute(); } catch(e) {}
        p.playVideo();
    });

    $wrap.on('mouseleave', function() {
        hovering = false;
        forceIdle(p);
        $wrap.removeClass('is-playing');
    });

    // No autoplay on touch
    $wrap.on('touchstart', function() {
        forceIdle(p);
        $wrap.removeClass('is-playing');
    });
}

function initHoverPlayers() {
    $('.video_container[data-video-id], .video-container[data-video-id]').each(function() {
        var $wrap = $(this);
        var id = $wrap.data('video-id');
        var $iframe = $wrap.find('iframe').first();
        var $poster = $wrap.find('.yt-poster').first();
        
        // If no video ID, try to extract from iframe src
        if (!id && $iframe.length) {
            var src = $iframe.attr('src') || $iframe.attr('data-yt-src') || '';
            var match = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&\/]+)/);
            if (match && match[1]) {
                id = match[1];
                $wrap.attr('data-video-id', id);
            }
        }
        
        if (!id) return;

        // Create poster if it doesn't exist
        if (!$poster.length) {
            $poster = $('<div class="yt-poster" aria-hidden="true"></div>');
            $wrap.prepend($poster);
        }

        // Set poster background
        $poster.css('background-image', 'url("' + ytThumb(id) + '")');

        // Immediately neutralize any pre-rendered iframes to avoid instant loads/cookies
        if ($iframe.length) {
            var $div = $('<div class="yt-api-player" />');
            $div.attr('title', $iframe.attr('title') || 'YouTube video');
            $iframe.replaceWith($div);
        } else if (!$wrap.find('.yt-api-player').length) {
            $wrap.append($('<div class="yt-api-player" title="YouTube video" />'));
        }

        // Create player on first interaction only
        var inited = false;
        function ensurePlayer(trigger) {
            if (inited) return;
            inited = true;

            var $div = $wrap.find('.yt-api-player').first();
            $wrap.css('pointer-events', 'none');

            loadYTApiOnce().then(function() {
                // Resolve API ready via global callback
                if (window.YT && YT.Player) return;
            }).then(function() {
                return new Promise(function(resolve) {
                    if (window.YT && YT.Player) return resolve();
                    // Will be resolved by onYouTubeIframeAPIReady
                    ytApiReadyResolvers.push(resolve);
                });
            }).then(function() {
                var player = new YT.Player($div[0], {
                    host: 'https://www.youtube-nocookie.com',
                    videoId: id,
                    playerVars: playerVars(),
                    events: {
                        onReady: function(e) {
                            var p = e.target;
                            try { p.mute(); } catch(e) {}
                            forceIdle(p);
                            $wrap.css('pointer-events', '');
                            bindHover($wrap, p);
                            if (trigger === 'hover') {
                                $wrap.addClass('is-playing');
                                p.playVideo();
                            }
                        },
                        onStateChange: function(e) {
                            if ((e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING) && !$wrap.is('.is-playing')) {
                                forceIdle(e.target);
                            }
                        }
                    }
                });
            });
        }

        $wrap.on('mouseenter', function() { ensurePlayer('hover'); });
        $wrap.on('click touchstart', function() { ensurePlayer('click'); });
    });
}

window.onYouTubeIframeAPIReady = function() {
    ytApiReady = true;
    var pending = ytApiReadyResolvers.splice(0);
    for (var i = 0; i < pending.length; i++) pending[i]();
};

// Prepare placeholders immediately; players will be created on demand
initHoverPlayers();
});