$(document).ready(function() {
    // CONFIGURATION
    const SINGLE_OPEN = true; 
    
    // Initialize accordion
    $('.faq_accordion').each(function(index) {
      const $accordion = $(this);
      const $button = $accordion.find('.faq_question');
      const $answer = $accordion.find('.faq_answer');
      const $icon = $accordion.find('.faq6_icon-wrapper svg');
      const accordionId = `accordion-${index}`;
      const panelId = `panel-${index}`;
      let isAnimating = false;
      
      // Set up ARIA attributes
      $button.attr({
        'role': 'button',
        'aria-expanded': 'false',
        'aria-controls': panelId,
        'id': accordionId,
        'tabindex': '0'
      });
      
      $answer.attr({
        'role': 'region',
        'aria-labelledby': accordionId,
        'id': panelId,
        'hidden': 'hidden'
      }).hide();
      
      // Add transition to icon
      $icon.css('transition', 'transform 0.3s ease');
      
      // Toggle function
      function toggleAccordion(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isAnimating) return;
        isAnimating = true;
        
        const isExpanded = $button.attr('aria-expanded') === 'true';
        
        // Close all other accordions (only if SINGLE_OPEN is true)
        if (SINGLE_OPEN && !isExpanded) {
          $('.faq_accordion').not($accordion).each(function() {
            const $otherAccordion = $(this);
            const $otherButton = $otherAccordion.find('.faq_question');
            const $otherAnswer = $otherAccordion.find('.faq_answer');
            const $otherIcon = $otherAccordion.find('.faq6_icon-wrapper svg');
            
            if ($otherButton.attr('aria-expanded') === 'true') {
              $otherButton.attr('aria-expanded', 'false');
              $otherAnswer.slideUp(300, function() {
                $otherAnswer.attr('hidden', 'hidden');
              });
              $otherIcon.css('transform', 'rotate(0deg)');
              $otherAccordion.removeClass('is-open');
            }
          });
        }
        
        // Toggle current accordion
        $button.attr('aria-expanded', !isExpanded);
        
        if (isExpanded) {
          // Close
          $answer.slideUp(300, function() {
            $answer.attr('hidden', 'hidden');
            isAnimating = false;
          });
          $icon.css('transform', 'rotate(0deg)');
        } else {
          // Open
          $answer.removeAttr('hidden').slideDown(300, function() {
            isAnimating = false;
          });
          $icon.css('transform', 'rotate(45deg)');
        }
        
        $accordion.toggleClass('is-open');
      }
      
      // Remove any existing handlers and add new ones
      $button.off('click keydown').on('click', toggleAccordion);
      
      // Keyboard handlers
      $button.on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleAccordion(e);
        }
      });
    });
  });
  