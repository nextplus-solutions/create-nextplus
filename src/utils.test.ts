import { describe, expect, test } from "bun:test";
import { validateProjectName } from "./utils";

describe("validateProjectName", () => {
  test("accepts a simple lowercase name", () => {
    expect(validateProjectName("my-project").valid).toBe(true);
  });

  test("accepts scoped package names", () => {
    expect(validateProjectName("@acme/my-project").valid).toBe(true);
  });

  test("accepts names with dots, underscores, and tildes", () => {
    expect(validateProjectName("my.project_v1~beta").valid).toBe(true);
  });

  test("rejects an empty name", () => {
    expect(validateProjectName("").valid).toBe(false);
  });

  test("rejects a name that is only whitespace", () => {
    expect(validateProjectName("   ").valid).toBe(false);
  });

  test("rejects names with uppercase letters", () => {
    expect(validateProjectName("MyProject").valid).toBe(false);
  });

  test("rejects names with spaces", () => {
    expect(validateProjectName("my project").valid).toBe(false);
  });

  test("rejects names longer than 214 characters", () => {
    expect(validateProjectName("a".repeat(215)).valid).toBe(false);
  });
});
