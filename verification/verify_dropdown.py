from playwright.sync_api import sync_playwright

def verify_dropdown():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test Desktop View
        print("Testing Desktop View...")
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:8000/index.html")

        # Check if dropdown menu exists
        dropdown_menu = page.locator(".dropdown-menu")
        if dropdown_menu.count() > 0:
            print("Dropdown menu found in DOM.")
        else:
            print("Dropdown menu NOT found in DOM.")
            browser.close()
            return

        # Check visibility before hover (should be hidden or low opacity)
        # Note: visibility check in playwright checks computed style 'visibility' or 'display'
        # Our CSS uses opacity and visibility.

        # Hover over Services
        print("Hovering over 'Services'...")
        page.locator(".dropdown > a").hover()

        # Wait for transition
        page.wait_for_timeout(1000)

        # Take screenshot of open dropdown
        page.screenshot(path="verification/dropdown_desktop.png")
        print("Screenshot saved to verification/dropdown_desktop.png")

        # Verify links inside
        links = page.locator(".dropdown-menu a")
        count = links.count()
        print(f"Found {count} links in dropdown.")
        if count == 5:
            print("Correct number of service links found.")
        else:
            print(f"Expected 5 links, found {count}")

        # Test Link Navigation
        print("Clicking first link in dropdown...")
        # We need to make sure it's visible. Hover ensures it.
        links.first.click()
        page.wait_for_load_state("networkidle")

        if "service-monthly-seo.html" in page.url:
            print("Successfully navigated to Monthly SEO page.")
        else:
            print(f"Navigation failed. Current URL: {page.url}")

        # Test Mobile View
        print("\nTesting Mobile View...")
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto("http://localhost:8000/index.html")

        # Click mobile toggle
        print("Clicking mobile menu toggle...")
        page.locator(".mobile-toggle").click()
        page.wait_for_timeout(500)

        # Click dropdown toggle icon (chevron)
        # The icon is inside .dropdown > a > i
        print("Clicking dropdown toggle icon...")
        # In our script, we attached the listener to the icon
        # We need to find the icon specifically.
        # .dropdown > a contains text and <i>. clicking <i> should toggle.

        # Use a more specific selector to hit the icon
        icon = page.locator(".dropdown > a > i")

        # Ensure it's visible and clickable
        if icon.is_visible():
            icon.click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/dropdown_mobile.png")
            print("Screenshot saved to verification/dropdown_mobile.png")

            # Check if dropdown is active (visible)
            # In mobile css: .dropdown.active .dropdown-menu { display: block; }
            dropdown_parent = page.locator(".dropdown")
            classes = dropdown_parent.get_attribute("class")
            if "active" in classes:
                print("Mobile dropdown successfully toggled (class 'active' added).")
            else:
                print(f"Mobile dropdown toggle failed. Classes: {classes}")
        else:
            print("Dropdown icon not visible on mobile.")

        browser.close()

if __name__ == "__main__":
    verify_dropdown()
