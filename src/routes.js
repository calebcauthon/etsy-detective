const Apify = require('apify');

const { utils: { log } } = Apify;

async function getLinks(page) {
    return await page.evaluate(() => {
        var listings = $('.v2-listing-card a[href*=listing]').map((index, el) => {
            return {
                text: $(el).find('h3').text().trim(),
                href: el.href
            };
        }).get()
        return Promise.resolve(listings);
    });
}

exports.handleStart = async ({ request, page, browserController }) => {
    const { browser } = browserController;
    var result = await getLinks(page);

    var pagesToOpen = [result[0]];
    for(var key in pagesToOpen) {
        var row = pagesToOpen[key];
        var url = row["href"];
        console.log(`opening page ${url}`);

        const listingPage = await browser.newPage();
        await listingPage.goto(url);
        await Apify.utils.puppeteer.injectJQuery(listingPage);
        await listingPage.waitForSelector('.cart-col a[href*="shop"]', { timeout: 10000 });

        var seller = await listingPage.evaluate(() => {
            var shopLinkElement = $('.cart-col a[href*="shop"]').first();
            var priceElement = $('div[data-buy-box-region="price"] p').first();

            var reviewsBadge = $('#same-listing-reviews-tab .wt-badge')

            return {
                name: shopLinkElement.text().trim(),
                href: shopLinkElement.attr('href'),
                price: priceElement.text().trim(),
                reviewsCount: reviewsBadge.text().trim()
            }
        });

        console.log("seller", seller)
    };

    console.log("done with handle start")
};

exports.handleList = async ({ request, page }) => {
    // Handle pagination
};

exports.handleDetail = async ({ request, page }) => {
    // Handle details
};
