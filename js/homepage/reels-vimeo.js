$(document).ready(function() {
    // CONFIGURATION
    const VIMEO_ACCESS_TOKEN = 'd04f4fb2a88343a3c951d1958bdaf8ec'; 

    
    // ============================================
    // SHARED FUNCTIONS
    // ============================================
    
    /**
     * Creates a video element with all necessary attributes and styles
     * @param {string} videoUrl - The URL of the video source
     * @returns {HTMLVideoElement} - The configured video element
     */
    function createVideoElement(videoUrl) {
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
        source.src = videoUrl;
        source.type = 'video/mp4';
        
        video.appendChild(source);
        
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
        
        return video;
    }
    
    /**
     * Fetches video data from Vimeo API and returns the appropriate quality URL
     * @param {string} videoId - The Vimeo video ID
     * @param {string} quality - The desired quality ('low', 'medium', 'high')
     * @param {function} successCallback - Callback function that receives the video URL
     * @param {function} errorCallback - Optional error callback
     */
    function fetchVimeoVideo(videoId, quality, successCallback, errorCallback) {
        $.ajax({
            url: `https://api.vimeo.com/videos/${videoId}`,
            headers: {
                'Authorization': `Bearer ${VIMEO_ACCESS_TOKEN}`
            },
            method: 'GET',
            success: function(data) {
                // Get MP4 files
                const mp4Files = data.files.filter(f => f.type === 'video/mp4');
                if (mp4Files.length === 0) {
                    if (errorCallback) errorCallback('No MP4 files found');
                    return;
                }
                
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
                
                successCallback(mp4File.link);
            },
            error: function(error) {
                if (errorCallback) errorCallback(error);
            }
        });
    }
    
    // ============================================
    // REELS SECTION VIDEO INITIALIZATION
    // ============================================
    
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
        fetchVimeoVideo(videoId, quality, function(videoUrl) {
            // Clear element and create video
            $element.empty();
            const video = createVideoElement(videoUrl);
            $element[0].appendChild(video);
        });
    });
    
    // ============================================
    // SERVICE CARDS VIDEO INITIALIZATION
    // ============================================
    
    /**
     * Initializes video backgrounds for service cards
     * Each [data-service] element should have a value that is the Vimeo video ID
     */
    function initializeServiceVideos() {
        // Find all service elements with non-empty video IDs
        const $serviceElements = $('[data-service]').filter(function() {
            const videoId = $(this).attr('data-service');
            return videoId && videoId.trim() !== '';
        });
        
        // Process each service card
        $serviceElements.each(function() {
            const $element = $(this);
            const videoId = $element.attr('data-service');
            const quality = $element.attr('data-video-quality') || 'high';
            
            // Fetch video from Vimeo API
            fetchVimeoVideo(videoId, quality, function(videoUrl) {
                // Remove placeholder images
                $element.find('img').remove();
                
                // Clear element and create video
                $element.empty();
                const video = createVideoElement(videoUrl);
                $element[0].appendChild(video);
            });
        });
    }
    
    // Initialize service videos
    initializeServiceVideos();
});
