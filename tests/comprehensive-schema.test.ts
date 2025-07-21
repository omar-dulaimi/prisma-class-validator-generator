import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';

const execAsync = promisify(exec);

describe('Comprehensive Schema Generation', () => {
  beforeAll(async () => {
    // Build the generator first
    await execAsync('npm run build');
  }, 60000);

  it('should generate comprehensive models with enums and relations', async () => {
    const schemaPath = path.resolve(__dirname, 'schemas/comprehensive.prisma');
    const outputPath = path.resolve(__dirname, 'generated/comprehensive');

    // Generate using the comprehensive schema
    await execAsync(`npx prisma generate --schema="${schemaPath}"`);

    // Check if generated files exist
    expect(existsSync(path.join(outputPath, 'models', 'User.model.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'models', 'Post.model.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'models', 'Profile.model.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'models', 'Tag.model.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'enums', 'Role.enum.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'enums', 'Status.enum.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'enums', 'index.ts'))).toBe(true);
  }, 30000);

  it('should handle Uint8Array type for Bytes fields', async () => {
    const outputPath = path.resolve(__dirname, 'generated/comprehensive');
    const profilePath = path.join(outputPath, 'models', 'Profile.model.ts');
    
    const profileContent = readFileSync(profilePath, 'utf-8');
    
    // Check that Bytes field uses Uint8Array instead of Buffer
    expect(profileContent).toContain('Uint8Array');
    expect(profileContent).not.toContain('Buffer');
  });

  it('should generate enum imports and validators', async () => {
    const outputPath = path.resolve(__dirname, 'generated/comprehensive');
    const userPath = path.join(outputPath, 'models', 'User.model.ts');
    
    const userContent = readFileSync(userPath, 'utf-8');
    
    // Check enum imports
    expect(userContent).toContain('import { Role, Status } from "../enums"');
    expect(userContent).toContain('@IsIn(getEnumValues(Role))');
    expect(userContent).toContain('@IsIn(getEnumValues(Status))');
  });

  it('should handle JSON fields correctly', async () => {
    const outputPath = path.resolve(__dirname, 'generated/comprehensive');
    const postPath = path.join(outputPath, 'models', 'Post.model.ts');
    
    const postContent = readFileSync(postPath, 'utf-8');
    
    // Check JSON field handling
    expect(postContent).toContain('Prisma.JsonValue');
    expect(postContent).toContain('import { Prisma } from "@prisma/client"');
  });
});