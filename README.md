# Selemela Software Solutions

Branding uses the supplied Selemela Software Solutions logo with a white background, saved at `client/src/assets/selemela-logo.png`. The background was edited with the built-in image tool using: “Replace the grey background with pure white; preserve the gold network, MDiHub lettering and Mafikeng Digital Innovation Hub subtitle.”

The legacy storage key, Windows application ID, and `%APPDATA%\VisitorFlow` profile directory are retained so existing test data survives this branding update. The displayed application and installer names are Selemela Software Solutions.

A visitor check-in kiosk built with React, TypeScript and Vite, with an Electron desktop app for Windows. Visitors can register with an ID or passport, check in, and be checked out by an administrator. The admin area includes occupancy, visit history, filters and a visitor directory.

## Install the Windows app

After building, open `release/Selemela-Setup-1.0.0-x64.exe`, follow the installer, and launch **Selemela Software Solutions** from the desktop or Start menu. The installer is for 64-bit Windows 10/11 and installs for your Windows account without requiring administrator access. Node.js is not needed on a PC running the installed app.

This is an unsigned local test build. Windows may show an unknown-publisher/SmartScreen prompt; only proceed if you trust the installer you built from this project.

Uninstall through Windows **Settings > Apps > Installed apps > Selemela Software Solutions**. Visitor data is retained when uninstalling.

## Run from source

Install Node.js 22.12+ (or Node.js 24 LTS), then open PowerShell in this project folder:

```powershell
npm install --global pnpm@10.4.1
pnpm install --frozen-lockfile
pnpm dev
```

Open the localhost URL printed in the terminal (usually `http://localhost:3000`). Stop the server with Ctrl+C. Use pnpm 10.4.1 so the included dependency patch and lockfile are respected.

No database, API key or `.env` file is required for the visitor kiosk. Internet access is needed for dependency downloads. Google Fonts are optional; the interface uses fallback fonts when offline.

## Build a Windows installer

Run on a Windows x64 PC after installing the dependencies:

```powershell
pnpm dist:win
```

This checks TypeScript, compiles the desktop frontend and packages an NSIS installer in `release/`. The first build downloads Electron and Windows packaging tools, so allow time and internet access. The `release/win-unpacked/` folder also contains the application for direct testing; keep all of its files together.

To launch the desktop app from source:

```powershell
pnpm desktop
```

Run the automated desktop workflow check with `pnpm test:desktop`. It uses a hidden window and a separate temporary profile under `tmp/`.

To build and serve the web version:

```powershell
pnpm build
pnpm start
```

The production web server defaults to port 3000. To change it in PowerShell, run `$env:PORT = "3001"` before `pnpm start`.

## Test the app

Use fictional details for testing. The demo admin login is:

- Username: `admin`
- Password: `admin123`

1. Launch the app. Four sample visitors appear on first use; Alice starts checked in.
2. Choose **Check in with Passport**, enter a new number such as `TEST12345`, and continue. Fill in the registration details and submit. Confirm the arrival success screen appears.
3. Return home and look up the same passport again. The app should say you are already checked in.
4. Open **Admin login** and sign in. Check that the visitor appears in **Currently checked in**, then select **Check out**.
5. Open **Check-in history** and search for that visitor. Confirm the checked-out status and departure time. Try the status, identification type and Today filters.
6. Sign out, look up the same passport, and check in using the existing profile. Registration should not be required again.
7. Close and reopen Selemela Software Solutions. Log in again and confirm the profile and visit records remain.

For an existing sample profile, passport `PZ4829106` belongs to Daniel van Wyk and starts checked out.

## Data and current limitations

### Visitor self-checkout

On the kiosk home screen, select **Leaving? Check out**, choose **South African ID** or **Passport**, and enter the number used to check in. Select **Find my check-in**, verify your name, then select **Confirm check out**. A confirmation shows your departure time. No admin login is needed; the visit updates in the admin history and current occupancy immediately within the app. Unknown numbers and visitors without an active visit cannot check out. Choose **Not you? Use a different number** or **Back to kiosk** to cancel before confirming.

For a quick test on fresh sample data, use ID `ID-7842-19` (Alice). Confirm her departure, then repeat the lookup to check that another checkout is prevented. You can also register a fictional passport visitor and use the same passport to check out.

### Storage and prototype limits

- Data is saved in localStorage on this PC, under the key `visitorflow-kiosk-store-v1`. The desktop profile lives at `%APPDATA%\VisitorFlow`. Browser and desktop data are separate; different browsers also keep separate data.
- Close the app before backing up the entire `%APPDATA%\VisitorFlow` folder. To start fresh, close the app and rename that folder; the next launch creates a new profile with sample data. Renaming preserves the old profile for restoration.
- This is a local prototype: admin credentials are embedded in the frontend, and visitor records are not encrypted by the app. It needs real authentication and protected storage before handling real visitor information.
- There is no shared database, synchronization, automatic backup or automatic update system.
- ID/passport lookup currently checks for a nonempty value; it does not validate identity documents.
- Some dashboard controls are visual placeholders, including **New profile** in the admin directory; create profiles through the public check-in flow.

## Project layout

- `client/src/App.tsx`: kiosk and admin screens.
- `client/src/hooks/useVisitorData.ts`: registration, check-in and check-out.
- `client/src/services/storage.ts`: sample data and local persistence.
- `server/index.ts`: production web file server.
- `desktop/main.cjs`: Electron window and desktop data location.
- `vite.desktop.config.ts`: desktop frontend build with relative asset paths.
- `electron-builder.json`: Windows installer configuration.
- `scripts/prepare-desktop.mjs`: prepares the minimal desktop package.

## Troubleshooting

- **pnpm.ps1 cannot be loaded:** use `pnpm.cmd` in place of `pnpm`, or use Command Prompt.
- **Dependency download fails:** check connectivity to npm and GitHub, then rerun the install/build command.
- **Electron executable missing:** run `pnpm exec install-electron`, then retry. The project's postinstall command normally downloads the runtime automatically.
- **Blank desktop window:** rebuild with `pnpm build:desktop`; do not open the web build's HTML directly. Desktop builds require relative asset paths.
- **Old data remains after reinstall:** the app deliberately retains `%APPDATA%\VisitorFlow`; see the reset instructions above.

Desktop packaging follows the [Electron security guidance](https://www.electronjs.org/docs/latest/tutorial/security) and uses [electron-builder's NSIS installer](https://www.electron.build/nsis/).
