const { readFileSync } = require("node:fs");
const path = require("node:path");

module.exports = async ({ appDir }) => {
  const metadata = JSON.parse(readFileSync(path.join(appDir, "package.json"), "utf8"));
  if (Object.keys(metadata.dependencies || {}).length > 0) {
    throw new Error("Desktop runtime dependencies must be bundled before packaging.");
  }
  // Vite bundles the frontend; main.cjs uses only Electron and Node builtins.
  // Tell electron-builder that the staged app needs no node_modules collection.
  return false;
};
