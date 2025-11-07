import { existsSync } from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import {
  ensureGeneratorBuilt,
  runPrismaGenerate,
} from './utils/prisma-test-helpers';

const schemaPath = path.resolve(
  __dirname,
  'schemas/prisma-client-js-provider.prisma',
);
const classValidatorOutput = path.resolve(
  __dirname,
  'generated/providers/prisma-client-js-class-validator',
);

describe('Prisma Client JS generator provider', () => {
  beforeAll(async () => {
    await ensureGeneratorBuilt();
  }, 60000);

  it('generates artifacts when using provider = "prisma-client-js"', async () => {
    await runPrismaGenerate({ schemaPath });

    expect(
      existsSync(path.join(classValidatorOutput, 'models', 'User.model.ts')),
    ).toBe(true);
    expect(
      existsSync(path.join(classValidatorOutput, 'helpers', 'index.ts')),
    ).toBe(true);
  });
});
