# E2E fixtures

- `pantry-photo.jpg` is a resized (under 1024px) CC0 photo of grocery-store poblano peppers from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Stacked_Poblano_Peppers_-_Flickr_-_joncutrer.jpg). The original author is Jonathan Cutrer and the Commons page records the Creative Commons CC0 1.0 Universal Public Domain Dedication.
- `pantry-groceries.jpg` is a resized public-domain USDA Agricultural Research Service photo (Keith Weller, image K3839-3) of many fruits, vegetables, grains, and nuts from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Foods_(cropped).jpg). `e2e/api.spec.ts` uses it to check that a scan detects several distinct items.
- `reel-screenshot.png` is generated locally by `generate-reel-fixture.py` with Playwright. It is an original mock vertical reel whose caption overlay lists creamy garlic Tuscan chicken and its ingredients.
