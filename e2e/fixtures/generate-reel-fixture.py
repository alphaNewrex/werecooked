from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = """
<!doctype html>
<html>
<head>
<style>
* { box-sizing: border-box; }
body { margin: 0; width: 390px; height: 844px; background: #203128; color: #fff; font-family: Arial, sans-serif; }
.reel { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 32px 24px; background: linear-gradient(155deg, #d17b4a 0%, #523d36 55%, #1f2f27 100%); }
.badge { align-self: flex-start; padding: 7px 12px; border-radius: 18px; background: #f1c36d; color: #203128; font-weight: 700; font-size: 14px; }
h1 { margin: 14px 0 10px; font-size: 28px; }
p { margin: 0; line-height: 1.5; font-size: 17px; }
.handle { margin-top: 18px; color: #f5dfbb; font-size: 14px; }
</style>
</head>
<body>
  <main class="reel">
    <div class="badge">DINNER IDEA</div>
    <h1>Creamy garlic tuscan chicken 🍗</h1>
    <p>chicken breast, garlic, spinach, sun-dried tomatoes, heavy cream, parmesan</p>
    <div class="handle">@cookfood_daily · save this one</div>
  </main>
</body>
</html>
"""

output = Path(__file__).with_name('reel-screenshot.png')
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    page.set_content(HTML)
    page.screenshot(path=str(output))
    browser.close()
print(output)
