import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { copyTemplate, provisionEnvFile, renamePackageJson } from "./scaffold";

let srcDir: string;
let destParent: string;
let destDir: string;

beforeEach(async () => {
  srcDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextplus-src-"));
  destParent = await fs.mkdtemp(path.join(os.tmpdir(), "nextplus-dest-"));
  destDir = path.join(destParent, "project");
});

afterEach(async () => {
  await fs.remove(srcDir);
  await fs.remove(destParent);
});

describe("copyTemplate", () => {
  test("copies regular files and nested directories", async () => {
    await fs.outputFile(path.join(srcDir, "package.json"), '{"name":""}');
    await fs.outputFile(path.join(srcDir, "src", "index.ts"), "export {}");

    await copyTemplate(srcDir, destDir);

    expect(await fs.pathExists(path.join(destDir, "package.json"))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, "src", "index.ts"))).toBe(true);
  });

  test("excludes .git, node_modules, .env, and lockfiles", async () => {
    await fs.outputFile(path.join(srcDir, "package.json"), '{"name":""}');
    await fs.outputFile(path.join(srcDir, ".git", "HEAD"), "ref: refs/heads/main");
    await fs.outputFile(path.join(srcDir, "node_modules", "some-pkg", "index.js"), "");
    await fs.outputFile(path.join(srcDir, ".env"), "SECRET=real-value");
    await fs.outputFile(path.join(srcDir, "pnpm-lock.yaml"), "");
    await fs.outputFile(path.join(srcDir, "bun.lock"), "");

    await copyTemplate(srcDir, destDir);

    expect(await fs.pathExists(path.join(destDir, ".git"))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, "node_modules"))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, ".env"))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, "pnpm-lock.yaml"))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, "bun.lock"))).toBe(false);
  });

  test("keeps .env.example", async () => {
    await fs.outputFile(path.join(srcDir, "package.json"), '{"name":""}');
    await fs.outputFile(path.join(srcDir, ".env.example"), "DATABASE_URL=placeholder");

    await copyTemplate(srcDir, destDir);

    expect(await fs.pathExists(path.join(destDir, ".env.example"))).toBe(true);
  });
});

describe("renamePackageJson", () => {
  test("sets the package name and preserves other fields", async () => {
    await fs.outputJson(path.join(destDir, "package.json"), { name: "", version: "1.0.0" });

    await renamePackageJson(destDir, "my-cool-app");

    const pkg = await fs.readJson(path.join(destDir, "package.json"));
    expect(pkg.name).toBe("my-cool-app");
    expect(pkg.version).toBe("1.0.0");
  });
});

describe("provisionEnvFile", () => {
  test("generates .env with unique random secrets for placeholder values", async () => {
    await fs.outputFile(
      path.join(destDir, ".env.example"),
      [
        "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/your-database-name",
        "PAYLOAD_SECRET=YOUR_SECRET_HERE",
        "CRON_SECRET=YOUR_CRON_SECRET_HERE",
        "PREVIEW_SECRET=YOUR_SECRET_HERE",
      ].join("\n"),
    );

    await provisionEnvFile(destDir);

    const env = await fs.readFile(path.join(destDir, ".env"), "utf-8");
    expect(env).toContain("DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/your-database-name");
    expect(env).not.toContain("YOUR_SECRET_HERE");
    expect(env).not.toContain("YOUR_CRON_SECRET_HERE");

    const payloadSecret = env.match(/PAYLOAD_SECRET=(\w+)/)?.[1];
    const previewSecret = env.match(/PREVIEW_SECRET=(\w+)/)?.[1];
    expect(payloadSecret).toBeTruthy();
    expect(previewSecret).toBeTruthy();
    expect(payloadSecret).not.toBe(previewSecret);
  });

  test("does nothing when there is no .env.example", async () => {
    await fs.ensureDir(destDir);

    await provisionEnvFile(destDir);

    expect(await fs.pathExists(path.join(destDir, ".env"))).toBe(false);
  });
});
