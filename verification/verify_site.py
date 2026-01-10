
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Open the index.html file
        # Since it's a static file, we can use file:// protocol with absolute path
        cwd = os.getcwd()
        page.goto(f'file://{cwd}/index.html')

        # Wait for content to load
        page.wait_for_selector('h1')

        # Take a screenshot of the hero section
        page.screenshot(path='verification/home_page.png', full_page=True)

        # Navigate to services page
        page.click('a[href="services.html"]')
        page.wait_for_selector('h1')
        page.screenshot(path='verification/services_page.png', full_page=True)

        browser.close()

if __name__ == '__main__':
    run()
