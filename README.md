# Prisma Class Validator Generator

[![npm version](https://badge.fury.io/js/prisma-class-validator-generator.svg)](https://badge.fury.io/js/prisma-class-validator-generator)
[![npm](https://img.shields.io/npm/dt/prisma-class-validator-generator.svg)](https://www.npmjs.com/package/prisma-class-validator-generator)
[![HitCount](https://hits.dwyl.com/omar-dulaimi/prisma-class-validator-generator.svg?style=flat)](http://hits.dwyl.com/omar-dulaimi/prisma-class-validator-generator)
[![npm](https://img.shields.io/npm/l/prisma-class-validator-generator.svg)](LICENSE)

Automatically generate typescript models of your database with class validator validations ready, from your [Prisma](https://github.com/prisma/prisma) Schema. Updates every time `npx prisma generate` runs.

## Table of Contents

- [Installation](#installing)
- [Usage](#usage)
- [Additional Options](#additional-options)

## Installation

Using npm:

```bash
 npm install prisma-class-validator-generator
```

Using yarn:

```bash
 yarn add prisma-class-validator-generator
```

# Usage

1- Star this repo 😉

2- Add the generator to your Prisma schema

```prisma
generator class_validator {
  provider = "prisma-class-validator-generator"
}
```

3- Running `npx prisma generate` for the following schema.prisma

```prisma
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
}
```

will generate the following files

![Typescript models with class validator](https://raw.githubusercontent.com/omar-dulaimi/prisma-class-validator-generator/master/classValidatorModels.png)


## Additional Options

| Option                |  Description                                    | Type      |  Default      |
| --------------------- | ----------------------------------------------- | --------- | ------------- |
| `output`              | Output directory for the generated models       | `string`  | `./generated` |


Use additional options in the `schema.prisma`

```prisma
generator class_validator {
  provider   = "prisma-class-validator-generator"
  output     = "./generated-models"
}
````
