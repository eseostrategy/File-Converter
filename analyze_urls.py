import asyncio
import json
import os
import re
import urllib.parse
from datetime import datetime
from playwright.async_api import async_playwright

URLS = [
    "https://edu.openu.in/account/my-account",
    "https://lqdoj.edu.vn/account/my-account",
    "https://www.centrotecnologico.edu.mx/account/my-account",
    "https://dados.justica.gov.pt/account/my-account",
    "https://blac.edu.pl/account/my-account",
    "https://zerosuicidetraining.edc.org/account/my-account",
    "https://www.lasallesancristobal.edu.mx/account/my-account",
    "https://triumph.srivenkateshwaraa.edu.in/account/my-account",
    "https://www.ceacuautla.edu.mx/account/my-account",
    "https://www.lanubedocente.21.edu.ar/account/my-account",
    "https://csdlcntmgialai.gov.vn/account/my-account",
    "https://www.activethinkers.edu.ph/account/my-account",
    "https://mpgimer.edu.in/account/my-account",
    "https://www.altamira.edu.ec/account/my-account",
    "https://dados.unifei.edu.br/account/my-account",
    "https://www.ictae.edu.mx/account/my-account",
    "https://www.orkhonschool.edu.mn/account/my-account",
    "https://onrtip.gov.jm/account/my-account",
    "https://codi.hostile.education/account/my-account",
    "https://www.haphong.edu.vn/account/my-account",
    "https://www.workingtontowncouncil.gov.uk/account/my-account",
    "https://www.cimurc.ba.gov.br/account/my-account",
    "https://independent.academia.edu/account/my-account",
    "https://tarauaca.ac.gov.br/account/my-account",
    "https://symbiota.mpm.edu/account/my-account",
    "https://bbiny.edu/account/my-account",
    "https://dadosabertos.ufersa.edu.br/account/my-account",
    "https://www.woorips.vic.edu.au/account/my-account",
    "https://www.stes.tyc.edu.tw/account/my-account",
    "https://institutocrecer.edu.co/account/my-account",
    "https://gmtti.edu/account/my-account",
    "https://www.miseducationofmotherhood.com/account/my-account",
    "https://test.elit.edu.my/account/my-account",
    "https://www.ati.edu.my/account/my-account",
    "https://www.chili.edu.pl/account/my-account",
    "https://intranet.estvgti-becora.edu.tl/account/my-account",
    "https://www.capandgown.stanford.edu/account/my-account",
    "https://dados.ifac.edu.br/account/my-account",
    "https://www.news.lafontana.edu.co/account/my-account",
    "https://liceofrater.edu.gt/account/my-account",
    "https://www.democracy-edu.or.kr/account/my-account",
    "https://www.burnhamparish.gov.uk/account/my-account",
    "https://acmilsandiego.edu.ec/account/my-account",
    "https://ncon.edu.sa/account/my-account",
    "https://www.dlsjbc.edu.ph/account/my-account",
    "https://www.cu.edu.lr/account/my-account",
    "https://www.lajoyatx.gov/account/my-account",
    "https://lms.ait.edu.za/account/my-account",
    "https://www.britishschool.edu.mn/account/my-account",
    "https://data.loda.gov.ua/account/my-account",
    "https://iltc.edu.sa/account/my-account",
    "https://rciims.mona.uwi.edu/account/my-account",
    "https://www.cbc.edu/account/my-account",
    "https://aiti.edu.vn/account/my-account",
    "https://mooc.esil.edu.kz/account/my-account",
    "https://liceomibendicion.edu.gt/account/my-account",
    "https://holycrossconvent.edu.na/account/my-account",
    "https://portal.stem.edu.gr/account/my-account",
    "https://www.sadaacademy.edu.sa/account/my-account",
    "https://www.usfencounter.stfrancis.edu/account/my-account",
    "https://stempreacademy.hawaii.edu/account/my-account",
    "https://www.aoth.edu.gr/account/my-account",
    "https://esapa.edu.ar/account/my-account",
    "https://www.cruzrojaslp.edu.mx/account/my-account",
    "https://okmen.edu.vn/account/my-account",
    "https://www.creswicknorthps.vic.edu.au/account/my-account",
    "https://wis.edu.na/account/my-account",
    "https://dvsv.pxu.edu.vn/account/my-account",
    "https://www.jit.edu.gh/account/my-account",
    "https://www.dpc.edu.ph/account/my-account",
    "https://www.fgi.edu.br/account/my-account",
    "https://www.rosewood.edu.na/account/my-account",
    "https://myonline.phoenix.edu.au/account/my-account",
    "https://www.divinagracia.edu.ec/account/my-account",
    "https://bta.edu.gt/account/my-account",
    "https://hoc.salomon.edu.vn/account/my-account",
    "https://edu.mnhn.fr/account/my-account",
    "https://www.hea.edu.au/account/my-account",
    "https://www.igesi.edu.pe/account/my-account",
    "https://cidhma.edu.pe/account/my-account",
    "https://chuanmen.edu.vn/account/my-account",
    "https://www.baringass.vic.edu.au/account/my-account",
    "https://mentor.khai.edu/account/my-account",
    "https://ih.hs.yzu.edu.tw/account/my-account",
    "https://www.astor.edu.sg/account/my-account",
    "https://academia.sanpablo.edu.ec/account/my-account",
    "https://www.ffassis.edu.br/account/my-account",
    "https://batdongsan24h.edu.vn/account/my-account",
    "https://www.concentra.edu.do/account/my-account",
    "https://ait.edu.za/account/my-account",
    "https://www.discoveryschool.edu.hn/account/my-account",
    "https://www.aac.edu.sg/account/my-account",
    "https://aula7.uas.edu.mx/account/my-account",
    "https://ccitonline.com/account/my-account",
    "https://www.kollel.edu.au/account/my-account",
    "https://www.edway.edu.au/account/my-account",
    "https://www.nomenglobal.edu/account/my-account",
    "https://iescampus.edu.lk/account/my-account",
    "https://www.adamscollege.edu/account/my-account",
    "https://mooc.ifro.edu.br/account/my-account",
    "https://courses.apa.edu.vn/account/my-account",
    "https://adept.missouri.edu/account/my-account",
    "https://www.hva-edu.com/account/my-account",
    "https://alumni.bowdoin.edu/account/my-account",
    "https://firstrainingsalud.edu.pe/account/my-account",
    "https://alumni.life.edu/account/my-account",
    "https://www.tresillianartscentre.wa.gov.au/account/my-account",
    "https://www.tarauaca.ac.gov.br/account/my-account",
    "https://www.colegioirlandes.edu.ar/account/my-account",
    "https://www.colegiociodemexico.edu.mx/account/my-account",
    "https://www.ameap.ap.gov.br/account/my-account",
    "https://www.portal.uasj.unpa.edu.ar/account/my-account",
    "https://www.rochester.edu.co/account/my-account",
    "https://www.summitcc.edu/account/my-account",
    "https://idiomas.ifgoiano.edu.br/account/my-account",
    "https://www.licamvillavicencio.edu.co/account/my-account",
    "https://www.colegiointernacional.edu.mx/account/my-account",
    "https://www.edu-kingdom.com/account/my-account",
    "https://www.sarkariresult.education/account/my-account",
    "https://celai.edu.co/account/my-account",
    "https://www.abriendocaminos.edu.co/account/my-account",
    "https://www.universidadmaya.edu.mx/account/my-account",
]

