const NPM_NAME_PATTERN = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function validateProjectName(name: string): { valid: true } | { valid: false; message: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "Project name cannot be empty." };
  }

  if (name.length > 214) {
    return { valid: false, message: "Project name must be 214 characters or fewer." };
  }

  if (!NPM_NAME_PATTERN.test(name)) {
    return {
      valid: false,
      message: "Project name must be lowercase and can only contain letters, digits, and the characters - . _ ~",
    };
  }

  return { valid: true };
}
