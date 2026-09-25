/**
 * Provider-first wall, curated from Metroxe/bowmark at commit c951f59f8a009a684445f6eb7f9205976d35dcac.
 * Method names are exact; brand casing is for display (Amazon.searchProducts).
 * Only functions marked live in PROVIDERS.md and present in their manifest
 * are included. Counts include the headline function. This is a repository
 * snapshot, not a runtime health check. Source evidence: docs/provider-wall-sources.json.
 * Twenty provider groups per column form the alternating, auto-scrolling board.
 */
export interface Capability {
  id: string;
  name: string;
  icon: string;
  /** Other functions from this provider, excluding the headline. */
  providers: string[];
  /** Live functions in the source snapshot, including the headline. */
  count?: number;
}
export const CAPABILITY_COLUMNS: Capability[][] = [
  [
    {
      "id": "etsy",
      "name": "Etsy.search",
      "icon": "/images/providers/etsy.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "bestbuy",
      "name": "Best Buy.search",
      "icon": "/images/providers/bestbuy.png",
      "providers": [
        "Best Buy.getProduct"
      ],
      "count": 2
    },
    {
      "id": "ebay",
      "name": "eBay.search",
      "icon": "/images/providers/ebay.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "amazon",
      "name": "Amazon.searchProducts",
      "icon": "/images/providers/amazon.png",
      "providers": [
        "Amazon.getProduct",
        "Amazon.listBestSellers",
        "Amazon.listDeals",
        "Amazon.getDeliveryEstimate"
      ],
      "count": 14
    },
    {
      "id": "walmart",
      "name": "Walmart.search",
      "icon": "/images/providers/walmart.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "target",
      "name": "Target.search",
      "icon": "/images/providers/target.png",
      "providers": [
        "Target.findStore"
      ],
      "count": 2
    },
    {
      "id": "chipotle",
      "name": "Chipotle.getBowlBuilder",
      "icon": "/images/providers/chipotle.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "apple",
      "name": "Apple.search",
      "icon": "/images/providers/apple.png",
      "providers": [
        "Apple.getProduct",
        "Apple.compareModels",
        "Apple.getPickupAvailability",
        "Apple.getTradeInEstimate"
      ],
      "count": 25
    },
    {
      "id": "costco",
      "name": "Costco.search",
      "icon": "/images/providers/costco.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "lululemon",
      "name": "lululemon.search",
      "icon": "/images/providers/lululemon.png",
      "providers": [
        "lululemon.getProduct",
        "lululemon.getProducts",
        "lululemon.getSimilarProducts",
        "lululemon.getReviews"
      ],
      "count": 5
    },
    {
      "id": "abercrombie",
      "name": "Abercrombie & Fitch.search",
      "icon": "/images/providers/abercrombie.png",
      "providers": [
        "Abercrombie & Fitch.getProduct",
        "Abercrombie & Fitch.checkStock",
        "Abercrombie & Fitch.findStores"
      ],
      "count": 4
    },
    {
      "id": "jcrew",
      "name": "J.Crew.searchProducts",
      "icon": "/images/providers/jcrew.png",
      "providers": [
        "J.Crew.listCategories",
        "J.Crew.suggestSearchTerms"
      ],
      "count": 3
    },
    {
      "id": "newegg",
      "name": "Newegg.search",
      "icon": "/images/providers/newegg.jpg",
      "providers": [
        "Newegg.getProduct",
        "Newegg.checkStock"
      ],
      "count": 3
    },
    {
      "id": "dell",
      "name": "Dell.searchForumThreads",
      "icon": "/images/providers/dell.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "microcenter",
      "name": "Micro Center.search",
      "icon": "/images/providers/microcenter.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "bhphoto",
      "name": "B&H Photo.search",
      "icon": "/images/providers/bhphoto.png",
      "providers": [
        "B&H Photo.getProduct",
        "B&H Photo.checkStock"
      ],
      "count": 3
    },
    {
      "id": "samsclub",
      "name": "Sam's Club.search",
      "icon": "/images/providers/samsclub.png",
      "providers": [
        "Sam's Club.getProduct",
        "Sam's Club.checkStock",
        "Sam's Club.findClubs",
        "Sam's Club.browseCategory"
      ],
      "count": 8
    },
    {
      "id": "poshmark",
      "name": "Poshmark.getBulkUploadTemplateGuide",
      "icon": "/images/providers/poshmark.png",
      "providers": [
        "Poshmark.getZipFileGuide"
      ],
      "count": 2
    },
    {
      "id": "wholefoodsmarket",
      "name": "Whole Foods.search",
      "icon": "/images/providers/wholefoodsmarket.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "sears",
      "name": "Sears.search",
      "icon": "/images/providers/sears.png",
      "providers": [
        "Sears.getProduct"
      ],
      "count": 2
    }
  ],
  [
    {
      "id": "marriott",
      "name": "Marriott.findHotels",
      "icon": "/images/providers/marriott.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "kayak",
      "name": "KAYAK.search",
      "icon": "/images/providers/kayak.jpg",
      "providers": [
        "KAYAK.getBookingOptions",
        "KAYAK.searchHotels",
        "KAYAK.searchCars"
      ],
      "count": 4
    },
    {
      "id": "google_flights",
      "name": "Google Flights.search",
      "icon": "/images/providers/google_flights.png",
      "providers": [
        "Google Flights.getBookingOptions",
        "Google Flights.getPriceGraph"
      ],
      "count": 3
    },
    {
      "id": "google_maps",
      "name": "Google Maps.searchPlaces",
      "icon": "/images/providers/google_maps.png",
      "providers": [
        "Google Maps.getDirections",
        "Google Maps.getPlace",
        "Google Maps.listReviews",
        "Google Maps.searchNearby"
      ],
      "count": 11
    },
    {
      "id": "ihg",
      "name": "IHG.search",
      "icon": "/images/providers/ihg.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "avis",
      "name": "Avis.searchLocations",
      "icon": "/images/providers/avis.png",
      "providers": [
        "Avis.getLocation"
      ],
      "count": 2
    },
    {
      "id": "resy",
      "name": "Resy.search",
      "icon": "/images/providers/resy.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "yelp",
      "name": "Yelp.search",
      "icon": "/images/providers/yelp.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "doordash",
      "name": "DoorDash.search",
      "icon": "/images/providers/doordash.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "classpass",
      "name": "ClassPass.getStudio",
      "icon": "/images/providers/classpass.png",
      "providers": [
        "ClassPass.getSchedule"
      ],
      "count": 2
    },
    {
      "id": "disney",
      "name": "Disney World.getTicketPrice",
      "icon": "/images/providers/disney.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "sixflags",
      "name": "Six Flags.getTickets",
      "icon": "/images/providers/sixflags.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "flightradar24",
      "name": "Flightradar24.getAirportArrivals",
      "icon": "/images/providers/flightradar24.png",
      "providers": [
        "Flightradar24.getAirline"
      ],
      "count": 2
    },
    {
      "id": "aa",
      "name": "American Airlines.getFlightStatus",
      "icon": "/images/providers/aa.png",
      "providers": [
        "American Airlines.retrieveBooking",
        "American Airlines.getBaggageAllowance"
      ],
      "count": 3
    },
    {
      "id": "lufthansa",
      "name": "Lufthansa.getFlightStatus",
      "icon": "/images/providers/lufthansa.png",
      "providers": [
        "Lufthansa.getBaggageAllowance"
      ],
      "count": 2
    },
    {
      "id": "cars",
      "name": "Cars.com.search",
      "icon": "/images/providers/cars.jpg",
      "providers": [
        "Cars.com.getModelResearch"
      ],
      "count": 2
    },
    {
      "id": "cheapflights",
      "name": "Cheapflights.search",
      "icon": "/images/providers/cheapflights.png",
      "providers": [
        "Cheapflights.getBookingOptions",
        "Cheapflights.searchHotels",
        "Cheapflights.searchCars"
      ],
      "count": 4
    },
    {
      "id": "rover",
      "name": "Rover.searchBoarding",
      "icon": "/images/providers/rover.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "bcparkscamping",
      "name": "BC Parks.searchCampgrounds",
      "icon": "/images/providers/bcparkscamping.png",
      "providers": [
        "BC Parks.checkAvailability"
      ],
      "count": 2
    },
    {
      "id": "lonelyplanet",
      "name": "Lonely Planet.search",
      "icon": "/images/providers/lonelyplanet.png",
      "providers": [],
      "count": 1
    }
  ],
  [
    {
      "id": "youtube",
      "name": "YouTube.search",
      "icon": "/images/providers/youtube.png",
      "providers": [
        "YouTube.getTranscript",
        "YouTube.getVideo",
        "YouTube.getChannel",
        "YouTube.listComments"
      ],
      "count": 28
    },
    {
      "id": "github",
      "name": "GitHub.listCommits",
      "icon": "/images/providers/github.png",
      "providers": [
        "GitHub.listReleases",
        "GitHub.getProfileReadme"
      ],
      "count": 3
    },
    {
      "id": "reddit",
      "name": "Reddit.search",
      "icon": "/images/providers/reddit.png",
      "providers": [
        "Reddit.getPost",
        "Reddit.getSubredditPosts",
        "Reddit.getSubreddit",
        "Reddit.searchSubreddits"
      ],
      "count": 5
    },
    {
      "id": "linkedin",
      "name": "LinkedIn.searchJobs",
      "icon": "/images/providers/linkedin.png",
      "providers": [
        "LinkedIn.getProfile",
        "LinkedIn.getCompany",
        "LinkedIn.getJob"
      ],
      "count": 4
    },
    {
      "id": "airtable",
      "name": "Airtable.listRecords",
      "icon": "/images/providers/airtable.png",
      "providers": [
        "Airtable.getRecord",
        "Airtable.createRecord",
        "Airtable.updateRecord",
        "Airtable.listBases"
      ],
      "count": 6
    },
    {
      "id": "calendly",
      "name": "Calendly.getAvailability",
      "icon": "/images/providers/calendly.jpg",
      "providers": [
        "Calendly.getEventTypes",
        "Calendly.getBookingForm",
        "Calendly.findProfiles"
      ],
      "count": 4
    },
    {
      "id": "wikipedia",
      "name": "Wikipedia.search",
      "icon": "/images/providers/wikipedia.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "google_news",
      "name": "Google News.searchNews",
      "icon": "/images/providers/google_news.png",
      "providers": [
        "Google News.topStories",
        "Google News.listTopicHeadlines",
        "Google News.listPublisherHeadlines",
        "Google News.getFullCoverage"
      ],
      "count": 10
    },
    {
      "id": "google_translate",
      "name": "Google Translate.translate",
      "icon": "/images/providers/google_translate.png",
      "providers": [
        "Google Translate.detectLanguage",
        "Google Translate.lookupWord",
        "Google Translate.getDefinitions",
        "Google Translate.romanize"
      ],
      "count": 13
    },
    {
      "id": "bing",
      "name": "Bing.searchNews",
      "icon": "/images/providers/bing.png",
      "providers": [
        "Bing.searchWebBrowser"
      ],
      "count": 2
    },
    {
      "id": "cloudflare",
      "name": "Cloudflare.comparePlans",
      "icon": "/images/providers/cloudflare.png",
      "providers": [
        "Cloudflare.compareTeamsPlans"
      ],
      "count": 2
    },
    {
      "id": "azure",
      "name": "Microsoft Azure.getServicePricing",
      "icon": "/images/providers/azure.png",
      "providers": [
        "Microsoft Azure.listServices"
      ],
      "count": 2
    },
    {
      "id": "npmjs",
      "name": "npm.getDownloads",
      "icon": "/images/providers/npmjs.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "ycombinator",
      "name": "Y Combinator.getArticle",
      "icon": "/images/providers/ycombinator.png",
      "providers": [
        "Y Combinator.getBlogPost"
      ],
      "count": 2
    },
    {
      "id": "twitch",
      "name": "Twitch.getVideo",
      "icon": "/images/providers/twitch.png",
      "providers": [
        "Twitch.createHighlight"
      ],
      "count": 2
    },
    {
      "id": "soundcloud",
      "name": "SoundCloud.search",
      "icon": "/images/providers/soundcloud.jpg",
      "providers": [
        "SoundCloud.getTrack",
        "SoundCloud.getPlaylist"
      ],
      "count": 3
    },
    {
      "id": "yahoo_finance",
      "name": "Yahoo Finance.getQuote",
      "icon": "/images/providers/yahoo_finance.jpg",
      "providers": [
        "Yahoo Finance.searchSymbols",
        "Yahoo Finance.getHistoricalPrices",
        "Yahoo Finance.getTrendingTickers",
        "Yahoo Finance.getMarketSummary"
      ],
      "count": 5
    },
    {
      "id": "pinterest",
      "name": "Pinterest.searchPins",
      "icon": "/images/providers/pinterest.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "namecheap",
      "name": "Namecheap.getWhois",
      "icon": "/images/providers/namecheap.png",
      "providers": [],
      "count": 1
    },
    {
      "id": "paypal",
      "name": "PayPal.getFees",
      "icon": "/images/providers/paypal.png",
      "providers": [
        "PayPal.estimateFee",
        "PayPal.getCurrencyConversionQuote"
      ],
      "count": 3
    }
  ]
];

/** A cross-section of recognizable providers for the static disclosure list. */
export const STATIC_CAPABILITIES = [
  CAPABILITY_COLUMNS[0][3], CAPABILITY_COLUMNS[2][5], CAPABILITY_COLUMNS[1][3],
  CAPABILITY_COLUMNS[0][4], CAPABILITY_COLUMNS[2][0], CAPABILITY_COLUMNS[1][2],
  CAPABILITY_COLUMNS[0][7], CAPABILITY_COLUMNS[2][3], CAPABILITY_COLUMNS[2][4],
  CAPABILITY_COLUMNS[0][0], CAPABILITY_COLUMNS[2][1], CAPABILITY_COLUMNS[2][2],
];
