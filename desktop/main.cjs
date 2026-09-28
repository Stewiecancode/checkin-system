const { app, BrowserWindow, dialog, session } = require("electron");
const path = require("node:path");

app.setName("Selemela Software Solutions");
// Retain the legacy profile location so the Selemela Software Solutions rename preserves visitor data.
app.setPath("userData", path.join(app.getPath("appData"), "VisitorFlow"));

let mainWindow;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 800,
    minHeight: 600,
    title: "Selemela Software Solutions",
    icon: path.join(__dirname, "icon.ico"),
    backgroundColor: "#f7f9ff",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  await mainWindow.loadFile(path.join(__dirname, "public/index.html"));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  app.whenReady().then(async () => {
    app.setAppUserModelId("com.visitorflow.kiosk");
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    await createWindow();
  }).catch((error) => {
    dialog.showErrorBox("Selemela Software Solutions could not start", error.message);
    app.quit();
  });
  app.on("window-all-closed", () => app.quit());
}
