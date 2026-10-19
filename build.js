import fs from "node:fs";
import path from "node:path";

fs.mkdirSync("dist", { recursive: true });

const files = fs.readdirSync("public");
for (const file of files) {
  const src = path.join("public", file);
  const dest = path.join("dist", file);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, dest);
  }
}

console.log("Build complete: static files copied to dist/");
