$(document).ready(function() {
    // CONFIGURATION
    const VIMEO_ACCESS_TOKEN = 'd04f4fb2a88343a3c951d1958bdaf8ec'; 
    
    // Prevent multiple initializations
    if (window._rsmVimeoInitialized) {
        console.warn('[Vimeo] Script already initialized, skipping duplicate execution');
        return;
    }
    window._rsmVimeoInitialized = true;
    console.log('[Vimeo] Initializing Vimeo video loader');
    
    // Track pending requests to prevent duplicate API calls for the same video ID
    const pendingRequests = new Map(); // videoId -> { callbacks: [], inProgress: boolean }
    
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
     * Deduplicates concurrent requests for the same video ID
     * @param {string} videoId - The Vimeo video ID
     * @param {string} quality - The desired quality ('low', 'medium', 'high')
     * @param {function} successCallback - Callback function that receives the video URL
     * @param {function} errorCallback - Optional error callback
     */
    function fetchVimeoVideo(videoId, quality, successCallback, errorCallback) {
        // Check if there's already a pending request for this video ID
        if (pendingRequests.has(videoId)) {
            const request = pendingRequests.get(videoId);
            // If request is in progress, queue this callback
            if (request.inProgress) {
                request.callbacks.push({ successCallback, errorCallback, quality });
                return;
            }
        }
        
        // Mark this request as in progress
        pendingRequests.set(videoId, {
            inProgress: true,
            callbacks: [{ successCallback, errorCallback, quality }]
        });
        
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
                    const request = pendingRequests.get(videoId);
                    if (request) {
                        request.callbacks.forEach(cb => {
                            if (cb.errorCallback) cb.errorCallback('No MP4 files found');
                        });
                        pendingRequests.delete(videoId);
                    }
                    return;
                }
                
                // Process all queued callbacks
                const request = pendingRequests.get(videoId);
                if (request) {
                    request.callbacks.forEach(cb => {
                        // Select quality for this specific callback
                        const sortedFiles = mp4Files.sort((a, b) => b.height - a.height);
                        let mp4File;
                        if (cb.quality === 'low') {
                            mp4File = sortedFiles[sortedFiles.length - 1];
                        } else if (cb.quality === 'medium') {
                            mp4File = sortedFiles[Math.floor(sortedFiles.length / 2)];
                        } else {
                            mp4File = sortedFiles[0];
                        }
                        
                        cb.successCallback(mp4File.link);
                    });
                    pendingRequests.delete(videoId);
                }
            },
            error: function(error) {
                const request = pendingRequests.get(videoId);
                if (request) {
                    request.callbacks.forEach(cb => {
                        if (cb.errorCallback) cb.errorCallback(error);
                    });
                    pendingRequests.delete(videoId);
                }
            }
        });
    }
    
    // ============================================
    // REELS SECTION VIDEO INITIALIZATION
    // ============================================
    
    // Find all video elements in reels section with non-empty video IDs
    // Skip elements that already have videos initialized
    // This works with multiple [data-section="reels"] containers on the same page
    const $videoElements = $('[data-section="reels"] [data-video-id]').filter(function() {
        const $el = $(this);
        const videoId = $el.attr('data-video-id');
        // Skip if already initialized or if no video ID
        if (!videoId || videoId.trim() === '' || $el.attr('data-vimeo-initialized') === 'true') {
            return false;
        }
        // Skip if already contains a video element
        if ($el.find('video').length > 0) {
            return false;
        }
        return true;
    });
    
    // Debug: Log how many elements we found
    if ($videoElements.length > 0) {
        console.log(`[Vimeo] Found ${$videoElements.length} video element(s) in reels section(s)`);
    }
    
    // Process each video
    $videoElements.each(function() {
        const $element = $(this);
        const videoId = $element.attr('data-video-id');
        const quality = $element.attr('data-video-quality') || 'high';
        
        // Mark as initialized immediately to prevent duplicate processing
        $element.attr('data-vimeo-initialized', 'true');
        
        // Fetch video from Vimeo API
        fetchVimeoVideo(videoId, quality, function(videoUrl) {
            // Double-check element hasn't been modified
            if ($element.find('video').length > 0) {
                return; // Already has video, skip
            }
            
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
        // Skip elements that already have videos initialized
        const $serviceElements = $('[data-service]').filter(function() {
            const $el = $(this);
            const videoId = $el.attr('data-service');
            // Skip if already initialized or if no video ID
            if (!videoId || videoId.trim() === '' || $el.attr('data-vimeo-initialized') === 'true') {
                return false;
            }
            // Skip if already contains a video element
            if ($el.find('video').length > 0) {
                return false;
            }
            return true;
        });
        
        // Process each service card
        $serviceElements.each(function() {
            const $element = $(this);
            const videoId = $element.attr('data-service');
            const quality = $element.attr('data-video-quality') || 'high';
            
            // Mark as initialized immediately to prevent duplicate processing
            $element.attr('data-vimeo-initialized', 'true');
            
            // Fetch video from Vimeo API
            fetchVimeoVideo(videoId, quality, function(videoUrl) {
                // Double-check element hasn't been modified
                if ($element.find('video').length > 0) {
                    return; // Already has video, skip
                }
                
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
