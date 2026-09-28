import { copyFile, readFile, writeFile } from "node:fs/promises";

const metadata = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const output = new URL("../dist/desktop/", import.meta.url);
await copyFile(new URL("../desktop/main.cjs", import.meta.url), new URL("main.cjs", output));
await copyFile(new URL("../desktop/icon.ico", import.meta.url), new URL("icon.ico", output));
await writeFile(new URL("package.json", output), JSON.stringify({
  name: metadata.name,
  productName: "Selemela Software Solutions",
  version: metadata.version,
  description: metadata.description,
  license: metadata.license,
  main: "main.cjs",
}, null, 2) + "\n");
