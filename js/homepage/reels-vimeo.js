$(document).ready(function() {
    // CONFIGURATION
    const VIMEO_ACCESS_TOKEN = 'd04f4fb2a88343a3c951d1958bdaf8ec'; 
    
    // Find all video elements in reels section with non-empty video IDs
    const $videoElements = $('[data-section="reels"] [data-video-id]').filter(function() {
        const videoId = $(this).attr('data-video-id');
        return videoId && videoId.trim() !== '';
    });
    
    // Process each video
    $videoElements.each(function() {
        const $element = $(this);
        const videoId = $element.attr('data-video-id');
        const quality = $element.attr('data-video-quality') || 'high';
        
        // Fetch video from Vimeo API
        $.ajax({
            url: `https://api.vimeo.com/videos/${videoId}`,
            headers: {
                'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`
            },
            method: 'GET',
            success: function(data) {
                // Get MP4 files
                const mp4Files = data.files.filter(f => f.type === 'video/mp4');
                if (mp4Files.length === 0) return;
                
                // Select quality
                const sortedFiles = mp4Files.sort((a, b) => b.height - a.height);
                let mp4File;
                if (quality === 'low') {
                    mp4File = sortedFiles[sortedFiles.length - 1];
                } else if (quality === 'medium') {
                    mp4File = sortedFiles[Math.floor(sortedFiles.length / 2)];
                } else {
                    mp4File = sortedFiles[0];
                }
                
                // Clear element and create video
                $element.empty();
                
                // Create video element with native attributes
                const video = document.createElement('video');
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.autoplay = true;
                video.preload = 'auto';
                video.volume = 0;
                video.style.display = 'block';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                
                // Disable right-click context menu
                video.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    return false;
                });
                
                // Create source
                const source = document.createElement('source');
                source.src = mp4File.link;
                source.type = 'video/mp4';
                
                video.appendChild(source);
                $element[0].appendChild(video);
                
                // Multiple play attempts
                const attemptPlay = function() {
                    video.play().catch(function(error) {
                        setTimeout(attemptPlay, 100);
                    });
                };
                
                // Try to play on multiple events
                video.addEventListener('loadedmetadata', attemptPlay);
                video.addEventListener('loadeddata', attemptPlay);
                video.addEventListener('canplay', attemptPlay);
                video.addEventListener('canplaythrough', attemptPlay);
                
                // Also try after a delay
                setTimeout(attemptPlay, 500);
            }
        });
    });
});
