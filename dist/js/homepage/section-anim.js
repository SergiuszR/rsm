(function () {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    const header    = document.getElementById("transition-header");
    const boxTop    = document.getElementById("box-top");
    const fromEl    = document.getElementById("from-animate");
    const toEl      = document.getElementById("to-animate");
    const boxBottom = document.getElementById("box-bottom");
    const decorImages = document.querySelectorAll(".s-decor-image-wrapper");

    if (!header || !boxTop || !fromEl || !toEl || !boxBottom) return;

    ScrollTrigger.getAll().forEach(t => t.kill());

    const toHTML = toEl.innerHTML;
    
    gsap.set(toEl, { display: "none" });
    gsap.set(boxBottom, { opacity: 0, y: 20 });
    gsap.set(decorImages, { opacity: 0, y: -30, clearProps: "transition" });

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" }
    });

    tl.to({}, { duration: 0.65 })
      .to(fromEl, {
          duration: 0.4,
          scale: 0.95,
          opacity: 0,
          filter: "blur(8px)",
          onComplete: () => {
              fromEl.innerHTML = toHTML;
          }
      })
      .to(fromEl, {
          duration: 0.4,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)"
      })
      .to(boxBottom, { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3")
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

    gsap.registerPlugin(ScrollTrigger);

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
})();
