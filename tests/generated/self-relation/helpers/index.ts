
    type EnumLike = Array<unknown> | Record<string, unknown>;

    export function getEnumValues<T extends EnumLike>(enumType: T): Array<string> {
      return [
        ...new Set(
          Object.entries(enumType)
            .filter(([key]) => !~~key)
            .flatMap((item) => item)
        ),
      ] as Array<string>;
    }  
  
