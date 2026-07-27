import fs from "fs-extra";
import path from "node:path";
import crypto from "node:crypto";

const EXCLUDED_NAMES = new Set([
  ".git",
  "node_modules",
  ".env",
  ".next",
  "coverage",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "bun.lock",
  "bun.lockb",
  "yarn.lock",
  "package-lock.json",
]);

export async function copyTemplate(templateDir: string, destDir: string) {
  await fs.copy(templateDir, destDir, {
    filter: (src) => !EXCLUDED_NAMES.has(path.basename(src)),
  });
}

export async function renamePackageJson(destDir: string, projectName: string) {
  const pkgPath = path.join(destDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

export async function provisionEnvFile(destDir: string) {
  const examplePath = path.join(destDir, ".env.example");
  if (!(await fs.pathExists(examplePath))) return;

  const contents = await fs.readFile(examplePath, "utf-8");
  const provisioned = contents.replace(/^(\w+)=YOUR_[A-Z_]*_HERE$/gm, (_match, key) => {
    return `${key}=${crypto.randomBytes(32).toString("hex")}`;
  });

  await fs.writeFile(path.join(destDir, ".env"), provisioned);
}
