import { DMMF as PrismaDMMF } from '@prisma/client/runtime';
import path from 'path';
import {
  ExportDeclarationStructure,
  OptionalKind,
  SourceFile,
  DecoratorStructure,
  Project,
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

export const getTSDataTypeFromFieldType = (field: PrismaDMMF.Field) => {
  let type = field.type;
  switch (field.type) {
    case 'Int':
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
  }
  return type;
};

export const getDecoratorsByFieldType = (field: PrismaDMMF.Field) => {
  const decorators: OptionalKind<DecoratorStructure>[] = [];
  switch (field.type) {
    case 'Int':
      decorators.push({
        name: 'IsInt()',
      });
      break;
    case 'DateTime':
      decorators.push({
        name: 'IsDate()',
      });
      break;
    case 'String':
      decorators.push({
        name: 'IsString()',
      });
      break;
    case 'Boolean':
      decorators.push({
        name: 'IsBoolean()',
      });
      break;
  }
  if (field.isRequired) {
    decorators.unshift({
      name: 'IsDefined()',
    });
  }
  return decorators;
};

export const getDecoratorsImportsByType = (field: PrismaDMMF.Field) => {
  const validatorImports = new Set();
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
  if (field.isRequired) {
    validatorImports.add('IsDefined');
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

export const generateRelationImportsImport = (
  sourceFile: SourceFile,
  relationImports: Array<string>,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: './',
    namedImports: relationImports,
  });
};