RESULTS_FILE = "analysis_results.json"

def get_domain(url):
    parsed = urllib.parse.urlparse(url)
    return parsed.netloc

def extract_website_name(title, domain):
    if not title:
        parts = domain.replace("www.", "").split(".")
        return parts[0].capitalize()
    # Clean title
    title = title.strip()
    # If title has separator like | or -
    for sep in ["|", "-", "–", "—", ":"]:
        if sep in title:
            candidate = title.split(sep)[0].strip()
            if candidate and len(candidate) > 2:
                return candidate
    return title[:40].strip()

async def analyze_single_url(browser, url, index):
    domain = get_domain(url)
    print(f"[{index+1}/{len(URLS)}] Checking: {url}")
    result = {
        "index": index + 1,
        "domain": domain,
        "website_url": url,
        "website_name": domain,
        "status": "MANUAL_REVIEW", # QUALIFIED, REJECTED, MANUAL_REVIEW
        "reason": "",
        "login_url": "",
        "registration_url": "",
        "google_entry_url": "",
        "google_auth_status": "",
        "member_area_url": "Not visible without login",
        "profile_url": "Not visible without login",
        "edit_profile_url": "Not visible without login",
        "checked_date": datetime.now().strftime("%Y-%m-%d"),
    }

    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        ignore_https_errors=True,
    )
    page = await context.new_page()
    page.set_default_navigation_timeout(25000)
    page.set_default_timeout(10000)

    try:
        response = None
        try:
            response = await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        except Exception as e:
            # Try root URL if /account/my-account timed out or failed
            err_msg = str(e)
            print(f"  Error loading initial url: {err_msg}")
            # Try http or base domain
            base_url = f"{urllib.parse.urlparse(url).scheme}://{domain}"
            try:
                print(f"  Trying base url: {base_url}")
                response = await page.goto(base_url, wait_until="domcontentloaded", timeout=20000)
            except Exception as e2:
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"Site unreachable: {err_msg}"
                await context.close()
                return result

        status_code = response.status if response else 0
        current_url = page.url
        print(f"  Loaded URL: {current_url} (HTTP {status_code})")

        # Check for HTTP errors or bot challenges
        body_text = await page.inner_text("body") if page else ""
        title = await page.title()
        if title:
            result["website_name"] = extract_website_name(title, domain)

        if status_code in [403, 401, 500, 502, 503, 504]:
            if "cloudflare" in body_text.lower() or "cf-chl" in (await page.content()).lower():
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"Cloudflare / Bot protection blocked access (HTTP {status_code})"
                await context.close()
                return result
            elif status_code == 403:
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"Access Forbidden (HTTP 403)"
                await context.close()
                return result
            elif status_code >= 500:
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"Server Error (HTTP {status_code})"
                await context.close()
                return result

        if "checking your browser" in body_text.lower() or "turnstile" in body_text.lower() or "ddos-guard" in body_text.lower():
            result["status"] = "MANUAL_REVIEW"
            result["reason"] = "Bot check / CAPTCHA protection encountered"
            await context.close()
            return result

        # Check for real Login / Sign-in page
        # Check current page first: does it have login forms?
        has_login_form = await page.evaluate('''() => {
            const forms = Array.from(document.querySelectorAll('form'));
            const inputs = Array.from(document.querySelectorAll('input'));
            const hasPassword = inputs.some(i => i.type === 'password');
            const hasLoginText = /log\\s*in|sign\\s*in|iniciar\\s*sesi[oó]n|acceder|connexion|đăng\\s*nhập/i.test(document.body.innerText);
            return hasPassword || hasLoginText;
        }''')

        # Find login and registration URLs from links
        link_data = await page.evaluate('''() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            const data = [];
            for (const a of links) {
                const text = (a.innerText || '').trim().toLowerCase();
                const href = a.href;
                const aria = (a.getAttribute('aria-label') || '').toLowerCase();
                const title = (a.getAttribute('title') || '').toLowerCase();
                data.push({ text, href, aria, title });
            }
            return data;
        }''')

        discovered_login = None
        discovered_register = None
        discovered_member = None
        discovered_profile = None
        discovered_edit_profile = None

        login_keywords = ['login', 'log in', 'sign in', 'signin', 'iniciar sesión', 'iniciar sesion', 'entrar', 'acceder', 'connexion', 'đăng nhập']
        reg_keywords = ['register', 'registration', 'sign up', 'signup', 'create account', 'crear cuenta', 'registrarse', 'cadastro', 'đăng ký']
        member_keywords = ['member area', 'dashboard', 'my account', 'mi cuenta', 'área de membros', 'panel']
        profile_keywords = ['my profile', 'mi perfil', 'profile', 'perfil', 'mon profil']
        edit_profile_keywords = ['edit profile', 'editar perfil', 'edit my profile', 'modifier mon profil']

        # Determine if current page is login/register page
        current_lower = current_url.lower()
        if any(k in current_lower for k in ['login', 'signin', 'my-account', 'acceder', 'iniciar-sesion', 'connexion']):
            discovered_login = current_url
        if any(k in current_lower for k in ['register', 'signup', 'cadastre-se', 'registro']):
            discovered_register = current_url

        for item in link_data:
            text = f"{item['text']} {item['aria']} {item['title']}".lower()
            href = item['href'].lower()
            if not href.startswith('http'):
                continue
            # Filter out anchor links or logout links
            if 'logout' in href or 'signout' in href or 'sair' in href or 'cerrar' in href:
                continue

            if not discovered_login and any(k in text or k in href for k in login_keywords):
                discovered_login = item['href']
            if not discovered_register and any(k in text or k in href for k in reg_keywords):
                discovered_register = item['href']
            if not discovered_member and any(k in text for k in member_keywords):
                if item['href'] != current_url and 'login' not in href:
                    discovered_member = item['href']
            if not discovered_profile and any(k in text for k in profile_keywords):
                if 'login' not in href:
                    discovered_profile = item['href']
            if not discovered_edit_profile and any(k in text for k in edit_profile_keywords):
                if 'login' not in href:
                    discovered_edit_profile = item['href']

        # If current page has login forms and we didn't find specific login link, current_url is login_url
        if not discovered_login and has_login_form:
            discovered_login = current_url

        # Check for Google button on current page or login/registration pages
        async def check_google_on_page(target_page):
            # Check links, buttons, iframes, divs with google
            google_el = await target_page.evaluate('''() => {
                const candidates = Array.from(document.querySelectorAll('a, button, input[type="button"], input[type="submit"], [role="button"], div, span'));
                for (const el of candidates) {
                    const text = (el.innerText || '').toLowerCase();
                    const href = (el.getAttribute('href') || '').toLowerCase();
                    const id = (el.id || '').toLowerCase();
                    const cls = (el.className || '').toString().toLowerCase();
                    const title = (el.getAttribute('title') || '').toLowerCase();
                    const aria = (el.getAttribute('aria-label') || '').toLowerCase();
                    const val = (el.value || '').toLowerCase();

                    const combined = `${text} ${href} ${id} ${cls} ${title} ${aria} ${val}`;

                    if (combined.includes('accounts.google.com') ||
                        (combined.includes('google') && (combined.includes('login') || combined.includes('sign in') || combined.includes('signin') || combined.includes('signup') || combined.includes('sign up') || combined.includes('continue') || combined.includes('oauth') || combined.includes('social')))) {

                        // Make sure it's not a generic google map or google play link or footer link
                        if (combined.includes('play.google.com') || combined.includes('google.com/maps') || combined.includes('plus.google.com') || combined.includes('google fonts')) {
                            continue;
                        }

                        // Return element info
                        let tag = el.tagName.toLowerCase();
                        let targetHref = el.getAttribute('href') || '';
                        return { found: true, tag: tag, href: targetHref, text: (el.innerText || '').trim() };
                    }
                }
                // Check iframes for google gsi / one tap
                const iframes = Array.from(document.querySelectorAll('iframe'));
                for (const ifr of iframes) {
                    const src = ifr.src || '';
                    if (src.includes('accounts.google.com/gsi')) {
                        return { found: true, tag: 'iframe', href: src, text: 'Google One Tap / GSI iframe' };
                    }
                }
                return { found: false };
            }''')
            return google_el

        google_info = await check_google_on_page(page)

        # If not found on current page and we have login/registration URLs, check them
        login_to_test = discovered_login
        reg_to_test = discovered_register

        if not google_info.get('found') and login_to_test and login_to_test != current_url:
            print(f"  Navigating to discovered login page: {login_to_test}")
            try:
                await page.goto(login_to_test, wait_until="domcontentloaded", timeout=15000)
                google_info = await check_google_on_page(page)
            except Exception as e:
                print(f"  Failed to load login page: {e}")

        if not google_info.get('found') and reg_to_test and reg_to_test != page.url:
            print(f"  Navigating to discovered registration page: {reg_to_test}")
            try:
                await page.goto(reg_to_test, wait_until="domcontentloaded", timeout=15000)
                google_info = await check_google_on_page(page)
            except Exception as e:
                print(f"  Failed to load reg page: {e}")

        # If Google option was found, attempt verification by clicking or checking redirect
        google_verified = False
        google_entry_url = ""
        google_evidence = ""

        if google_info.get('found'):
            print(f"  Google element found: {google_info}")
            # If href directly points to accounts.google.com
            href = google_info.get('href', '')
            if 'accounts.google.com' in href:
                google_verified = True
                google_entry_url = href
                google_evidence = f"Google auth link points directly to accounts.google.com: {href[:80]}..."
            else:
                # Try clicking the Google button and observe popup or navigation
                try:
                    # Locate element
                    # We can use locator matching text or selector
                    loc = page.locator('a, button, [role="button"]').filter(has_text=re.compile(r'google', re.I)).first
                    if await loc.count() > 0:
                        # Setup popup listener or navigation
                        async with context.expect_page(timeout=8000) as new_page_info:
                            try:
                                await loc.click(timeout=5000)
                            except Exception:
                                pass
                        new_page = await new_page_info.value
                        await new_page.wait_for_load_state("domcontentloaded", timeout=8000)
                        if 'accounts.google.com' in new_page.url:
                            google_verified = True
                            google_entry_url = new_page.url
                            google_evidence = f"Opened popup to {new_page.url[:80]}..."
                            await new_page.close()
                    else:
                        # Try finding element by href or class
                        loc2 = page.locator('[href*="google"], [class*="google"]').first
                        if await loc2.count() > 0:
                            async with context.expect_page(timeout=8500) as new_page_info:
                                try:
                                    await loc2.click(timeout=5000)
                                except Exception:
                                    pass
                            new_page = await new_page_info.value
                            await new_page.wait_for_load_state("domcontentloaded", timeout=8000)
                            if 'accounts.google.com' in new_page.url:
                                google_verified = True
                                google_entry_url = new_page.url
                                google_evidence = f"Opened popup to {new_page.url[:80]}..."
                                await new_page.close()
                except Exception as e:
                    # Check if current page navigated to accounts.google.com
                    if 'accounts.google.com' in page.url:
                        google_verified = True
                        google_entry_url = page.url
                        google_evidence = f"Navigated directly to {page.url[:80]}..."
                    else:
                        print(f"  Click test encountered: {e}")

            # If still not verified, check if href is an oauth redirect that responds with accounts.google.com
            if not google_verified and href:
                if not href.startswith('http'):
                    href = urllib.parse.urljoin(page.url, href)
                if any(x in href.lower() for x in ['google', 'oauth', 'social']):
                    try:
                        p2 = await context.new_page()
                        resp2 = await p2.goto(href, wait_until="domcontentloaded", timeout=10000)
                        if 'accounts.google.com' in p2.url:
                            google_verified = True
                            google_entry_url = p2.url
                            google_evidence = f"Redirected to {p2.url[:80]}..."
                        await p2.close()
                    except Exception as e2:
                        print(f"  OAuth follow check error: {e2}")

        # Validate discovered member / profile / edit profile URLs if found
        async def verify_discovered_url(u):
            if not u:
                return "Not visible without login"
            try:
                test_p = await context.new_page()
                res = await test_p.goto(u, wait_until="domcontentloaded", timeout=10000)
                if res and res.status < 400:
                    final_u = test_p.url
                    await test_p.close()
                    return final_u
                await test_p.close()
                return "Not visible without login"
            except Exception:
                return "Not visible without login"

        if discovered_member:
            result["member_area_url"] = await verify_discovered_url(discovered_member)
        if discovered_profile:
            result["profile_url"] = await verify_discovered_url(discovered_profile)
        if discovered_edit_profile:
            result["edit_profile_url"] = await verify_discovered_url(discovered_edit_profile)

        result["login_url"] = discovered_login or "Not found"
        result["registration_url"] = discovered_register or "Not found"

        if google_verified:
            result["status"] = "QUALIFIED"
            result["google_entry_url"] = google_entry_url
            result["google_auth_status"] = f"Verified ({google_evidence})"
            print(f"  ==> QUALIFIED! Google verified: {google_entry_url}")
        else:
            # Check if page was 404 or completely empty
            if status_code == 404 or "404 not found" in body_text.lower() or "page not found" in title.lower():
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"URL returned 404 Not Found"
            elif google_info.get('found') and not google_verified:
                result["status"] = "MANUAL_REVIEW"
                result["reason"] = f"Google auth button present but failed to verify redirect to accounts.google.com"
            else:
                result["status"] = "REJECTED"
                result["reason"] = "Page loaded successfully, only standard login/registration or no Google option found."
                print(f"  ==> REJECTED: No Google auth option.")

    except Exception as e:
        print(f"  Unhandled error processing {url}: {e}")
        result["status"] = "MANUAL_REVIEW"
        result["reason"] = f"Processing error: {str(e)}"
    finally:
        await context.close()

    return result

async def main():
    existing_results = {}
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r") as f:
                data = json.load(f)
                for item in data:
                    existing_results[item["website_url"]] = item
        except Exception:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled"
            ]
        )

        all_results = []
        for i, url in enumerate(URLS):
            if url in existing_results and existing_results[url].get("status") in ["QUALIFIED", "REJECTED"]:
                print(f"[{i+1}/{len(URLS)}] Using cached result for {url}: {existing_results[url]['status']}")
                all_results.append(existing_results[url])
                continue

            res = await analyze_single_url(browser, url, i)
            all_results.append(res)
            # Save incrementally
            with open(RESULTS_FILE, "w") as f:
                json.dump(all_results, f, indent=2)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
