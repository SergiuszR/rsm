$(document).ready(function() {
    const monthMap = {
        'january': 'stycznia', 'jan': 'stycznia',
        'february': 'lutego', 'feb': 'lutego',
        'march': 'marca', 'mar': 'marca',
        'april': 'kwietnia', 'apr': 'kwietnia',
        'may': 'maja',
        'june': 'czerwca', 'jun': 'czerwca',
        'july': 'lipca', 'jul': 'lipca',
        'august': 'sierpnia', 'aug': 'sierpnia',
        'september': 'września', 'sep': 'września', 'sept': 'września',
        'october': 'października', 'oct': 'października',
        'november': 'listopada', 'nov': 'listopada',
        'december': 'grudnia', 'dec': 'grudnia'
    };

    $('[data-date]').each(function() {
        const text = $(this).text().trim().toLowerCase();
        let hasMonth = false;
        let translatedText = text;

        for (const [eng, pol] of Object.entries(monthMap)) {
            if (text.includes(eng)) {
                translatedText = translatedText.replace(new RegExp(eng, 'gi'), pol);
                hasMonth = true;
            }
        }

        if (hasMonth) {
            $(this).text(translatedText);
        }
    });
});
