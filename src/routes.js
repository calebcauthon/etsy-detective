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

        var hasReviews = true;

        var listing = {
            title: "",
            name: "",
            href: "",
            price: "",
            reviewsCount: 0,
            reviewsBySegment: [
                { when: ["June", "2022"], count: 0 },
                { when: ["May", "2022"], count: 0 },
                { when: ["April", "2022"], count: 0 },
                { when: ["March", "2022"], count: 0 },
                { when: ["Feb", "2022"], count: 0 },
                { when: ["Jan", "2022"], count: 0 },
                { when: ["Dec", "2021"], count: 0 }
            ]
        };
        while(hasReviews) {
            var thisListing = await listingPage.evaluate(() => {
                var hasMoreReviews = false;
                var productName = $('*[data-buy-box-listing-title]').text().trim();
                var shopLinkElement = $('.cart-col a[href*="shop"]').first();
                var priceElement = $('div[data-buy-box-region="price"] p').first();

                var reviewsBadge = $('#same-listing-reviews-tab .wt-badge')
                var reviewCount = 0;
                var reviewsBySegment = [
                    { when: ["June", "2022"], count: 0 },
                    { when: ["May", "2022"], count: 0 },
                    { when: ["April", "2022"], count: 0 },
                    { when: ["March", "2022"], count: 0 },
                    { when: ["Feb", "2022"], count: 0 },
                    { when: ["Jan", "2022"], count: 0 },
                    { when: ["Dec", "2021"], count: 0 }
                ];

                var reviewElements = $('*[data-review-region]');
                reviewElements.each((index, element) => {
                    var $element = $(element);
                    if ($element.text().indexOf(productName) > -1) {
                        reviewsBySegment.forEach(segment => {
                            if ($element.text().indexOf(segment.when[0]) > -1 &&
                                $element.text().indexOf(segment.when[1]) > -1
                            ) {
                                segment.count++;
                            }
                        });
                    }
                });

                var nextPageElement = $('*[data-reviews-pagination] .wt-action-group__item-container a').last();
                if (nextPageElement.attr('aria-disabled') != "true") {
                    hasMoreReviews = true;    
                }

                return {
                    hasMoreReviews,
                    title: productName,
                    name: shopLinkElement.text().trim(),
                    shop: shopLinkElement.attr('href'),
                    price: priceElement.text().trim(),
                    reviewsCount: reviewCount,
                    reviewsBySegment: reviewsBySegment
                }
            });

            hasReviews = listing.hasMoreReviews;

            if(hasReviews) {
                await listingPage.click('*[data-reviews-pagination] .wt-action-group__item-container a');
                await listingPage.waitFor(3000);
            }

            thisListing.reviewsBySegment.forEach(segment => {
                var alreadyCountedSegment = listing.reviewsBySegment.find(thisSegment => {
                    return thisSegment.when[0] == segment.when[0] && thisSegment.when[1] == segment.when[1];
                });

                segment.count += alreadyCountedSegment.count;
            })

            listing = thisListing;

        }
        listing.product = url;
        console.log("listing", listing)
    };

    console.log("done with handle start")
};

exports.handleList = async ({ request, page }) => {
    // Handle pagination
};

exports.handleDetail = async ({ request, page }) => {
    // Handle details
};
