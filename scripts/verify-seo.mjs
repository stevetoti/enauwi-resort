import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const origin = process.argv[2] || 'http://127.0.0.1:3100'
const output = process.argv[3] || '/private/tmp/enauwi-seo-browser-local'
await mkdir(output, { recursive: true })
const approved = JSON.parse(await readFile(new URL('../src/data/seo-pages.json', import.meta.url), 'utf8'))
const browser = await chromium.launch({ headless: true })
const results = []
const appErrors = []
const blockedWrites = []
const paths = ['/', '/book', '/services', '/menu', '/activities', '/activities/snorkeling-diving', '/blog', '/blog/weekend-itinerary-enauwi-efate']

async function context(options = {}) {
  const ctx = await browser.newContext(options)
  await ctx.route('**/*', async route => {
    const req = route.request()
    const url = new URL(req.url())
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method())) {
      blockedWrites.push({ method: req.method(), pathname: url.pathname })
      return route.abort()
    }
    if (url.origin !== new URL(origin).origin && url.hostname !== 'jfiqbifwueoyqtajbhed.supabase.co') return route.abort()
    return route.continue()
  })
  return ctx
}

try {
  // Search-facing content must work even without JavaScript, including query-string booking URLs.
  const staticContext = await context({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } })
  for (const path of [...paths, '/book?room=2br-superior']) {
    const page = await staticContext.newPage()
    const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 60000 })
    assert.equal(response?.status(), 200, path)
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1, `${path} H1`)
    const normalized = path.split('?')[0]
    assert.equal(await page.title(), approved[normalized].title, `${path} title`)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    assert.equal(canonical?.replace(/\/$/, ''), 'https://www.enauwibeachresort.org' + (normalized === '/' ? '' : normalized), `${path} canonical`)
    for (const text of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(text)
    if (['/book', '/menu', '/services', '/activities'].includes(normalized)) {
      assert.equal(await page.getByRole('heading', { name: 'Planning your visit' }).count(), 1)
      assert.equal(await page.locator('details').count(), 4)
      assert.ok((await page.locator('body').textContent()).includes(approved[normalized].intro))
    }
    results.push({ phase: 'javascript-disabled', path, status: response.status(), h1: await page.getByRole('heading', { level: 1 }).textContent(), canonical, title: await page.title() })
    await page.close()
  }
  await staticContext.close()

  for (const [label, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await context({ viewport })
    const page = await ctx.newPage()
    page.on('pageerror', error => appErrors.push({ viewport: label, message: error.message }))
    const roomResponse = page.waitForResponse(r => r.url().includes('/api/rooms?') && r.status() === 200, { timeout: 60000 })
    await page.goto(origin + '/book', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const rooms = await (await roomResponse).json()
    assert.ok(Array.isArray(rooms.rooms), 'room API shape')
    await page.getByRole('heading', { name: 'Available Rooms', exact: true }).waitFor({ timeout: 30000 })
    if (rooms.rooms.length === 0) {
      await page.getByText('No rooms available', { exact: false }).waitFor({ timeout: 30000 })
      results.push({ phase: label, path: '/book', apiStatus: 200, roomsReturned: 0, bookingModal: 'not testable against real data: existing live inventory is also empty' })
      await page.screenshot({ path: `${output}/${label}-book-real-empty-state.png`, fullPage: true })
      // Isolated browser-only fixture: never persisted or used to claim real availability.
      await page.route('**/api/rooms?*', route => route.fulfill({
        json: { rooms: [{ id: 'seo-browser-fixture', name: 'TEST FIXTURE - Beachfront 1 Bedroom', type: 'test-fixture', description: 'Browser-only test data. Never submitted or published.', price_vt: 10000, max_guests: 2, amenities: [], images: [], available: true, created_at: '2026-11-01T00:00:00Z', is_booked: false }], availability: { 'test-fixture': { total: 1, available: 1 } }, availableCount: 1, totalRooms: 1 },
      }))
      await page.reload({ waitUntil: 'domcontentloaded' })
    }
    const bookButtons = page.getByRole('button', { name: 'Book Room', exact: true })
    await bookButtons.first().waitFor({ state: 'visible', timeout: 30000 })
    const roomCount = await bookButtons.count()
    assert.ok(roomCount > 0, 'room-selection UI rendered')
    await page.screenshot({ path: `${output}/${label}-book.png`, fullPage: true })
    await bookButtons.first().click()
    await page.getByRole('heading', { name: 'Complete Booking', exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    results.push({ phase: label, path: '/book', dataSource: rooms.rooms.length ? 'real API' : 'browser-only labelled fixture; real inventory empty', bookableOptions: roomCount, bookingModal: 'opened without submission' })

    const serviceResponse = page.waitForResponse(r => r.url().endsWith('/api/services') && r.status() === 200, { timeout: 60000 })
    await page.goto(origin + '/services', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const services = await (await serviceResponse).json()
    assert.ok(Array.isArray(services.services), 'service API shape')
    await page.getByRole('button', { name: 'Inquire About Conference Booking' }).click()
    await page.getByRole('heading', { name: 'Conference Room Inquiry', exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    results.push({ phase: label, path: '/services', apiStatus: 200, serviceCount: services.services.length, conferenceForm: 'opened without submission' })
    await page.screenshot({ path: `${output}/${label}-conference.png`, fullPage: true })

    await page.goto(origin + '/menu', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.getByText('Loading menu...', { exact: true }).waitFor({ state: 'hidden', timeout: 60000 })
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    const menuSections = await page.locator('section[aria-label="Current restaurant menu"] > section').count()
    assert.ok(menuSections > 0, 'restaurant categories rendered')
    await page.screenshot({ path: `${output}/${label}-menu.png`, fullPage: true })
    results.push({ phase: label, path: '/menu', loadedCategories: menuSections })

    await page.goto(origin + '/activities/snorkeling-diving', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const imageControl = page.getByRole('button', { name: 'View Snorkeling & Diving photo 2 of 4', exact: true })
    await imageControl.click()
    assert.equal(await imageControl.getAttribute('aria-pressed'), 'true')
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    await page.screenshot({ path: `${output}/${label}-activity.png`, fullPage: true })
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    assert.ok(noOverflow, `${label} horizontal overflow`)
    results.push({ phase: label, path: '/activities/snorkeling-diving', galleryControls: 'labelled and selectable', noHorizontalOverflow: noOverflow })
    await ctx.close()
  }
  assert.deepEqual(appErrors, [], 'browser runtime errors')
  assert.deepEqual(blockedWrites, [], 'no guest mutations attempted')
  await writeFile(`${output}/results.json`, JSON.stringify({ origin, checkedAt: new Date().toISOString(), results, appErrors, blockedWrites }, null, 2))
  console.log(JSON.stringify({ checks: results.length, appErrors, blockedWrites, evidence: output }))
} catch (error) {
  await writeFile(`${output}/failure.json`, JSON.stringify({ message: error.message, stack: error.stack, results, appErrors, blockedWrites }, null, 2))
  throw error
} finally {
  await browser.close()
}
