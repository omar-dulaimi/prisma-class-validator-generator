import type { DMMF as PrismaDMMF } from '@prisma/generator-helper';
import path from 'path';
import { OptionalKind, Project, PropertyDeclarationStructure } from 'ts-morph';
import type { GeneratorConfig } from './prisma-generator';
import {
  generateClassValidatorImport,
  generateEnumImports,
  generateHelpersImports,
  generatePrismaImport,
  generateRelationImportsImport,
  generateSwaggerImport,
  getDecoratorsByFieldType,
  getDecoratorsImportsByType,
  getSwaggerImportsByType,
  getTSDataTypeFromFieldType,
  shouldImportHelpers,
  shouldImportPrisma,
  shouldImportSwagger,
} from './helpers';

export default async function generateClass(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
) {
  if (config.separateRelationFields) {
    generateSeparateRelationClasses(project, config, model);
  } else {
    generateSingleClass(project, config, model);
  }
}

function generateSingleClass(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
) {
  const dirPath = path.resolve(config.outputDir, 'models');
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

  // Add Swagger imports if enabled
  if (
    config.swagger &&
    shouldImportSwagger(model.fields as PrismaDMMF.Field[])
  ) {
    const swaggerImports = getSwaggerImportsByType(
      model.fields as PrismaDMMF.Field[],
    );
    generateSwaggerImport(sourceFile, swaggerImports);
  }
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
            decorators: getDecoratorsByFieldType(field, config.swagger),
          };
        },
      ),
    ],
  });
}

function generateSeparateRelationClasses(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
) {
  // Separate base fields from relation fields
  const baseFields = model.fields.filter((field) => !field.relationName);
  const relationFields = model.fields.filter((field) => field.relationName);

  // Generate base class (without relations)
  generateBaseClass(project, config, model, baseFields);

  // Generate relation class (only relations)
  if (relationFields.length > 0) {
    generateRelationClass(project, config, model, relationFields);
  }

  // Generate combined class that extends base and includes relations
  generateCombinedClass(project, config, model, baseFields, relationFields);
}

function generateBaseClass(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
  fields: PrismaDMMF.Field[],
) {
  const dirPath = path.resolve(config.outputDir, 'models');
  const filePath = path.resolve(dirPath, `${model.name}Base.model.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  const validatorImports = [
    ...new Set(
      fields
        .map((field) => getDecoratorsImportsByType(field))
        .flatMap((item) => item),
    ),
  ];

  if (shouldImportPrisma(fields as PrismaDMMF.Field[])) {
    generatePrismaImport(sourceFile);
  }

  generateClassValidatorImport(sourceFile, validatorImports as Array<string>);

  // Add Swagger imports if enabled
  if (config.swagger && shouldImportSwagger(fields as PrismaDMMF.Field[])) {
    const swaggerImports = getSwaggerImportsByType(
      fields as PrismaDMMF.Field[],
    );
    generateSwaggerImport(sourceFile, swaggerImports);
  }

  if (shouldImportHelpers(fields as PrismaDMMF.Field[])) {
    generateHelpersImports(sourceFile, ['getEnumValues']);
  }

  generateEnumImports(sourceFile, fields as PrismaDMMF.Field[]);

  sourceFile.addClass({
    name: `${model.name}Base`,
    isExported: true,
    properties: [
      ...fields.map<OptionalKind<PropertyDeclarationStructure>>((field) => {
        return {
          name: field.name,
          type: getTSDataTypeFromFieldType(field),
          hasExclamationToken: field.isRequired,
          hasQuestionToken: !field.isRequired,
          trailingTrivia: '\r\n',
          decorators: getDecoratorsByFieldType(field, config.swagger),
        };
      }),
    ],
  });
}

function generateRelationClass(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
  relationFields: PrismaDMMF.Field[],
) {
  const dirPath = path.resolve(config.outputDir, 'models');
  const filePath = path.resolve(dirPath, `${model.name}Relations.model.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  const validatorImports = [
    ...new Set(
      relationFields
        .map((field) => getDecoratorsImportsByType(field))
        .flatMap((item) => item),
    ),
  ];

  generateClassValidatorImport(sourceFile, validatorImports as Array<string>);

  // Add Swagger imports if enabled
  if (
    config.swagger &&
    shouldImportSwagger(relationFields as PrismaDMMF.Field[])
  ) {
    const swaggerImports = getSwaggerImportsByType(
      relationFields as PrismaDMMF.Field[],
    );
    generateSwaggerImport(sourceFile, swaggerImports);
  }

  const relationImports = new Set();
  relationFields.forEach((field) => {
    if (field.relationName && model.name !== field.type) {
      relationImports.add(field.type);
    }
  });

  generateRelationImportsImport(sourceFile, [
    ...relationImports,
  ] as Array<string>);

  sourceFile.addClass({
    name: `${model.name}Relations`,
    isExported: true,
    properties: [
      ...relationFields.map<OptionalKind<PropertyDeclarationStructure>>(
        (field) => {
          return {
            name: field.name,
            type: getTSDataTypeFromFieldType(field),
            hasExclamationToken: field.isRequired,
            hasQuestionToken: !field.isRequired,
            trailingTrivia: '\r\n',
            decorators: getDecoratorsByFieldType(field, config.swagger),
          };
        },
      ),
    ],
  });
}

function generateCombinedClass(
  project: Project,
  config: GeneratorConfig,
  model: PrismaDMMF.Model,
  baseFields: PrismaDMMF.Field[],
  relationFields: PrismaDMMF.Field[],
) {
  const dirPath = path.resolve(config.outputDir, 'models');
  const filePath = path.resolve(dirPath, `${model.name}.model.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  // Import base class
  sourceFile.addImportDeclaration({
    moduleSpecifier: `./${model.name}Base.model`,
    namedImports: [`${model.name}Base`],
  });

  // Import relation types for the combined class
  const relationImports = new Set();
  relationFields.forEach((field) => {
    if (field.relationName && model.name !== field.type) {
      relationImports.add(field.type);
    }
  });

  if (relationImports.size > 0) {
    generateRelationImportsImport(sourceFile, [
      ...relationImports,
    ] as Array<string>);
  }

  // Combined class extends base and includes relations
  if (relationFields.length > 0) {
    sourceFile.addClass({
      name: model.name,
      isExported: true,
      extends: `${model.name}Base`,
      properties: [
        ...relationFields.map<OptionalKind<PropertyDeclarationStructure>>(
          (field) => {
            return {
              name: field.name,
              type: getTSDataTypeFromFieldType(field),
              hasExclamationToken: field.isRequired,
              hasQuestionToken: !field.isRequired,
              trailingTrivia: '\r\n',
            };
          },
        ),
      ],
    });
  } else {
    // If no relations, just extend base
    sourceFile.addClass({
      name: model.name,
      isExported: true,
      extends: `${model.name}Base`,
    });
  }
}
