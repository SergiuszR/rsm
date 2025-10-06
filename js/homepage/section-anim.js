(function () {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    const header    = document.getElementById("transition-header");
    const boxTop    = document.getElementById("box-top");
    const fromEl    = document.getElementById("from-animate");
    const toEl      = document.getElementById("to-animate");
    const boxBottom = document.getElementById("box-bottom");

    if (!header || !boxTop || !fromEl || !toEl || !boxBottom) return;

    ScrollTrigger.getAll().forEach(t => t.kill());

    const toHTML = toEl.innerHTML;
    
    gsap.set(toEl, { display: "none" });
    gsap.set(boxBottom, { autoAlpha: 0, y: 20 });

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" }
    });

    tl.to({}, { duration: 0.65 })
      .to(fromEl, {
          duration: 0.4,
          scale: 0.95,
          autoAlpha: 0,
          filter: "blur(8px)",
          onComplete: () => {
              fromEl.innerHTML = toHTML;
          }
      })
      .to(fromEl, {
          duration: 0.4,
          scale: 1,
          autoAlpha: 1,
          filter: "blur(0px)"
      })
      .to(boxBottom, { duration: 0.6, autoAlpha: 1, y: 0, ease: "power2.out" }, "-=0.3");

    ScrollTrigger.create({
        trigger: header,
        start: "top 80%",
        once: true,
        onEnter: () => tl.play()
    });
})();
