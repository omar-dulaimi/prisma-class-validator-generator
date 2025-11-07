import { existsSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  ensureGeneratorBuilt,
  runPrismaGenerate,
} from './utils/prisma-test-helpers';

const schemaPath = path.resolve(
  __dirname,
  'schemas/prisma-client-provider.prisma',
);
const classValidatorOutput = path.resolve(
  __dirname,
  'generated/providers/prisma-client-class-validator',
);
const prismaClientOutput = path.resolve(
  __dirname,
  'generated/providers/prisma-client',
);

describe('Prisma Client generator provider', () => {
  beforeAll(async () => {
    await ensureGeneratorBuilt();
  }, 60000);

  it('generates artifacts when using provider = "prisma-client"', async () => {
    await runPrismaGenerate({ schemaPath });

    expect(
      existsSync(path.join(classValidatorOutput, 'models', 'User.model.ts')),
    ).toBe(true);
    expect(
      existsSync(path.join(classValidatorOutput, 'helpers', 'index.ts')),
    ).toBe(true);
    expect(existsSync(prismaClientOutput)).toBe(true);
  });
});
