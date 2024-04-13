import type { DMMF as PrismaDMMF } from '@prisma/generator-helper';
import path from 'path';
import { OptionalKind, Project, PropertyDeclarationStructure } from 'ts-morph';
import {
  generateClassValidatorImport,
  generateEnumImports,
  generateHelpersImports,
  generatePrismaImport,
  generateRelationImportsImport,
  getDecoratorsByFieldType,
  getDecoratorsImportsByType,
  getTSDataTypeFromFieldType,
  shouldImportHelpers,
  shouldImportPrisma,
} from './helpers';

export default async function generateClass(
  project: Project,
  outputDir: string,
  model: PrismaDMMF.Model,
) {
  const dirPath = path.resolve(outputDir, 'models');
  const filePath = path.resolve(dirPath, `${model.name}.model.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  const validatorImports = [
    ...new Set(
      model.fields
        .map((field) => getDecoratorsImportsByType(field))
        .flatMap((item) => item),
    ),
  ];

  if (shouldImportPrisma(model.fields as PrismaDMMF.Field[])) {
    generatePrismaImport(sourceFile);
  }

  generateClassValidatorImport(sourceFile, validatorImports as Array<string>);
  const relationImports = new Set();
  model.fields.forEach((field) => {
    if (field.relationName && model.name !== field.type) {
      relationImports.add(field.type);
    }
  });

  generateRelationImportsImport(sourceFile, [
    ...relationImports,
  ] as Array<string>);

  if (shouldImportHelpers(model.fields as PrismaDMMF.Field[])) {
    generateHelpersImports(sourceFile, ['getEnumValues']);
  }

  generateEnumImports(sourceFile, model.fields as PrismaDMMF.Field[]);

  sourceFile.addClass({
    name: model.name,
    isExported: true,
    properties: [
      ...model.fields.map<OptionalKind<PropertyDeclarationStructure>>(
        (field) => {
          return {
            name: field.name,
            type: getTSDataTypeFromFieldType(field),
            hasExclamationToken: field.isRequired,
            hasQuestionToken: !field.isRequired,
            trailingTrivia: '\r\n',
            decorators: getDecoratorsByFieldType(field),
          };
        },
      ),
    ],
  });
}
