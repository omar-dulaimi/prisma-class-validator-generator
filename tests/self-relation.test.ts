import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';

const execAsync = promisify(exec);

describe('Self-Relation Generation', () => {
  beforeAll(async () => {
    // Build the generator first
    await execAsync('npm run build');

    // Generate models for self-relation schema
    const schemaPath = path.resolve(__dirname, 'schemas/self-relation.prisma');
    await execAsync(`npx prisma generate --schema="${schemaPath}"`);
  }, 60000);

  it('should generate UserBase class without self-relations', () => {
    const outputPath = path.resolve(__dirname, 'generated/self-relation');
    const userBasePath = path.join(outputPath, 'models', 'UserBase.model.ts');

    expect(existsSync(userBasePath)).toBe(true);
    const userBase = readFileSync(userBasePath, 'utf-8');

    // Should have scalar fields
    expect(userBase).toContain('id!: number');
    expect(userBase).toContain('email!: string');
    expect(userBase).toContain('name?: string');
    expect(userBase).toContain('createdAt!: Date');
    expect(userBase).toContain('mentorId?: number');

    // Should have decorators
    expect(userBase).toContain('@IsInt()');
    expect(userBase).toContain('@IsString()');
    expect(userBase).toContain('@IsDate()');
    expect(userBase).toContain('@IsDefined()');
    expect(userBase).toContain('@IsOptional()');

    // Should NOT have self-relation fields
    expect(userBase).not.toContain('mentor?');
    expect(userBase).not.toContain('mentees');
    expect(userBase).not.toContain('User[]');
  });

  it('should generate UserRelations class with only self-relation fields', () => {
    const outputPath = path.resolve(__dirname, 'generated/self-relation');
    const userRelationsPath = path.join(
      outputPath,
      'models',
      'UserRelations.model.ts',
    );

    expect(existsSync(userRelationsPath)).toBe(true);
    const userRelations = readFileSync(userRelationsPath, 'utf-8');

    // Should have self-relation fields
    expect(userRelations).toContain('mentor?: User');
    expect(userRelations).toContain('mentees!: User[]');

    // Should have class-validator decorators
    expect(userRelations).toContain('@IsOptional()');
    expect(userRelations).toContain('@IsDefined()');

    // Should have Swagger decorators
    expect(userRelations).toContain('@ApiProperty({');
    expect(userRelations).toContain('type: () => User');
    expect(userRelations).toContain('required: false');
    expect(userRelations).toContain('isArray: true');

    // For self-relations in Relations class, should import from the combined model
    expect(userRelations).toContain('import { User } from "./User.model"');

    // Should NOT have scalar fields
    expect(userRelations).not.toContain('id!: number');
    expect(userRelations).not.toContain('email!: string');
    expect(userRelations).not.toContain('mentorId');
  });

  it('should generate combined User class with self-relations', () => {
    const outputPath = path.resolve(__dirname, 'generated/self-relation');
    const userModelPath = path.join(outputPath, 'models', 'User.model.ts');

    expect(existsSync(userModelPath)).toBe(true);
    const userModel = readFileSync(userModelPath, 'utf-8');

    // Should import from UserBase
    expect(userModel).toContain('import { UserBase } from "./UserBase.model"');

    // Should extend UserBase
    expect(userModel).toContain('export class User extends UserBase');

    // Should have self-relation fields with decorators
    expect(userModel).toContain('mentor?: User');
    expect(userModel).toContain('mentees!: User[]');

    // Should have class-validator imports
    expect(userModel).toContain(
      'import { IsOptional, IsDefined } from "class-validator"',
    );

    // Should have Swagger imports
    expect(userModel).toContain(
      'import { ApiProperty } from "@nestjs/swagger"',
    );

    // Should have decorators on relation fields
    expect(userModel).toContain('@IsOptional()');
    expect(userModel).toContain('@IsDefined()');
    expect(userModel).toContain('@ApiProperty({');

    // Should NOT import User from itself (no circular import)
    expect(userModel).not.toContain('import { User } from "./"');
    expect(userModel).not.toContain('import { User } from "./User.model"');
  });

  it('should handle self-relations without circular import issues', () => {
    const outputPath = path.resolve(__dirname, 'generated/self-relation');

    // Check that the index file exports User
    const indexPath = path.join(outputPath, 'models', 'index.ts');
    expect(existsSync(indexPath)).toBe(true);
    const index = readFileSync(indexPath, 'utf-8');

    // When separateRelationFields is enabled, index should export all classes
    expect(index).toContain('export { User } from "./User.model"');
    // Note: UserBase and UserRelations might not be in index if only User is exported
    // This depends on the generator's index generation logic
  });
});
