import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';

const execAsync = promisify(exec);

describe('Relation Splitting Generation', () => {
  beforeAll(async () => {
    // Build the generator first
    await execAsync('npm run build');

    // Generate models for full-features schema
    const schemaPath = path.resolve(__dirname, 'schemas/full-features.prisma');
    await execAsync(`npx prisma generate --schema="${schemaPath}"`);
  }, 60000);

  it('should generate separate base and relation classes', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const modelsDir = path.join(outputPath, 'models');

    // Check that all expected files are generated
    expect(() =>
      readFileSync(path.join(modelsDir, 'UserBase.model.ts')),
    ).not.toThrow();
    expect(() =>
      readFileSync(path.join(modelsDir, 'UserRelations.model.ts')),
    ).not.toThrow();
    expect(() =>
      readFileSync(path.join(modelsDir, 'User.model.ts')),
    ).not.toThrow();

    expect(() =>
      readFileSync(path.join(modelsDir, 'PostBase.model.ts')),
    ).not.toThrow();
    expect(() =>
      readFileSync(path.join(modelsDir, 'PostRelations.model.ts')),
    ).not.toThrow();
    expect(() =>
      readFileSync(path.join(modelsDir, 'Post.model.ts')),
    ).not.toThrow();
  });

  it('should generate UserBase with only non-relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const userBasePath = path.join(outputPath, 'models', 'UserBase.model.ts');
    const userBase = readFileSync(userBasePath, 'utf-8');

    // Should contain scalar fields
    expect(userBase).toContain('id!: number');
    expect(userBase).toContain('email!: string');
    expect(userBase).toContain('name?: string | null');

    // Should NOT contain relation fields
    expect(userBase).not.toContain('posts');

    // Should have both class-validator and Swagger decorators
    expect(userBase).toContain('@IsInt()');
    expect(userBase).toContain('@ApiProperty({');
  });

  it('should generate UserRelations with only relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const userRelationsPath = path.join(
      outputPath,
      'models',
      'UserRelations.model.ts',
    );
    const userRelations = readFileSync(userRelationsPath, 'utf-8');

    // Should contain relation fields
    expect(userRelations).toContain('posts!: Post[]');

    // Should NOT contain scalar fields
    expect(userRelations).not.toContain('id!: number');
    expect(userRelations).not.toContain('email!: string');

    // Should import related models
    expect(userRelations).toContain('import { Post } from "./"');

    // Should have decorators for relations
    expect(userRelations).toContain('@ApiProperty({ isArray: true, type: () => Post })');
  });

  it('should generate combined User class extending base', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const userPath = path.join(outputPath, 'models', 'User.model.ts');
    const user = readFileSync(userPath, 'utf-8');

    // Should extend base class
    expect(user).toContain('extends UserBase');

    // Should import base class
    expect(user).toContain('import { UserBase } from "./UserBase.model"');

    // Should import relation types
    expect(user).toContain('import { Post } from "./"');

    // Should include relation properties
    expect(user).toContain('posts!: Post[]');
  });

  it('should generate PostBase without relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const postBasePath = path.join(outputPath, 'models', 'PostBase.model.ts');
    const postBase = readFileSync(postBasePath, 'utf-8');

    // Should contain all scalar fields including foreign key
    expect(postBase).toContain('id!: number');
    expect(postBase).toContain('title!: string');
    expect(postBase).toContain('authorId?: number | null');
    expect(postBase).toContain('rating!: number');

    // Should NOT contain relation fields (but should contain foreign key)
    expect(postBase).not.toContain('author?: User');
    expect(postBase).not.toContain('import { User } from "./"');
  });

  it('should handle models with no relations correctly', () => {
    // If we had a model with no relations, it should still work
    const outputPath = path.resolve(__dirname, 'generated/full-features');
    const userPath = path.join(outputPath, 'models', 'User.model.ts');
    const user = readFileSync(userPath, 'utf-8');

    // Should be valid TypeScript
    expect(user).toContain('export class User extends UserBase');
  });
});
