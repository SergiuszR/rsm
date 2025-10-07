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
  
    // Create all video elements and wait for them to be ready
    const videoPromises = [];
    const videos = [];
  
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
      video.preload = 'auto';
      
      // Create source element
      const source = document.createElement('source');
      source.src = videoUrl;
      source.type = 'video/mp4';
      
      video.appendChild(source);
      videos.push({ video, target });
      
      // Create promise for video ready state
      const promise = new Promise((resolve) => {
        video.addEventListener('canplaythrough', resolve, { once: true });
        video.load();
      });
      
      videoPromises.push(promise);
    });
  
    // Wait for all videos to be ready, then insert them
    Promise.all(videoPromises).then(() => {
      videos.forEach(({ video, target }) => {
        target.innerHTML = '';
        target.appendChild(video);
      });
    });
  });
  