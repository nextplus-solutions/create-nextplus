#!/usr/bin/env bun

import fs from "fs-extra";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { validateProjectName } from "./utils";
import { copyTemplate, renamePackageJson, provisionEnvFile } from "./scaffold";
import { installDependencies, initGitRepo } from "./install";
import pkg from "../package.json";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(
    [
      "Usage: create-nextplus [project-name]",
      "",
      "Scaffolds a new Payload CMS project.",
      "",
      "Options:",
      "  -h, --help     Show this help message",
      "  -v, --version  Show the version number",
    ].join("\n"),
  );
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log(pkg.version);
  process.exit(0);
}

p.intro(pc.bgCyan(pc.black(" create-nextplus ")));

let projectName = args[0];

if (projectName?.startsWith("-")) {
  p.cancel(`Unknown option "${projectName}". Run with --help for usage.`);
  process.exit(1);
}

if (!projectName) {
  const answer = await p.text({
    message: "What is your project named?",
    placeholder: "my-project",
    validate: (value) => {
      const result = validateProjectName(value ?? "");
      return result.valid ? undefined : result.message;
    },
  });

  if (p.isCancel(answer)) {
    p.cancel("Cancelled.");
    process.exit(1);
  }

  projectName = answer;
} else {
  const result = validateProjectName(projectName);
  if (!result.valid) {
    p.cancel(result.message);
    process.exit(1);
  }
}

const destination = path.resolve(process.cwd(), projectName);

if (await fs.pathExists(destination)) {
  p.cancel(`Directory "${projectName}" already exists.`);
  process.exit(1);
}

const templateDir = path.join(import.meta.dir, "..", "templates", "advanced");

const scaffoldSpinner = p.spinner();
scaffoldSpinner.start("Creating project files");
try {
  await copyTemplate(templateDir, destination);
  await renamePackageJson(destination, projectName);
  await provisionEnvFile(destination);
  scaffoldSpinner.stop("Project files created");
} catch (error) {
  scaffoldSpinner.stop("Failed to create project files");
  await fs.remove(destination);
  p.cancel(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const installSpinner = p.spinner();
installSpinner.start("Installing dependencies");
try {
  await installDependencies(destination);
  installSpinner.stop("Dependencies installed");
} catch (error) {
  installSpinner.stop("Failed to install dependencies");
  p.log.error(error instanceof Error ? error.message : String(error));
  p.log.warn(`Project files were created, but dependencies were not installed. Run "bun install" inside ${projectName} to retry.`);
  p.outro(pc.yellow("Finished with errors."));
  process.exit(1);
}

try {
  await initGitRepo(destination);
} catch {
  p.log.warn("Skipped git init (git may not be installed or configured).");
}

p.outro(
  [
    pc.green("✅ Project created successfully!"),
    "",
    "Next steps:",
    "",
    pc.cyan(`  cd ${projectName}`),
    pc.cyan("  bun dev"),
  ].join("\n"),
);
