import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const outDir = path.join(__dirname, "..", "dist-frontend");
const swDest = path.join(outDir, "service-worker.js");

// Simple service worker generation for PWA
async function buildSW() {
  try {
    // Check if public/service-worker.js exists and use it
    const publicSwPath = path.join(
      __dirname,
      "..",
      "public",
      "service-worker.js"
    );

    if (fs.existsSync(publicSwPath)) {
      const swContent = fs.readFileSync(publicSwPath, "utf-8");
      fs.writeFileSync(swDest, swContent);
      console.log(`Service worker copied to ${swDest}`);
    } else {
      console.log(
        `Public service worker not found at ${publicSwPath}, skipping...`
      );
    }
  } catch (err) {
    console.error("Failed to generate service worker:", err);
    process.exit(1);
  }
}

buildSW();
