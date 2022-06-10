const Apify = require('apify');

const { utils: { log } } = Apify;

async function getListingLinks(page) {
    await page.evaluate(() => {
        function superTrim(text) {
            text = text.replaceAll('\n', '').trim();
            return text;
        }
        
        var listings = $('.v2-listing-card a[href*=listing]').map((index, el) => {
            return {
                text: superTrim($(el).find('h3').text()),
                href: el.href
            };
        }).get()
        return Promise.resolve(listings);
    });
}

exports.handleStart = async ({ request, page }) => {
    var result = await getListingLinks(page); 
    console.log("Listing links", result);
    console.log("done with handle start", result)
};

exports.handleList = async ({ request, page }) => {
    // Handle pagination
};

exports.handleDetail = async ({ request, page }) => {
    // Handle details
};
