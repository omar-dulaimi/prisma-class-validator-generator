import {
  getTSDataTypeFromFieldType,
  getDecoratorsByFieldType,
  getDecoratorsImportsByType,
  generateEnumImports
} from '../../src/helpers';
import { DMMF } from '@prisma/generator-helper';
import { Project } from 'ts-morph';

describe('helpers', () => {
  describe('getTSDataTypeFromFieldType', () => {
    test('returns correct type for Int', () => {
      const field = { 
        name: 'id',
        type: 'Int', 
        kind: 'scalar',
        isRequired: true,
        isList: false
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('number');
    });

    test('returns correct type for String', () => {
      const field = { 
        name: 'name',
        type: 'String', 
        kind: 'scalar',
        isRequired: true,
        isList: false
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('string');
    });

    test('returns correct type for Boolean', () => {
      const field = { 
        name: 'isActive',
        type: 'Boolean', 
        kind: 'scalar',
        isRequired: true,
        isList: false
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('boolean');
    });

    test('returns correct type for DateTime', () => {
      const field = { 
        name: 'createdAt',
        type: 'DateTime', 
        kind: 'scalar',
        isRequired: true,
        isList: false
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('Date');
    });

    test('handles list types', () => {
      const field = { 
        name: 'tags',
        type: 'String', 
        kind: 'scalar',
        isRequired: true,
        isList: true
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('string[]');
    });

    test('handles enum types', () => {
      const field = { 
        name: 'role',
        type: 'Role', 
        kind: 'enum',
        isRequired: true,
        isList: false
      } as DMMF.Field;
      
      expect(getTSDataTypeFromFieldType(field)).toBe('Role');
    });
  });

  describe('getDecoratorsByFieldType', () => {
    test('returns correct decorators for Int type', () => {
      const field = {
        name: 'id',
        kind: 'scalar',
        type: 'Int',
        isRequired: true,
        isList: false,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toContainEqual({ name: 'IsInt', arguments: [] });
      expect(decorators).toContainEqual({ name: 'IsDefined', arguments: [] });
    });

    test('returns correct decorators for String type', () => {
      const field = {
        name: 'name',
        kind: 'scalar',
        type: 'String',
        isRequired: true,
        isList: false,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toContainEqual({ name: 'IsString', arguments: [] });
      expect(decorators).toContainEqual({ name: 'IsDefined', arguments: [] });
    });

    test('returns correct decorators for optional fields', () => {
      const field = {
        name: 'description',
        kind: 'scalar',
        type: 'String',
        isRequired: false,
        isList: false,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toContainEqual({ name: 'IsOptional', arguments: [] });
      expect(decorators).toContainEqual({ name: 'IsString', arguments: [] });
    });

    test('uses IsArray and each option for scalar list fields', () => {
      const field = {
        name: 'allowedServiceTypes',
        kind: 'scalar',
        type: 'String',
        isRequired: true,
        isList: true,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toEqual([
        { name: 'IsDefined', arguments: [] },
        { name: 'IsArray', arguments: [] },
        { name: 'IsString', arguments: ['{ each: true }'] },
      ]);
    });

    test('uses ValidateNested for relation list fields', () => {
      const field = {
        name: 'posts',
        kind: 'object',
        type: 'Post',
        isRequired: true,
        isList: true,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toEqual([
        { name: 'IsDefined', arguments: [] },
        { name: 'IsArray', arguments: [] },
        { name: 'ValidateNested', arguments: ['{ each: true }'] },
      ]);
    });

    test('uses IsIn with each option for enum list fields', () => {
      const field = {
        name: 'labels',
        kind: 'enum',
        type: 'Role',
        isRequired: true,
        isList: true,
      } as DMMF.Field;

      const decorators = getDecoratorsByFieldType(field);
      expect(decorators).toEqual([
        { name: 'IsDefined', arguments: [] },
        { name: 'IsArray', arguments: [] },
        {
          name: 'IsIn',
          arguments: ['getEnumValues(Role)', '{ each: true }'],
        },
      ]);
    });
  });

  describe('getDecoratorsImportsByType', () => {
    test('returns correct imports for given fields', () => {
      const field = { 
        name: 'id',
        kind: 'scalar', 
        type: 'Int', 
        isRequired: true, 
        isList: false 
      } as DMMF.Field;

      const imports = getDecoratorsImportsByType(field);
      
      expect(imports).toContain('IsInt');
      expect(imports).toContain('IsDefined');
    });

    test('returns IsOptional for optional fields', () => {
      const field = { 
        name: 'name',
        kind: 'scalar', 
        type: 'String', 
        isRequired: false, 
        isList: false 
      } as DMMF.Field;

      const imports = getDecoratorsImportsByType(field);
      
      expect(imports).toContain('IsString');
      expect(imports).toContain('IsOptional');
    });

    test('returns IsIn for enum fields', () => {
      const field = { 
        name: 'role',
        kind: 'enum', 
        type: 'Role', 
        isRequired: true, 
        isList: false 
      } as DMMF.Field;

      const imports = getDecoratorsImportsByType(field);
      
      expect(imports).toContain('IsIn');
      expect(imports).toContain('IsDefined');
    });

    test('returns IsArray and ValidateNested for relation lists', () => {
      const field = {
        name: 'posts',
        kind: 'object',
        type: 'Post',
        isRequired: true,
        isList: true,
      } as DMMF.Field;

      const imports = getDecoratorsImportsByType(field);
      expect(imports).toContain('IsArray');
      expect(imports).toContain('ValidateNested');
      expect(imports).toContain('IsDefined');
    });
  });

  describe('generateEnumImports', () => {
    const makeSourceFile = () => {
      const project = new Project({ useInMemoryFileSystem: true });
      return project.createSourceFile('model.ts', '');
    };

    test('emits unique enum imports when multiple fields share an enum type', () => {
      const fields = [
        {
          name: 'previousStatus',
          type: 'ServiceApprovalStatus',
          kind: 'enum',
          isRequired: false,
          isList: false,
        },
        {
          name: 'newStatus',
          type: 'ServiceApprovalStatus',
          kind: 'enum',
          isRequired: true,
          isList: false,
        },
        {
          name: 'changeReason',
          type: 'ApprovalChangeReason',
          kind: 'enum',
          isRequired: true,
          isList: false,
        },
      ] as unknown as DMMF.Field[];

      const sourceFile = makeSourceFile();
      generateEnumImports(sourceFile, fields);

      const [decl] = sourceFile.getImportDeclarations();
      const names = decl.getNamedImports().map((n) => n.getName());

      expect(decl.getModuleSpecifierValue()).toBe('../enums');
      expect(names).toEqual(['ServiceApprovalStatus', 'ApprovalChangeReason']);
    });

    test('emits distinct enum imports when each field has a different enum type', () => {
      const fields = [
        {
          name: 'status',
          type: 'InvoiceStatus',
          kind: 'enum',
          isRequired: true,
          isList: false,
        },
        {
          name: 'rpType',
          type: 'ResponsiblePartyType',
          kind: 'enum',
          isRequired: true,
          isList: false,
        },
      ] as unknown as DMMF.Field[];

      const sourceFile = makeSourceFile();
      generateEnumImports(sourceFile, fields);

      const [decl] = sourceFile.getImportDeclarations();
      const names = decl.getNamedImports().map((n) => n.getName());
      expect(names).toEqual(['InvoiceStatus', 'ResponsiblePartyType']);
    });

    test('skips the import declaration entirely when no fields are enums', () => {
      const fields = [
        {
          name: 'id',
          type: 'Int',
          kind: 'scalar',
          isRequired: true,
          isList: false,
        },
      ] as unknown as DMMF.Field[];

      const sourceFile = makeSourceFile();
      generateEnumImports(sourceFile, fields);

      expect(sourceFile.getImportDeclarations()).toHaveLength(0);
    });
  });
});