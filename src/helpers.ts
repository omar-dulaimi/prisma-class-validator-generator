import type { DMMF as PrismaDMMF } from '@prisma/generator-helper';
import path from 'path';
import {
  DecoratorStructure,
  ExportDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
} from 'ts-morph';

export const generateModelsIndexFile = (
  prismaClientDmmf: PrismaDMMF.Document,
  project: Project,
  outputDir: string,
) => {
  const modelsBarrelExportSourceFile = project.createSourceFile(
    path.resolve(outputDir, 'models', 'index.ts'),
    undefined,
    { overwrite: true },
  );

  modelsBarrelExportSourceFile.addExportDeclarations(
    prismaClientDmmf.datamodel.models
      .map((model) => model.name)
      .sort()
      .map<OptionalKind<ExportDeclarationStructure>>((modelName) => ({
        moduleSpecifier: `./${modelName}.model`,
        namedExports: [modelName],
      })),
  );
};

export const shouldImportPrisma = (fields: PrismaDMMF.Field[]) => {
  return fields.some((field) => ['Decimal', 'Json'].includes(field.type));
};

export const shouldImportHelpers = (fields: PrismaDMMF.Field[]) => {
  return fields.some((field) => ['enum'].includes(field.kind));
};

export const getTSDataTypeFromFieldType = (field: PrismaDMMF.Field) => {
  let type = field.type;
  switch (field.type) {
    case 'Int':
    case 'Float':
      type = 'number';
      break;
    case 'DateTime':
      type = 'Date';
      break;
    case 'String':
      type = 'string';
      break;
    case 'Boolean':
      type = 'boolean';
      break;
    case 'Decimal':
      type = 'Prisma.Decimal';
      break;
    case 'Json':
      type = 'Prisma.JsonValue';
      break;
    case 'Bytes':
      type = 'Buffer';
      break;
  }

  if (field.isList) {
    type = `${type}[]`;
  }
  if (!field.isRequired) {
    type += ' | null';
  }
  return type;
};

export const getDecoratorsByFieldType = (field: PrismaDMMF.Field) => {
  const decorators: OptionalKind<DecoratorStructure>[] = [];

  if (field.isRequired) {
    decorators.push({ name: 'IsDefined', arguments: [] });
  } else {
    decorators.push({ name: 'IsOptional', arguments: [] });
  }

  if (field.isList) {
    decorators.push({ name: 'IsArray', arguments: [] });
  }

  const eachArgs: string[] = field.isList ? ['{ each: true }'] : [];

  if (field.kind === 'enum') {
    decorators.push({
      name: 'IsIn',
      arguments: field.isList
        ? [`getEnumValues(${String(field.type)})`, '{ each: true }']
        : [`getEnumValues(${String(field.type)})`],
    });
    return decorators;
  }

  if (field.kind === 'object') {
    if (field.isList) {
      decorators.push({
        name: 'ValidateNested',
        arguments: ['{ each: true }'],
      });
    }
    return decorators;
  }

  switch (field.type) {
    case 'Int':
      decorators.push({
        name: 'IsInt',
        arguments: eachArgs,
      });
      break;
    case 'DateTime':
      decorators.push({
        name: 'IsDate',
        arguments: eachArgs,
      });
      break;
    case 'String':
      decorators.push({
        name: 'IsString',
        arguments: eachArgs,
      });
      break;
    case 'Boolean':
      decorators.push({
        name: 'IsBoolean',
        arguments: eachArgs,
      });
      break;
  }

  return decorators;
};

export const getDecoratorsImportsByType = (field: PrismaDMMF.Field) => {
  const validatorImports = new Set<string>();

  if (field.kind === 'enum') {
    validatorImports.add('IsIn');
  } else if (field.kind === 'object') {
    if (field.isList) {
      validatorImports.add('ValidateNested');
    }
  } else {
    switch (field.type) {
      case 'Int':
        validatorImports.add('IsInt');
        break;
      case 'DateTime':
        validatorImports.add('IsDate');
        break;
      case 'String':
        validatorImports.add('IsString');
        break;
      case 'Boolean':
        validatorImports.add('IsBoolean');
        break;
    }
  }

  if (field.isList) {
    validatorImports.add('IsArray');
  }

  if (field.isRequired) {
    validatorImports.add('IsDefined');
  } else {
    validatorImports.add('IsOptional');
  }

  return [...validatorImports];
};

export const generateClassValidatorImport = (
  sourceFile: SourceFile,
  validatorImports: Array<string>,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'class-validator',
    namedImports: validatorImports,
  });
};

export const generatePrismaImport = (sourceFile: SourceFile) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@prisma/client',
    namedImports: ['Prisma'],
  });
};

export const generateRelationImportsImport = (
  sourceFile: SourceFile,
  relationImports: Array<string>,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: './',
    namedImports: relationImports,
    isTypeOnly: true,
  });
};
export const generateHelpersImports = (
  sourceFile: SourceFile,
  helpersImports: Array<string>,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: '../helpers',
    namedImports: helpersImports,
  });
};

export const generateEnumImports = (
  sourceFile: SourceFile,
  fields: PrismaDMMF.Field[],
) => {
  // Dedupe: models with multiple fields of the same enum type (e.g. a history
  // table with previousStatus + newStatus both typed to the same enum) would
  // otherwise produce duplicate named imports and fail to compile.
  const enumsToImport = Array.from(
    new Set(
      fields
        .filter((field) => field.kind === 'enum')
        .map((field) => field.type),
    ),
  );

  if (enumsToImport.length > 0) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '../enums',
      namedImports: enumsToImport,
    });
  }
};

export function generateEnumsIndexFile(
  sourceFile: SourceFile,
  enumNames: string[],
) {
  sourceFile.addExportDeclarations(
    enumNames.sort().map<OptionalKind<ExportDeclarationStructure>>((name) => ({
      moduleSpecifier: `./${name}.enum`,
      namedExports: [name],
    })),
  );
}
