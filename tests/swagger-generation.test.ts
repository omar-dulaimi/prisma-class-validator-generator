import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  ensureGeneratorBuilt,
  runPrismaGenerate,
} from './utils/prisma-test-helpers';

describe('Swagger Generation', () => {
  beforeAll(async () => {
    await ensureGeneratorBuilt();
    const schemaPath = path.resolve(__dirname, 'schemas/swagger.prisma');
    await runPrismaGenerate({ schemaPath });
  }, 60000);

  it('should generate models with Swagger decorators when enabled', () => {
    const outputPath = path.resolve(__dirname, 'generated/swagger');
    const userModelPath = path.join(outputPath, 'models', 'User.model.ts');
    const userModel = readFileSync(userModelPath, 'utf-8');

    // Check for Swagger imports
    expect(userModel).toContain(
      'import { ApiProperty } from "@nestjs/swagger"',
    );

    // Check for ApiProperty decorators
    expect(userModel).toContain('@ApiProperty({');
    expect(userModel).toContain('type: "integer"');
    expect(userModel).toContain('type: "string"');
    expect(userModel).toContain('required: false');
    expect(userModel).toContain('isArray: true');
    expect(userModel).toContain('type: () => Post');
  });

  it('should generate Post model with correct Swagger decorators', () => {
    const outputPath = path.resolve(__dirname, 'generated/swagger');
    const postModelPath = path.join(outputPath, 'models', 'Post.model.ts');
    const postModel = readFileSync(postModelPath, 'utf-8');

    // Check for DateTime format
    expect(postModel).toContain('format: "date-time"');

    // Check for boolean type
    expect(postModel).toContain('type: "boolean"');

    // Check for Float handling
    expect(postModel).toContain('type: "number"');
    expect(postModel).toContain('@IsNumber()');

    // Check for default value examples
    expect(postModel).toContain('example: false');
    expect(postModel).toContain('example: 0');
  });

  it('should include both class-validator and Swagger decorators', () => {
    const outputPath = path.resolve(__dirname, 'generated/swagger');
    const userModelPath = path.join(outputPath, 'models', 'User.model.ts');
    const userModel = readFileSync(userModelPath, 'utf-8');

    // Check for class-validator decorators
    expect(userModel).toContain('@IsInt()');
    expect(userModel).toContain('@IsString()');
    expect(userModel).toContain('@IsDefined()');
    expect(userModel).toContain('@IsOptional()');

    // Check for Swagger decorators
    expect(userModel).toContain('@ApiProperty({');
  });
});

describe('Combined Class with separateRelationFields', () => {
  beforeAll(async () => {
    await ensureGeneratorBuilt();
    const schemaPath = path.resolve(__dirname, 'schemas/full-features.prisma');
    await runPrismaGenerate({ schemaPath });
  }, 60000);

  it('should generate combined class with class-validator and Swagger decorators for relations', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');

    // Check User combined class
    const userModelPath = path.join(outputPath, 'models', 'User.model.ts');
    const userModel = readFileSync(userModelPath, 'utf-8');

    // Check that it imports from UserBase
    expect(userModel).toContain('import { UserBase } from "./UserBase.model"');

    // Check for class-validator imports
    expect(userModel).toContain('import { IsDefined } from "class-validator"');

    // Check for Swagger imports
    expect(userModel).toContain(
      'import { ApiProperty } from "@nestjs/swagger"',
    );

    // Check for relation type imports (from index file)
    expect(userModel).toContain('import { Post } from "./"');

    // Check that class extends UserBase
    expect(userModel).toContain('export class User extends UserBase');

    // Check for relation field with decorators
    expect(userModel).toContain('posts!: Post[]');
    expect(userModel).toContain('@IsDefined()');
    expect(userModel).toContain(
      '@ApiProperty({ isArray: true, type: () => Post })',
    );
  });

  it('should generate Post combined class with decorators for author relation', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');

    // Check Post combined class
    const postModelPath = path.join(outputPath, 'models', 'Post.model.ts');
    const postModel = readFileSync(postModelPath, 'utf-8');

    // Check that it imports from PostBase
    expect(postModel).toContain('import { PostBase } from "./PostBase.model"');

    // Check for class-validator imports for optional relation
    expect(postModel).toContain('import { IsOptional } from "class-validator"');

    // Check for Swagger imports
    expect(postModel).toContain(
      'import { ApiProperty } from "@nestjs/swagger"',
    );

    // Check for relation type imports (from index file)
    expect(postModel).toContain('import { User } from "./"');

    // Check that class extends PostBase
    expect(postModel).toContain('export class Post extends PostBase');

    // Check for optional relation field with decorators
    expect(postModel).toContain('author?: User');
    expect(postModel).toContain('@IsOptional()');
    expect(postModel).toContain(
      '@ApiProperty({ required: false, type: () => User })',
    );
  });

  it('should generate base classes without relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');

    // Check UserBase class
    const userBasePath = path.join(outputPath, 'models', 'UserBase.model.ts');
    const userBase = readFileSync(userBasePath, 'utf-8');

    // Should have scalar fields with decorators
    expect(userBase).toContain('@IsInt()');
    expect(userBase).toContain('@IsString()');
    expect(userBase).toContain('@ApiProperty({');
    expect(userBase).toContain('id!: number');
    expect(userBase).toContain('email!: string');
    expect(userBase).toContain('name?: string');

    // Should NOT have relation fields
    expect(userBase).not.toContain('posts');
    expect(userBase).not.toContain('Post[]');
  });

  it('should generate relation classes with only relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/full-features');

    // Check UserRelations class
    const userRelationsPath = path.join(
      outputPath,
      'models',
      'UserRelations.model.ts',
    );

    // Check if file exists
    expect(existsSync(userRelationsPath)).toBe(true);

    const userRelations = readFileSync(userRelationsPath, 'utf-8');

    // Should have relation field with decorators
    expect(userRelations).toContain('export class UserRelations');
    expect(userRelations).toContain('posts!: Post[]');
    expect(userRelations).toContain('@IsDefined()');
    expect(userRelations).toContain('@ApiProperty({');

    // Should NOT have scalar fields
    expect(userRelations).not.toContain('id!: number');
    expect(userRelations).not.toContain('email!: string');
  });
});
