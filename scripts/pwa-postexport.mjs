// Copies public/ into dist/ and wires up the PWA manifest + service worker.
// Metro's `expo export -p web` doesn't do this automatically outside Expo Router.
import { cpSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const publicDir = join(root, "public");
const distDir = join(root, "dist");
const indexPath = join(distDir, "index.html");

if (!existsSync(distDir)) {
  console.error("dist/ not found — run `npx expo export -p web` first.");
  process.exit(1);
}

cpSync(publicDir, distDir, { recursive: true });

let html = readFileSync(indexPath, "utf8");
const injections = [
  '<link rel="manifest" href="/manifest.json" />',
  '<meta name="theme-color" content="#101218" />',
  '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />',
].join("\n  ");

html = html.replace('<link rel="icon" href="/favicon.ico" />', `<link rel="icon" href="/favicon.ico" />\n  ${injections}`);

const swScript = `<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
  }
</script>`;
html = html.replace("</body>", `  ${swScript}\n</body>`);

writeFileSync(indexPath, html);
console.log("PWA plumbing applied to dist/index.html");
