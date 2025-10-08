$(document).ready(function() {
    // 15 video URLs
    const videoUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
  
    // Find all elements with data-video-r attribute
    const targets = document.querySelectorAll('[data-video-r]');
    if (targets.length === 0) return;
  
    let videosLoaded = 0;
    const totalVideos = targets.length;
  
    // Load videos progressively - insert each as soon as it's ready
    targets.forEach((target, index) => {
      const videoUrl = videoUrls[index % videoUrls.length];
      
      // Create video element
      const video = document.createElement('video');
      video.setAttribute('data-injected', '');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = false;
      video.autoplay = true;
      video.preload = 'metadata'; // Changed from 'auto' to load faster
      
      // Create source element
      const source = document.createElement('source');
      source.src = videoUrl;
      source.type = 'video/mp4';
      
      video.appendChild(source);
      
      // Insert immediately with a placeholder state
      target.innerHTML = '';
      target.appendChild(video);
      
      // Start loading in background
      const loadVideo = () => {
        video.load();
        
        // Try to play when enough data is available
        const tryPlay = () => {
          video.play().catch(() => {
            // Silently handle autoplay restrictions
          });
        };
        
        video.addEventListener('loadeddata', tryPlay, { once: true });
        video.addEventListener('canplay', () => {
          videosLoaded++;
          
          // Refresh ScrollTrigger when all videos are loaded (non-blocking)
          if (videosLoaded === totalVideos && window.ScrollTrigger) {
            requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });
          }
        }, { once: true });
      };
      
      // Use Intersection Observer to load videos only when near viewport
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadVideo();
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '200px' // Start loading 200px before video enters viewport
        });
        
        observer.observe(target);
      } else {
        // Fallback for browsers without IntersectionObserver
        loadVideo();
      }
    });
  });
  