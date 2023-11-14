import { expect, Page, test } from "@playwright/test";

const routes = [
    "/",
    "/activity",
    "/feedback",
    "/gift",
    "/receive",
    "/redshift",
    "/scanner",
    "/send",
    "/swap",
    "/settings"
];

const settingsRoutes = [
    "/admin",
    "/backup",
    "/channels",
    "/connections",
    "/currency",
    "/emergencykit",
    "/encrypt",
    "/gift",
    "/lnurlauth",
    "/plus",
    "/restore",
    "/servers",
    "/syncnostrcontacts"
];

const settingsRoutesPrefixed = settingsRoutes.map((route) => {
    return "/settings" + route;
});

const allRoutes = routes.concat(settingsRoutesPrefixed);

// Create a JS Map of all routes so we can check them off one by one
const checklist = new Map();
allRoutes.forEach((route) => {
    checklist.set(route, false);
});

// Only works if there's a link to the route on the page
async function checkRoute(
    page: Page,
    route: string,
    expectedHeader: string,
    checklist: Map<string, boolean>
) {
    await page.locator(`a[href='${route}']`).first().click();
    await expect(page.locator("h1").first()).toHaveText(expectedHeader);
    checklist.set(route, true);
}

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3420/");
});

test("visit each route", async ({ page }) => {
    // Start on the home page
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Mutiny Wallet/);

    // Wait for an element matching the selector to appear in DOM.
    await page.waitForSelector("text=0 SATS");

    console.log("Page loaded.");

    // Wait for a while just to make sure we can load everything
    await page.waitForTimeout(1000);

    checklist.set("/", true);

    await checkRoute(page, "/activity", "Activity", checklist);
    await page.goBack();

    // Navigate to settings
    await checkRoute(page, "/settings", "Settings", checklist);

    // Mutiny+
    await checkRoute(page, "/settings/plus", "Mutiny+", checklist);
    await page.goBack();

    // Lightning Channels
    await checkRoute(
        page,
        "/settings/channels",
        "Lightning Channels",
        checklist
    );
    await page.goBack();

    // Backup
    await checkRoute(page, "/settings/backup", "Backup", checklist);
    await page.goBack();

    // Restore
    await checkRoute(page, "/settings/restore", "Restore", checklist);
    await page.goBack();

    // Currency
    await checkRoute(page, "/settings/currency", "Currency", checklist);
    await page.goBack();

    // Servers
    await checkRoute(page, "/settings/servers", "Servers", checklist);
    await page.goBack();

    // Connections
    await checkRoute(
        page,
        "/settings/connections",
        "Wallet Connections",
        checklist
    );
    await page.goBack();

    // LNURL Auth
    await checkRoute(page, "/settings/lnurlauth", "LNURL Auth", checklist);
    await page.goBack();

    // Sync Nostr Contacts
    await checkRoute(
        page,
        "/settings/syncnostrcontacts",
        "Sync Nostr Contacts",
        checklist
    );
    await page.goBack();

    // Emergency Kit
    await checkRoute(
        page,
        "/settings/emergencykit",
        "Emergency Kit",
        checklist
    );
    await page.goBack();

    // Admin
    await checkRoute(page, "/settings/admin", "Secret Debug Tools", checklist);
    await page.goBack();

    // Go back home
    await page.goBack();

    // Feedback
    await checkRoute(page, "/feedback", "Give us feedback!", checklist);
    await page.goBack();

    // Receive is covered in another test
    checklist.set("/receive", true);

    // Send is covered in another test
    checklist.set("/send", true);

    // Scanner
    await page.locator(`a[href='/scanner']`).first().click();
    await expect(page.locator("button").first()).toHaveText("Paste Something");
    checklist.set("/scanner", true);

    // Now we have to check routes that aren't linked to directly for whatever reason
    await page.goto(
        "http://localhost:3420/gift?amount=50000&nwc_uri=nostr%2Bwalletconnect%3A%2F%2Ff6d55dff6da0f23e0d609121905aaa8da5d2bad7759459402e2bee1162912556%3Frelay%3Dwss%253A%252F%252Fnostr.mutinywallet.com%252F%26secret%3D8a2d579a182e9091d36d5668eb1c3b301d98bc792d94e866526123df79568355"
    );
    await expect(page.locator("h2").nth(1)).toHaveText(
        "You've been gifted some sats!"
    );
    checklist.set("/gift", true);

    // Visit connections with AutoZap params
    const autoZapParams =
        "/settings/connections?return_to=https%3A%2F%2Fwww.zapplepay.com%2Fautozap%2Fnpub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s&name=AutoZap-jb55&budget_renewal=day&max_amount=420";
    await page.goto("http://localhost:3420" + autoZapParams);
    await expect(page.locator('[role="dialog"] h2 header').first()).toHaveText(
        "Add Connection"
    );

    // Redshift
    await page.goto("http://localhost:3420/redshift");
    await expect(page.locator("h1")).toHaveText("Redshift (coming soon)");
    checklist.set("/redshift", true);
    await page.goBack();

    // Swap
    await page.goto("http://localhost:3420/swap");
    await expect(page.locator("h1")).toHaveText("Swap to Lightning");
    checklist.set("/swap", true);

    // Gift
    await page.goto("http://localhost:3420/settings/gift");
    await expect(page.locator("h1")).toHaveText("Create Gift");
    checklist.set("/settings/gift", true);

    // Encrypt
    await page.goto("http://localhost:3420/settings/encrypt");
    await expect(page.locator("h1")).toHaveText(
        "Encrypt your seed words (optional)"
    );
    checklist.set("/settings/encrypt", true);

    // print how many routes we've visited
    checklist.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });
});
