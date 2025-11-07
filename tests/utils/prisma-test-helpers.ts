import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let buildPromise: Promise<void> | null = null;

export async function ensureGeneratorBuilt() {
  if (!buildPromise) {
    buildPromise = execAsync('npm run build');
  }
  return buildPromise;
}

interface GenerateOptions {
  schemaPath: string;
  env?: NodeJS.ProcessEnv;
}

export async function runPrismaGenerate(options: GenerateOptions) {
  const { schemaPath, env } = options;
  await execAsync(`npx prisma generate --schema="${schemaPath}"`, {
    env: { ...process.env, ...env },
  });
}
