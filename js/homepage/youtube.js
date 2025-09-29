$(document).ready(function() {
(function loadYT() {
    if (window.YT && YT.Player) return;
    var s = document.createElement('script');
    s.id = 'yt-iframe-api';
    s.src = 'https://www.youtube.com/iframe_api';
    (document.head || document.body || document.documentElement).appendChild(s);
})();

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
    $('.video_container[data-video-id]').each(function() {
        var $wrap = $(this);
        var id = $wrap.data('video-id');
        var $iframe = $wrap.find('iframe').first();
        var $poster = $wrap.find('.yt-poster').first();
        if (!id || !$iframe.length || !$poster.length) return;

        // Set poster background
        $poster.css('background-image', 'url("' + ytThumb(id) + '")');

        // Replace iframe with API target
        var $div = $('<div class="yt-api-player" />');
        $div.attr('title', $iframe.attr('title') || 'YouTube video');
        $iframe.replaceWith($div);

        // Prevent any interaction until ready
        $wrap.css('pointer-events', 'none');

        var player = new YT.Player($div[0], {
            videoId: id,
            playerVars: playerVars(),
            events: {
                onReady: function(e) {
                    var p = e.target;
                    try { p.mute(); } catch(e) {}
                    // Ensure paused with poster visible
                    forceIdle(p);
                    $wrap.css('pointer-events', '');
                    bindHover($wrap, p);
                },
                onStateChange: function(e) {
                    // Guard against unexpected auto-start before hover
                    if ((e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING) && !$wrap.is('.is-playing')) {
                        forceIdle(e.target);
                    }
                }
            }
        });
    });
}

window.onYouTubeIframeAPIReady = function() {
    initHoverPlayers();
};
});