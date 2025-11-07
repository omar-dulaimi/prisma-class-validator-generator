import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  ensureGeneratorBuilt,
  runPrismaGenerate,
} from './utils/prisma-test-helpers';

describe('Basic Class Validator Generation', () => {
  beforeAll(async () => {
    await ensureGeneratorBuilt();
  }, 60000);

  it('should generate basic models with class validators', async () => {
    const schemaPath = path.resolve(__dirname, 'schemas/basic.prisma');
    const outputPath = path.resolve(__dirname, 'generated/basic');

    await runPrismaGenerate({ schemaPath });

    // Check if generated files exist
    expect(existsSync(path.join(outputPath, 'models', 'User.model.ts'))).toBe(
      true,
    );
    expect(existsSync(path.join(outputPath, 'models', 'Post.model.ts'))).toBe(
      true,
    );
    expect(existsSync(path.join(outputPath, 'models', 'index.ts'))).toBe(true);
    expect(existsSync(path.join(outputPath, 'helpers', 'index.ts'))).toBe(true);
  }, 30000);

  it('should generate User model with correct validators', async () => {
    const outputPath = path.resolve(__dirname, 'generated/basic');

    // Import and check the generated User model
    const { User } = await import(
      path.join(outputPath, 'models', 'User.model.ts')
    );

    expect(User).toBeDefined();
    expect(typeof User).toBe('function');
  });

  it('should generate Post model with correct validators', async () => {
    const outputPath = path.resolve(__dirname, 'generated/basic');

    // Import and check the generated Post model
    const { Post } = await import(
      path.join(outputPath, 'models', 'Post.model.ts')
    );

    expect(Post).toBeDefined();
    expect(typeof Post).toBe('function');
  });

  it('should generate optional fields with null union types', async () => {
    const outputPath = path.resolve(__dirname, 'generated/basic');
    const userPath = path.join(outputPath, 'models', 'User.model.ts');
    const postPath = path.join(outputPath, 'models', 'Post.model.ts');

    const userContent = readFileSync(userPath, 'utf-8');
    const postContent = readFileSync(postPath, 'utf-8');

    // Check that optional fields have null union types
    expect(userContent).toContain('name?: string | null');
    expect(postContent).toContain('content?: string | null');
    expect(postContent).toContain('author?: User | null');
    expect(postContent).toContain('authorId?: number | null');
  });
});
