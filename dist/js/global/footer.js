$(document).ready(function () {
	const footerWrapper = $('.footer_text-wrapper');
	const footerTexts = $('.footer-text-name');
	
	if (footerWrapper.length === 0 || footerTexts.length === 0) return;

	footerTexts.each(function () {
		$(this).clone().appendTo(footerWrapper);
	});

	const allTexts = $('.footer-text-name');
	const textWidth = allTexts.first().outerWidth(true);

	const tl = gsap.timeline({ repeat: -1 });
	tl.to(allTexts, {
		x: -textWidth,
		duration: 40,
		ease: 'none',
		onComplete: function () {
			gsap.set(allTexts, { x: 0 });
		},
	});

	footerWrapper.hover(
		function () {
			gsap.to(tl, {
				timeScale: -0.5,
				duration: 0.5,
				ease: 'power1.inOut',
			});
		},
		function () {
			gsap.to(tl, {
				timeScale: 1,
				duration: 0.5,
				ease: 'power1.inOut',
			});
		}
	);
});