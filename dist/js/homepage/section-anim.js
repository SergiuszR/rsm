(function () {
    // Wait for GSAP and ScrollTrigger to be ready
    function initAnimation() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for section-anim');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);

        const header    = document.getElementById("transition-header");
        const boxTop    = document.getElementById("box-top");
        const fromEl    = document.getElementById("from-animate");
        const toEl      = document.getElementById("to-animate");
        const boxBottom = document.getElementById("box-bottom");
        const decorImages = document.querySelectorAll(".s-decor-image-wrapper");

        if (!header || !boxTop || !fromEl || !toEl || !boxBottom) return;

        // Clean up any existing ScrollTriggers for this section only
        ScrollTrigger.getAll().forEach(t => {
            if (t.trigger === header || t.vars.trigger === '#benefits') {
                t.kill();
            }
        });

    const fromText = fromEl.textContent;
    const toText = toEl.textContent;
    
    gsap.set(toEl, { display: "none" });
    gsap.set(boxBottom, { opacity: 0, y: 20 });
    gsap.set(decorImages, { opacity: 0, y: -30, clearProps: "transition" });

    // Add cursor element
    const cursor = document.createElement("span");
    cursor.style.cssText = "border-right: 2px solid currentColor; padding-right: 2px; animation: blink 0.7s infinite;";
    
    // Add blink animation if not exists
    if (!document.querySelector("#cursor-blink-style")) {
        const style = document.createElement("style");
        style.id = "cursor-blink-style";
        style.textContent = "@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }";
        document.head.appendChild(style);
    }

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" }
    });

    // Initial delay
    tl.to({}, { duration: 0.5 });

    // Phase 1: Erase the original text letter by letter
    for (let i = fromText.length; i >= 0; i--) {
        tl.call(() => {
            fromEl.textContent = fromText.substring(0, i);
            fromEl.appendChild(cursor);
        });
        tl.to({}, { duration: 0.03 });
    }

    // Small pause after erasing
    tl.to({}, { duration: 0.2 });

    // Phase 2: Type new text
    for (let i = 1; i <= toText.length; i++) {
        tl.call(() => {
            fromEl.textContent = toText.substring(0, i);
            fromEl.appendChild(cursor);
        });
        tl.to({}, { duration: 0.05 });
    }

    // Remove cursor and show rest of content
    tl.call(() => {
        fromEl.innerHTML = toEl.innerHTML;
    });

    // Animate bottom box and decor images
    tl.to(boxBottom, { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3")
      .to(decorImages, {
          duration: 0.5,
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "transition",
          onComplete: () => {
              decorImages.forEach((img, i) => {
                  gsap.to(img, {
                      y: -8,
                      duration: 2 + (i * 0.3),
                      ease: "sine.inOut",
                      repeat: -1,
                      yoyo: true,
                      delay: i * 0.2
                  });
              });
          }
      }, "-=0.2");

    ScrollTrigger.create({
        trigger: header,
        start: "top 80%",
        once: true,
        onEnter: () => tl.play()
    });

// Benefits animation

  const items = document.querySelectorAll(".layout_item");
  
  gsap.set(items, { opacity: 0, x: -100 });

  ScrollTrigger.create({
    trigger: "#benefits",
    start: "top 80%",
    onEnter: () => {
      gsap.to(items, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.4,
        ease: "power2.out"
      });
    },
    once: true
  });
    }
    
    // Initialize when GSAP is ready using AnimationManager with polling fallback
    (function waitForAnimationManager() {
        if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            window.AnimationManager.onReady(initAnimation);
        } else {
            // Retry for up to 5s
            let attempts = 0;
            const maxAttempts = 100; // 100 * 50ms = 5s
            const timer = setInterval(function() {
                attempts++;
                if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
                    clearInterval(timer);
                    window.AnimationManager.onReady(initAnimation);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    console.error('AnimationManager not loaded for section-anim');
                }
            }, 50);
        }
    })();
})();
