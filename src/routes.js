const Apify = require('apify');

const { utils: { log } } = Apify;

async function getListingLinksFromSearchResults(page) {
    var result = await page.evaluate(() => {
        function superTrim(text) {
            text = text.replaceAll('\n', '').trim();
            return text;
        }
        
        var linkSelector = 'a[href*=listing]';
        var listingLinks = $(linkSelector).map((index, el) => {
            const listingLink = el.href;

//
//            return {
//                text: superTrim($(el).find('h3').text()),
//                listing_href: el.href,
//                seller:
//            };
            return listingLink;
        }).get()
        return Promise.resolve(listingLinks);
    });
}


exports.handleStart = async ({ request, page }) => {
    var links = await getListingLinksFromSearchResults(page);    
    console.log("listings found: ", links)

    const link = links[0];
    console.log("opening page: ${link}");
    const listingPage = await browser.newPage();
    await listingPage.goto(link);

    var sellerName = await listingPage.evaluate(() => {
        const sellerName = "test"
        return sellerName;
    });

    console.log(`seller name is ${sellerName}`);

    console.log("done with handle start", result)
};

exports.handleList = async ({ request, page }) => {
    // Handle pagination
};

exports.handleDetail = async ({ request, page }) => {
    // Handle details
};
