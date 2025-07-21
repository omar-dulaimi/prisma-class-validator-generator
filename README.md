# Prisma Class Validator Generator

[![NPM Version](https://img.shields.io/npm/v/prisma-class-validator-generator?style=for-the-badge&logo=npm&color=blue)](https://www.npmjs.com/package/prisma-class-validator-generator)
[![NPM Downloads](https://img.shields.io/npm/dm/prisma-class-validator-generator?style=for-the-badge&logo=npm&color=green)](https://www.npmjs.com/package/prisma-class-validator-generator)
[![GitHub Stars](https://img.shields.io/github/stars/omar-dulaimi/prisma-class-validator-generator?style=for-the-badge&logo=github&color=yellow)](https://github.com/omar-dulaimi/prisma-class-validator-generator/stargazers)
[![License](https://img.shields.io/github/license/omar-dulaimi/prisma-class-validator-generator?style=for-the-badge&color=purple)](https://github.com/omar-dulaimi/prisma-class-validator-generator/blob/master/LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen?style=for-the-badge)](https://github.com/omar-dulaimi/prisma-class-validator-generator)

<div align="center">
  <h3 align="center">🏗️ Prisma Class Validator Generator</h3>
  <p align="center">
    <strong>Automatically generate TypeScript class-validator models from your Prisma schema</strong><br>
    Create type-safe validation classes with decorators from your database models
  </p>
  
  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-examples">Examples</a> •
    <a href="#-features">Features</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

## 💖 Support This Project

If this tool helps you build better applications, please consider supporting its development:

<p align="center">
  <a href="https://github.com/sponsors/omar-dulaimi">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="GitHub Sponsors" height="40">
  </a>
</p>

Your sponsorship helps maintain and improve this project. Thank you! 🙏

## 🧪 Beta Testing - v6.0.0-beta.1

**Try the latest beta with enhanced Prisma 6 support!**

```bash
npm install prisma-class-validator-generator@beta
```

This beta includes **major upgrades for Prisma 6.x compatibility** - bringing full support for the latest Prisma features including proper Uint8Array handling for Bytes fields and modern Node.js requirements. 

**What to test:**
- ✅ Prisma 6.12+ schema generation
- ✅ Uint8Array support for Bytes fields  
- ✅ Complex schemas with enums and relations
- ✅ TypeScript 5.8+ compatibility

Please test in development and [report any issues](https://github.com/omar-dulaimi/prisma-class-validator-generator/issues). Your feedback helps us deliver a stable v6.0.0 release!

## ✨ Features

- 🏗️ **Auto-generation** - Automatically generates TypeScript models with class-validator decorators
- 🔧 **Prisma 6 support** - Full compatibility with the latest Prisma features and types
- 🎯 **Type safety** - Perfect TypeScript integration with proper type inference
- 📝 **Smart decorators** - Intelligent mapping of Prisma types to class-validator decorators
- 🔄 **Incremental updates** - Regenerates only when schema changes
- 🚀 **Zero config** - Works out of the box with sensible defaults
- 🛡️ **Production ready** - Battle-tested with comprehensive test coverage
- 📦 **Lightweight** - Minimal dependencies and fast generation

## 🚀 Quick Start

### Installation

```bash
# npm
npm install prisma-class-validator-generator

# yarn
yarn add prisma-class-validator-generator

# pnpm
pnpm add prisma-class-validator-generator
```

### Basic Setup

1. Add the generator to your Prisma schema:

```prisma
generator class_validator {
  provider = "prisma-class-validator-generator"
  output   = "./generated"  // optional, defaults to ./generated
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  content   String?
  published Boolean  @default(false)
  viewCount Int      @default(0)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
  rating    Float
}
```

2. Generate your models:

```bash
npx prisma generate
```

3. Use the generated classes:

```typescript
import { User } from './generated/models';
import { validate } from 'class-validator';

const user = new User();
user.id = 1;
user.email = 'user@example.com';
user.name = 'John Doe';

const errors = await validate(user);
if (errors.length > 0) {
  console.log('Validation failed:', errors);
} else {
  console.log('User is valid!');
}
```

## 📋 Version Compatibility

| Prisma Version | Generator Version | Maintained |
|----------------|-------------------|------------|
| **v6.x** | **v6.0.0-beta.1** | ✅ **Active** |
| v5.x | v5.0.0 | ❌ No |
| v4.x | v0.2.0 - v4.x | ❌ No |
| v2-3.x | v0.1.x | ❌ No |

### 🧪 Beta Release - v6.0.0-beta.1

**Currently in development!** This version brings full Prisma 6 compatibility:

- **Prisma 6 Support** - Full compatibility with Prisma 6.12+ features
- **Uint8Array Support** - Proper handling of Bytes fields as Uint8Array (breaking change from Buffer)
- **Node.js 18+** - Modern Node.js support (18.18+, 20.9+, 22.11+)
- **TypeScript 5.8** - Latest TypeScript features and optimizations
- **Enhanced Testing** - Comprehensive test suite with Vitest and 95%+ coverage
- **Performance Improvements** - Faster generation with optimized AST manipulation

> **Note**: This beta version is currently in development. The stable v5.0.0 supports Prisma 5.x.

## 🎯 Generated Output

The generator creates TypeScript classes with appropriate class-validator decorators:

### User.model.ts
```typescript
import { IsInt, IsDefined, IsString, IsOptional } from "class-validator";
import { Post } from "./Post.model";

export class User {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    email!: string;

    @IsOptional()
    @IsString()
    name?: string | null;

    @IsDefined()
    posts!: Post[];
}
```

### Post.model.ts
```typescript
import { IsInt, IsDefined, IsDate, IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { User } from "./User.model";

export class Post {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsDefined()
    @IsDate()
    updatedAt!: Date;

    @IsDefined()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    content?: string | null;

    @IsDefined()
    @IsBoolean()
    published!: boolean;

    @IsDefined()
    @IsInt()
    viewCount!: number;

    @IsOptional()
    author?: User | null;

    @IsOptional()
    @IsInt()
    authorId?: number | null;

    @IsDefined()
    @IsNumber()
    rating!: number;
}
```

## 🔧 Configuration Options

Customize the generator behavior:

```prisma
generator class_validator {
  provider               = "prisma-class-validator-generator"
  output                 = "./src/models"           // Output directory
  swagger                = "true"                   // Add Swagger decorators
  separateRelationFields = "true"                   // Split base/relation classes
}
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output` | `string` | `"./generated"` | Output directory for generated models |
| `swagger` | `string` | `"false"` | Add NestJS `@ApiProperty` decorators for Swagger docs |
| `separateRelationFields` | `string` | `"false"` | Generate separate base and relation classes for flexible DTOs |

### 🌟 New in v6.0.0-beta.1: NestJS & Swagger Integration

#### Swagger Support (`swagger = "true"`)

Automatically generates NestJS Swagger decorators alongside class-validator decorators:

```typescript
export class User {
  @IsDefined()
  @ApiProperty({ example: 'Generated by autoincrement', type: "integer" })
  @IsInt()
  id!: number;

  @IsDefined()
  @ApiProperty({ type: "string" })
  @IsString()
  email!: string;

  @IsOptional()
  @ApiProperty({ type: "string", required: false })
  @IsString()
  name?: string | null;
}
```

#### Relation Field Splitting (`separateRelationFields = "true"`)

Perfect for NestJS DTOs - generates separate classes for maximum flexibility:

- **`UserBase.model.ts`** - Only scalar fields with validation decorators
- **`UserRelations.model.ts`** - Only relation fields  
- **`User.model.ts`** - Combined class extending UserBase

This enables powerful NestJS patterns:
```typescript
// Create DTO without relations using PickType
export class CreateUserDto extends PickType(UserBase, ['email', 'name']) {}

// Update DTO with partial fields
export class UpdateUserDto extends PartialType(UserBase) {}

// Full model with relations for responses
export class UserResponseDto extends User {}
```

## 📚 Advanced Usage

### Complex Schema Example

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  profile   Profile?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  avatar Bytes?
  user   User   @relation(fields: [userId], references: [id])
  userId String @unique
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   String?
  published Boolean   @default(false)
  tags      String[]
  metadata  Json?
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### Generated Enum

```typescript
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}
```

### Generated Models with Advanced Types

```typescript
import { IsString, IsDefined, IsEmail, IsOptional, IsEnum, IsDate } from "class-validator";
import { Role } from "../enums";
import { Profile } from "./Profile.model";
import { Post } from "./Post.model";

export class User {
    @IsDefined()
    @IsString()
    id!: string;

    @IsDefined()
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    name?: string | null;

    @IsDefined()
    @IsEnum(Role)
    role!: Role;

    @IsOptional()
    profile?: Profile | null;

    @IsDefined()
    posts!: Post[];

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsDefined()
    @IsDate()
    updatedAt!: Date;
}
```

## 🧪 Testing

The generator includes comprehensive tests covering:

- Basic model generation
- Complex schemas with relations
- Enum generation
- Edge cases and error handling
- TypeScript compilation

Run tests:

```bash
npm test           # Run tests in watch mode
npm run test:ci    # Run tests once with coverage
npm run test:coverage  # Generate coverage report
```

## 🔍 Type Mapping

The generator intelligently maps Prisma types to class-validator decorators:

| Prisma Type | TypeScript Type | Class Validator Decorator |
|-------------|-----------------|---------------------------|
| `String` | `string` | `@IsString()` |
| `Int` | `number` | `@IsInt()` |
| `Float` | `number` | `@IsNumber()` |
| `Boolean` | `boolean` | `@IsBoolean()` |
| `DateTime` | `Date` | `@IsDate()` |
| `Bytes` | `Uint8Array` | `@IsDefined()` |
| `Json` | `any` | `@IsDefined()` |
| `String[]` | `string[]` | `@IsArray()` |
| `Enum` | `EnumType` | `@IsEnum(EnumType)` |
| Optional fields | `type \| null` | `@IsOptional()` |
| Required fields | `type` | `@IsDefined()` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/omar-dulaimi/prisma-class-validator-generator.git
cd prisma-class-validator-generator
npm install
npm run build
npm test
```

### Common Development Commands

```bash
npm run build         # Compile TypeScript
npm run start         # Build and run Prisma generate
npm test              # Run tests in watch mode
npm run test:ci       # Run tests with coverage
npm run format        # Format code with Prettier
```

## 📖 API Reference

### Generator Configuration

The generator accepts the following configuration in your `schema.prisma`:

```prisma
generator class_validator {
  provider = "prisma-class-validator-generator"
  output   = "./generated"    // Optional: output directory
}
```

### Generated File Structure

```
generated/
├── models/
│   ├── User.model.ts
│   ├── Post.model.ts
│   └── index.ts
├── enums/
│   ├── Role.ts
│   └── index.ts
└── index.ts
```

## 🐛 Troubleshooting

### Common Issues

1. **Generator not found**: Ensure you've installed the package as a dependency
2. **Output directory errors**: Check that the parent directory exists
3. **Import errors**: Make sure class-validator is installed in your project

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=prisma:generator npx prisma generate
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the amazing [Prisma](https://prisma.io) ecosystem
- Powered by [class-validator](https://github.com/typestack/class-validator) for robust validation
- Uses [ts-morph](https://github.com/dsherret/ts-morph) for TypeScript AST manipulation

---

<div align="center">
  <p>Made with ❤️ by <strong>Omar Dulaimi</strong></p>
  <p>
    <a href="https://github.com/omar-dulaimi/prisma-class-validator-generator/stargazers">⭐ Star us on GitHub</a> •
    <a href="https://github.com/omar-dulaimi/prisma-class-validator-generator/issues">🐛 Report Issues</a> •
    <a href="https://github.com/omar-dulaimi/prisma-class-validator-generator/discussions">💬 Discussions</a>
  </p>
</div>