import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { initGitRepo } from "./install";

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "nextplus-git-"));
  await fs.outputFile(path.join(dir, "package.json"), '{"name":"test"}');
});

afterEach(async () => {
  await fs.remove(dir);
});

describe("initGitRepo", () => {
  test("creates a repo with a single initial commit", async () => {
    await initGitRepo(dir);

    expect(await fs.pathExists(path.join(dir, ".git"))).toBe(true);

    const proc = Bun.spawn(["git", "log", "--oneline"], { cwd: dir, stdout: "pipe" });
    const log = await new Response(proc.stdout).text();
    await proc.exited;

    expect(log.trim().split("\n")).toHaveLength(1);
    expect(log).toContain("Initial commit from create-nextplus");
  });
});
