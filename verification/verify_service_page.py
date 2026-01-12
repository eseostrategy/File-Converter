
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        page.goto(f'file://{cwd}/services.html')

        # Click on the first 'Learn more' link which should lead to Monthly SEO Package
        # Note: In services.html, the first link is for Monthly SEO Package
        page.click('a[href="service-monthly-seo.html"]')

        # Wait for the new page to load (verify h1)
        page.wait_for_selector('h1')

        # Verify content specific to Monthly SEO Package
        header = page.inner_text('h1')
        if 'Monthly SEO Package' not in header:
            print(f'Error: Expected header to contain "Monthly SEO Package", found "{header}"')

        # Screenshot the service page
        page.screenshot(path='verification/monthly_seo_service.png', full_page=True)

        browser.close()

if __name__ == '__main__':
    run()
