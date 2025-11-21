$(document).ready(function() {
    // Open modal
    $('[data-trigger="contact"]').on('click', function(e) {
        e.preventDefault();
        $('[data-element="contact-modal"]').addClass('show');
    });
    
    // Close modal
    $('[data-element="close-modal"]').on('click', function(e) {
        e.preventDefault();
        $('[data-element="contact-modal"]').removeClass('show');
    });
    
    // Close modal on ESC key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('[data-element="contact-modal"]').removeClass('show');
        }
    });
    
    // Close modal when clicking on overlay
    $('.contact_overlay').on('click', function(e) {
        if (e.target === this) {
            $('[data-element="contact-modal"]').removeClass('show');
        }
    });
});