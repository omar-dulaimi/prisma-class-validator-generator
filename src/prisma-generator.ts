import { EnvValue, GeneratorOptions } from '@prisma/generator-helper';
import { getDMMF, parseEnvValue } from '@prisma/internals';
import { promises as fs } from 'fs';
import path from 'path';
import generateClass from './generate-class';
import generateEnum from './generate-enum';
import { generateHelpersIndexFile } from './generate-helpers';
import { generateEnumsIndexFile, generateModelsIndexFile } from './helpers';
import { project } from './project';
import removeDir from './utils/removeDir';

export interface GeneratorConfig {
  outputDir: string;
  swagger: boolean;
  separateRelationFields: boolean;
}

const SUPPORTED_PRISMA_CLIENT_PROVIDERS = new Set([
  'prisma-client',
  'prisma-client-js',
]);

export async function generate(options: GeneratorOptions) {
  const outputDir = parseEnvValue(options.generator.output as EnvValue);

  const config: GeneratorConfig = {
    outputDir,
    swagger: options.generator.config?.swagger === 'true',
    separateRelationFields:
      options.generator.config?.separateRelationFields === 'true',
  };
  await fs.mkdir(outputDir, { recursive: true });
  await removeDir(outputDir, true);

  const prismaClientProvider = options.otherGenerators.find((it) =>
    SUPPORTED_PRISMA_CLIENT_PROVIDERS.has(parseEnvValue(it.provider)),
  );

  if (!prismaClientProvider) {
    throw new Error(
      'Prisma Class Validator Generator requires a Prisma Client generator with provider "prisma-client" or "prisma-client-js".',
    );
  }

  const prismaClientDmmf = await getDMMF({
    datamodel: options.datamodel,
    previewFeatures: prismaClientProvider?.previewFeatures || [],
  });

  const enumNames = new Set<string>();
  prismaClientDmmf.datamodel.enums.forEach((enumItem) => {
    enumNames.add(enumItem.name);
    generateEnum(project, outputDir, enumItem);
  });

  if (enumNames.size > 0) {
    const enumsIndexSourceFile = project.createSourceFile(
      path.resolve(outputDir, 'enums', 'index.ts'),
      undefined,
      { overwrite: true },
    );
    generateEnumsIndexFile(enumsIndexSourceFile, [...enumNames]);
  }

  prismaClientDmmf.datamodel.models.forEach((model) =>
    generateClass(project, config, model),
  );

  const helpersIndexSourceFile = project.createSourceFile(
    path.resolve(outputDir, 'helpers', 'index.ts'),
    undefined,
    { overwrite: true },
  );
  generateHelpersIndexFile(helpersIndexSourceFile);

  generateModelsIndexFile(prismaClientDmmf, project, outputDir);
  await project.save();
}
