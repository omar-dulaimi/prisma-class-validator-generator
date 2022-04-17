import { PropertyDeclarationStructure, OptionalKind, Project } from 'ts-morph';
import path from 'path';
import { DMMF as PrismaDMMF } from '@prisma/client/runtime';
import {
  generateClassValidatorImport,
  generateRelationImportsImport,
  getDecoratorsByFieldType,
  getDecoratorsImportsByType,
  getTSDataTypeFromFieldType,
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
