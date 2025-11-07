import { beforeEach, afterEach } from 'vitest';

const baseEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...baseEnv } as NodeJS.ProcessEnv;
});

afterEach(() => {
  process.env = { ...baseEnv } as NodeJS.ProcessEnv;
});
