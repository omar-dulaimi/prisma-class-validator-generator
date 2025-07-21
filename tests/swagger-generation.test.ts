import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';

const execAsync = promisify(exec);

describe('Swagger Generation', () => {
  beforeAll(async () => {
    // Build the generator first
    await execAsync('npm run build');

    // Generate models for swagger schema
    const schemaPath = path.resolve(__dirname, 'schemas/swagger.prisma');
    await execAsync(`npx prisma generate --schema="${schemaPath}"`);
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
