$(document).ready(function () {
    var $clear = $('[fs-cmsfilter-element="clear"]');
    var $wrapper = $('[data-element="categories-wrapper"]');
    var $checkboxes = $wrapper.find('input[type="checkbox"]');
    var $resultsCount = $('[fs-cmsfilter-element="results-count"]');
    
    $wrapper.prepend($clear);
    
   function getPlural(n) {
    if (n === 1) return 'odcinek';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'odcinki';
    return 'odcinków';
}

function updateResults() {
    var n = parseInt($resultsCount.text(), 10);

    $resultsCount.each(function() {
        var el = this;
        var node = el.nextSibling;
        while (node && (node.nodeType !== 3 || !/(odcinek)/.test(node.textContent))) {
            node = node.nextSibling;
        }
        if (node) {
            node.textContent = ' ' + getPlural(n);
        }
    });
}

    
    function updateResults() {
        var n = parseInt($resultsCount.text());
        $resultsCount.parent().contents().filter(function() {
            return this.nodeType === 3;
        }).last().replaceWith(' ' + getPlural(n));
    }
    
    function checkPagination() {
        $('.pagination_page-wrapper').each(function() {
            var $pageWrapper = $(this);
            if ($pageWrapper.children().length === 1) {
                $pageWrapper.closest('.pagination_wrapper').remove();
            }
        });
    }
    
    function calculateReadTime() {
        $('.blog_item').each(function() {
            var $item = $(this);
            var $origin = $item.find('[data-item="origin"]');
            var $timeCount = $item.find('[data-time="count"]');
            
            if ($origin.length && $timeCount.length) {
                var words = $origin.text().trim().split(/\s+/).length;
                var minutes = Math.max(1, Math.ceil(words / 200));
                $timeCount.text(minutes);
            }
        });
    }
    
    $checkboxes.on('change', function() {
        $clear.toggleClass('is-active', !$checkboxes.is(':checked'));
    });
    
    $clear.on('click', function(e) {
        e.preventDefault();
        $checkboxes.prop('checked', false);
        $clear.addClass('is-active');
        $wrapper.find('[fs-cmsfilter-active="is-active"]').removeClass('is-active');
    });
    
    updateResults();
    calculateReadTime();
    checkPagination();
    
    new MutationObserver(function() {
        updateResults();
        checkPagination();
    }).observe($resultsCount[0], {
        childList: true,
        characterData: true,
        subtree: true
    });
});
