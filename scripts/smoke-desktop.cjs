// Run with: pnpm exec electron scripts/smoke-desktop.cjs
// Uses an isolated profile and a hidden window; never touches real visitor data.
const { app, BrowserWindow } = require("electron");
const { mkdirSync, mkdtempSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const tempRoot = path.resolve(__dirname, "../tmp");
mkdirSync(tempRoot, { recursive: true });
app.setPath("userData", mkdtempSync(path.join(tempRoot, "desktop-smoke-")));
const timeout = setTimeout(() => { console.error("Desktop smoke test timed out"); app.exit(1); }, 60000);

app.whenReady().then(async () => {
  const window = new BrowserWindow({ show: false, width: 1440, height: 960,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  const run = (code) => window.webContents.executeJavaScript(code);
  const settle = () => new Promise(resolve => setTimeout(resolve, 100));
  const click = async (text) => {
    await run(`(() => {
      const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(text)});
      if (!button) throw new Error('Button missing: ' + ${JSON.stringify(text)});
      button.click();
    })()`);
    await settle();
  };
  const fill = async (selector, value) => {
    await run(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) throw new Error('Input missing: ' + ${JSON.stringify(selector)});
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await settle();
  };
  const store = () => run("JSON.parse(localStorage.getItem('visitorflow-kiosk-store-v1'))");
  await window.loadFile(path.resolve(__dirname, "../dist/desktop/public/index.html"));
  await settle();
  assert.equal(await run("document.querySelectorAll('.identity-card').length"), 2);
  assert.equal(await run("typeof require"), "undefined");
  assert.ok(await run("getComputedStyle(document.querySelector('.identity-grid')).display === 'grid'"));
  await run("document.querySelector('.identity-passport').click()");
  await settle();
  await fill("#identifier", "SMOKE12345");
  await click("Continue");
  for (const [selector, value] of [
    ['input[placeholder="e.g. John"]', 'Smoke'],
    ['input[placeholder="e.g. Doe"]', 'Tester'],
    ['input[type="email"]', 'smoke@example.com'],
    ['input[placeholder="+27 00 000 0000"]', '0000000000'],
  ]) await fill(selector, value);
  await click("Register & check in");
  assert.ok(await run("document.body.textContent.includes('successfully checked in')"));
  let saved = await store();
  const visitor = saved.users.find(user => user.identificationNumber === "SMOKE12345");
  assert.ok(visitor);
  assert.equal(saved.records.filter(record => record.userId === visitor.id).length, 1);
  await click("Done");
  await run("document.querySelector('.identity-passport').click()");
  await settle();
  await fill("#identifier", "SMOKE12345");
  await click("Continue");
  assert.ok(await run("document.body.textContent.includes('You are already checked in.')"));
  await click("Back to options");
  await click("Admin login");
  await fill('input[placeholder="Enter username"]', 'admin');
  await fill('input[placeholder="Enter password"]', 'wrong');
  await click("Sign in");
  assert.ok(await run("document.querySelector('.form-error') !== null"));
  await fill('input[placeholder="Enter password"]', 'admin');
  await click("Sign in");
  await click("Currently checked in");
  await run(`(() => {
    const row = [...document.querySelectorAll('tr')].find(row => row.textContent.includes('SMOKE12345'));
    if (!row) throw new Error('Registered visitor missing from current arrivals');
    row.querySelector('button').click();
  })()`);
  await settle();
  saved = await store();
  assert.equal(saved.records.find(record => record.userId === visitor.id).status, "CHECKED_OUT");
  assert.ok(saved.records.find(record => record.userId === visitor.id).checkOutTime);
  await click("Check-in history");
  await fill('input[placeholder="Search name, surname or ID..."]', 'SMOKE12345');
  assert.equal(await run("document.querySelectorAll('tbody tr').length"), 1);
  assert.ok(await run("document.querySelector('tbody').textContent.includes('Checked out')"));
  writeFileSync(path.join(tempRoot, "desktop-smoke.png"), (await window.webContents.capturePage()).toPNG());
  await window.loadFile(path.resolve(__dirname, "../dist/desktop/public/index.html"));
  await settle();
  assert.deepEqual(await store(), saved);
  await run("document.querySelector('.identity-passport').click()");
  await settle();
  await fill("#identifier", "SMOKE12345");
  await click("Continue");
  await click("Check in now");
  saved = await store();
  assert.equal(saved.records.filter(record => record.userId === visitor.id).length, 2);
  await click("Done");
  await click("Leaving? Check out");
  await click("Find my check-in");
  assert.ok(await run("document.querySelector('[role=alert]').textContent.includes('Please enter')"));
  await fill('#checkout-number', 'UNKNOWN-ID');
  await click("Find my check-in");
  assert.ok(await run("document.body.textContent.includes('No active check-in found')"));
  assert.deepEqual(await store(), saved);
  // ID lookup and cancellation must not record a departure.
  await fill('#checkout-number', 'ID-7842-19');
  await click("Find my check-in");
  assert.ok(await run("document.body.textContent.includes('Alice')"));
  assert.deepEqual(await store(), saved);
  await click("Not you? Use a different number");
  await fill('#checkout-number', 'ID-7842-19');
  await click("Find my check-in");
  await click("Confirm check out");
  assert.equal((await store()).records.find(record => record.id === 'record-alice-today').status, 'CHECKED_OUT');
  await click("Done");
  await click("Leaving? Check out");
  await run("document.querySelector('#checkout-type').value = 'PASSPORT'; document.querySelector('#checkout-type').dispatchEvent(new Event('change', { bubbles: true }))");
  await settle();
  await fill('#checkout-number', ' smoke12345 ');
  await click("Find my check-in");
  await click("Confirm check out");
  assert.ok(await run("document.body.textContent.includes('successfully checked out')"));
  saved = await store();
  assert.equal(saved.records.filter(record => record.userId === visitor.id && record.status === 'CHECKED_IN').length, 0);
  await click("Done");
  await click("Leaving? Check out");
  await run("document.querySelector('#checkout-type').value = 'PASSPORT'; document.querySelector('#checkout-type').dispatchEvent(new Event('change', { bubbles: true }))");
  await settle();
  await fill('#checkout-number', 'SMOKE12345');
  await click("Find my check-in");
  assert.ok(await run("document.body.textContent.includes('No active check-in found')"));
  assert.deepEqual(await store(), saved);
  await window.loadFile(path.resolve(__dirname, "../dist/desktop/public/index.html"));
  await settle();
  assert.deepEqual(await store(), saved);
  console.log("PASS: ID/passport self-checkout, confirmation/cancel, empty/unknown/inactive lookup and departure persistence");
  console.log("PASS: desktop rendering, registration, duplicate prevention, login, checkout, history, persistence and returning visitor check-in");
  clearTimeout(timeout);
  app.exit(0);
}).catch(error => { console.error(error); clearTimeout(timeout); app.exit(1); });
