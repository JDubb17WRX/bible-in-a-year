// Next.js writes the minimal server into .next/standalone, but the public
// folder still needs to be mirrored there for the browser to fetch static
// assets (manifest icons, service worker file, etc.).
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const standaloneRoot = path.join(repoRoot, ".next", "standalone");

async function copyIfPresent(sourcePath, targetPath) {
  try {
    await fs.access(sourcePath);
  } catch {
    return;
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.cp(sourcePath, targetPath, { recursive: true, force: true });
}

async function main() {
  await copyIfPresent(
    path.join(repoRoot, ".next", "static"),
    path.join(standaloneRoot, ".next", "static"),
  );

  await copyIfPresent(
    path.join(repoRoot, "public"),
    path.join(standaloneRoot, "public"),
  );

  console.log("Standalone assets prepared in .next/standalone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
