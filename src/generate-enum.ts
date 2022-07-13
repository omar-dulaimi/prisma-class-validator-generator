import type { DMMF as PrismaDMMF } from '@prisma/generator-helper';
import { EnumMemberStructure, OptionalKind, Project } from 'ts-morph';
import path from 'path';

export default function generateEnum(
  project: Project,
  outputDir: string,
  enumItem: PrismaDMMF.DatamodelEnum,
) {
  const dirPath = path.resolve(outputDir, 'enums');
  const filePath = path.resolve(dirPath, `${enumItem.name}.enum.ts`);
  const sourceFile = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });

  sourceFile.addEnum({
    isExported: true,
    name: enumItem.name,
    members: enumItem.values.map<OptionalKind<EnumMemberStructure>>(
      ({ name }) => ({
        name,
        value: name,
      }),
    ),
  });
}
