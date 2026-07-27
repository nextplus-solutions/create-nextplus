async function run(cmd: string[], cwd: string) {
  const proc = Bun.spawn(cmd, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed (${exitCode}): ${cmd.join(" ")}`);
  }
}

async function hasGitIdentity(cwd: string): Promise<boolean> {
  const proc = Bun.spawn(["git", "config", "user.email"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;
  return exitCode === 0;
}

export async function installDependencies(destDir: string) {
  await run(["bun", "install"], destDir);
}

export async function initGitRepo(destDir: string) {
  await run(["git", "init"], destDir);
  await run(["git", "add", "-A"], destDir);

  const commitArgs = ["git", "commit", "-m", "Initial commit from create-nextplus"];
  if (!(await hasGitIdentity(destDir))) {
    commitArgs.splice(1, 0, "-c", "user.name=create-nextplus", "-c", "user.email=create-nextplus@localhost");
  }
  await run(commitArgs, destDir);
}
