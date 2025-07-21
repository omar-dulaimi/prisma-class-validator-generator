# CLAUDE.md

This file provides guidance to when working with code in this repository.

## Common Development Commands

### Build and Development
- `npm run build` - Compile TypeScript source files from src/ to lib/
- `npm run start` - Build and run Prisma generate (builds lib/ directory and generates models)
- `npx prisma generate` - Generate class validator models using the local generator

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:ci` - Run tests once with coverage for CI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:type-check` - Run TypeScript type checking without emitting files

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted correctly

### Publishing
- `npm run package:publish` - Build package and publish to npm (runs package.sh script)

### Testing Generator Locally
- Use test schemas in tests/schemas/ with `npx prisma generate --schema=tests/schemas/basic.prisma`
- Generated models appear in tests/generated/ directory for testing
- Main example in prisma/schema.prisma generates to prisma/generated/models/

## Architecture Overview

This is a Prisma generator that creates TypeScript class validator models from Prisma schema definitions. The generator integrates with Prisma's generation pipeline to automatically create class-validator decorated TypeScript classes.

### Core Architecture
- **Entry Point**: `src/index.ts` - Sets up the Prisma generator handler
- **Main Generator**: `src/prisma-generator.ts` - Orchestrates the generation process
- **Class Generation**: `src/generate-class.ts` - Creates individual model classes with decorators
- **Enum Generation**: `src/generate-enum.ts` - Handles Prisma enum generation
- **Helpers**: `src/helpers.ts` - Utility functions for decorators, imports, and type mapping

### Generation Flow
1. Generator reads Prisma DMMF (Data Model Meta Format)
2. Creates output directory structure (models/, enums/, helpers/)
3. Generates class validator decorators based on Prisma field types
4. Creates TypeScript classes with proper imports and type definitions
5. Generates index files for easy importing

### Key Components
- **Field Type Mapping**: Maps Prisma types to TypeScript types and class-validator decorators
- **Relation Handling**: Manages model relationships and circular import resolution
- **Decorator Generation**: Applies appropriate class-validator decorators (@IsString, @IsInt, etc.)
- **Project Structure**: Uses ts-morph for TypeScript AST manipulation

### Output Structure
```
generated/
├── models/
│   ├── User.model.ts
│   ├── Post.model.ts
│   └── index.ts
├── enums/
│   └── index.ts
└── helpers/
    └── index.ts
```

The generator is configured via Prisma schema:
```prisma
generator class_validator {
  provider = "prisma-class-validator-generator"
  output   = "./generated"  // optional, defaults to ./generated
}
```

## Modern Development Setup (Prisma 6+)

### Key Changes in Prisma 6
- **Bytes fields**: Now generate `Uint8Array` instead of `Buffer` (breaking change handled)
- **Node.js requirements**: Minimum Node 18.18+, 20.9+, or 22.11+
- **TypeScript**: Minimum version 5.1.0, using 5.8.3

### Testing Infrastructure
- **Vitest**: Modern test runner with coverage support
- **Test Schemas**: Multiple schema files in tests/schemas/ for different scenarios
- **CI/CD**: GitHub Actions with Node 18/20/22 matrix testing
- **Automated Releases**: Tag-based releases to npm with GitHub releases

### Code Quality Tools
- **Prettier**: Consistent code formatting
- **TypeScript strict mode**: Enhanced type safety
- **Coverage reporting**: Comprehensive test coverage tracking