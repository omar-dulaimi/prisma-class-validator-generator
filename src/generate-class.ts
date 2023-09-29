import { PropertyDeclarationStructure, OptionalKind, Project } from 'ts-morph';
import path from 'path';
import type { DMMF as PrismaDMMF } from '@prisma/generator-helper';
import {
  generatePrismaImport,
  generateEnumImports,
  generateHelpersImports,
  shouldImportHelpers,
} from './helpers';
import {
  generateClassValidatorImport,
  generateRelationImportsImport,
  getDecoratorsByFieldType,
  getDecoratorsImportsByType,
  getTSDataTypeFromFieldType,
  shouldImportPrisma,
} from './helpers';

export default async function generateClass(
  project: Project,
  outputDir: string,
  model: PrismaDMMF.Model,
  dmmf: PrismaDMMF.Document,
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

  if (shouldImportPrisma(model.fields)) {
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

  if (shouldImportHelpers(model.fields)) {
    generateHelpersImports(sourceFile, ['getEnumValues']);
  }

  generateEnumImports(sourceFile, model.fields);

  const outputObjectType: PrismaDMMF.OutputType  = dmmf.schema.outputObjectTypes.model.find(outputObjectModel => outputObjectModel.name === model.name);

  // Hacky work around to produce a typed _count value in the output models
  const countIndex = outputObjectType.fields.findIndex((field: PrismaDMMF.SchemaField) => field.name === "_count");
  if (countIndex > -1) {
    const {location, namespace, type} = outputObjectType.fields[countIndex].outputType;
    if (location=== "outputObjectTypes") {
      const outputObjectTypes = dmmf.schema[location][namespace];
      const outputObjectIndex = outputObjectTypes.findIndex((elem: PrismaDMMF.OutputType) => elem.name === type)
      if (outputObjectIndex > -1) {
        const targetModules = outputObjectType.fields.filter(field => field && field.outputType.namespace  === 'model');

        const countOutput: any = {} as object;
        targetModules.forEach(module => countOutput[module.name] = 'number');

        let countTs = `{\r\n`;
        for (const module of targetModules) {
          if (module.outputType && module.outputType.namespace === 'model') {
            countTs += `${module.name}: number;\n`;
          }
        }
        countTs += `}`;
        
        const baseObject = {
          name: '_count',
          kind: 'object',
          isReadOnly: true,
          isRequired: true,
          type: countTs,
          isUnique: false,
          isList: false,
          isId: false,
          hasDefaultValue: false,
        } as PrismaDMMF.Field;
        model.fields.push(baseObject)
      } 
    }
  }
  // end hacky workaround

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
