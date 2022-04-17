import { SourceFile } from 'ts-morph';

export function generateHelpersIndexFile(sourceFile: SourceFile) {
  sourceFile.addStatements(/* ts */ `
    export function getEnumValues<T>(enumType: T): Array<string> {
      return [
        ...new Set(
          Object.entries(enumType)
            .filter(([key]) => !~~key)
            .flatMap((item) => item),
        ),
      ]
    }
  `);
}
