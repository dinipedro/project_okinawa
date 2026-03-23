/**
 * AUDIT-004: Generate TypeScript Types from OpenAPI Spec
 *
 * This script generates TypeScript types from the NestJS Swagger/OpenAPI spec
 * and outputs them to the mobile shared types folder for sync between backend and frontend.
 *
 * Usage:
 *   npm run generate:types
 *   # or
 *   npx ts-node src/scripts/generate-api-types.ts
 */

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import * as fs from 'fs';
import * as path from 'path';

// Output paths
const MOBILE_TYPES_PATH = path.join(__dirname, '../../../mobile/shared/types/api-types.ts');
const SPEC_OUTPUT_PATH = path.join(__dirname, '../../openapi.json');

interface OpenAPISchema {
  type?: string;
  format?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  enum?: string[];
  $ref?: string;
  allOf?: OpenAPISchema[];
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  nullable?: boolean;
  required?: string[];
  description?: string;
}

interface OpenAPIDocument {
  components?: {
    schemas?: Record<string, OpenAPISchema>;
  };
  paths?: Record<string, Record<string, {
    operationId?: string;
    requestBody?: {
      content?: Record<string, { schema?: OpenAPISchema }>;
    };
    responses?: Record<string, {
      content?: Record<string, { schema?: OpenAPISchema }>;
    }>;
  }>>;
}

async function generateTypes() {
  console.log('🚀 Starting type generation from OpenAPI spec...\n');

  // Bootstrap NestJS app to get Swagger spec
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Okinawa API')
    .setDescription('Restaurant Technology Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config) as unknown as OpenAPIDocument;

  // Save OpenAPI spec as JSON
  fs.writeFileSync(SPEC_OUTPUT_PATH, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI spec saved to: ${SPEC_OUTPUT_PATH}\n`);

  // Generate TypeScript types
  const typeDefinitions = generateTypeScriptTypes(document);

  // Ensure directory exists
  const typesDir = path.dirname(MOBILE_TYPES_PATH);
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  // Write types file
  fs.writeFileSync(MOBILE_TYPES_PATH, typeDefinitions);
  console.log(`✅ TypeScript types saved to: ${MOBILE_TYPES_PATH}\n`);

  await app.close();
  console.log('✨ Type generation complete!\n');
}

function generateTypeScriptTypes(spec: OpenAPIDocument): string {
  const lines: string[] = [
    '/**',
    ' * AUTO-GENERATED FILE - DO NOT EDIT',
    ' * Generated from OpenAPI spec by generate-api-types.ts',
    ` * Generated at: ${new Date().toISOString()}`,
    ' */',
    '',
    '/* eslint-disable @typescript-eslint/no-explicit-any */',
    '',
  ];

  const schemas = spec.components?.schemas || {};

  // Generate type for each schema
  for (const [name, schema] of Object.entries(schemas)) {
    const typeDef = schemaToTypeScript(name, schema, schemas);
    lines.push(typeDef);
    lines.push('');
  }

  // Generate API response wrapper types
  lines.push('// API Response wrapper types');
  lines.push('export interface ApiResponse<T> {');
  lines.push('  success: boolean;');
  lines.push('  data: T;');
  lines.push('  meta?: {');
  lines.push('    timestamp: string;');
  lines.push('    path: string;');
  lines.push('    method: string;');
  lines.push('    pagination?: {');
  lines.push('      page: number;');
  lines.push('      limit: number;');
  lines.push('      total: number;');
  lines.push('      totalPages: number;');
  lines.push('    };');
  lines.push('  };');
  lines.push('}');
  lines.push('');
  lines.push('export interface ApiError {');
  lines.push('  statusCode: number;');
  lines.push('  message: string | string[];');
  lines.push('  error: string;');
  lines.push('}');
  lines.push('');

  // Generate endpoint types
  lines.push('// API Endpoints');
  lines.push('export const API_ENDPOINTS = {');

  const endpoints: Record<string, string[]> = {};
  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.operationId) {
        const category = path.split('/')[2] || 'general';
        if (!endpoints[category]) {
          endpoints[category] = [];
        }
        endpoints[category].push(`  ${operation.operationId}: '${path}',`);
      }
    }
  }

  for (const [category, ops] of Object.entries(endpoints)) {
    lines.push(`  // ${category}`);
    lines.push(...ops);
  }

  lines.push('} as const;');
  lines.push('');

  return lines.join('\n');
}

function schemaToTypeScript(
  name: string,
  schema: OpenAPISchema,
  allSchemas: Record<string, OpenAPISchema>
): string {
  const lines: string[] = [];

  // Add description as JSDoc
  if (schema.description) {
    lines.push(`/** ${schema.description} */`);
  }

  // Handle enum
  if (schema.enum) {
    lines.push(`export type ${name} = ${schema.enum.map(v => `'${v}'`).join(' | ')};`);
    return lines.join('\n');
  }

  // Handle object type
  if (schema.type === 'object' || schema.properties) {
    lines.push(`export interface ${name} {`);

    const required = new Set(schema.required || []);

    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      const optional = !required.has(propName) ? '?' : '';
      const nullable = propSchema.nullable ? ' | null' : '';
      const propType = resolveType(propSchema, allSchemas);

      if (propSchema.description) {
        lines.push(`  /** ${propSchema.description} */`);
      }
      lines.push(`  ${propName}${optional}: ${propType}${nullable};`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  // Handle allOf (inheritance)
  if (schema.allOf) {
    const types = schema.allOf.map(s => resolveType(s, allSchemas));
    lines.push(`export type ${name} = ${types.join(' & ')};`);
    return lines.join('\n');
  }

  // Handle oneOf/anyOf (union)
  if (schema.oneOf || schema.anyOf) {
    const schemas = schema.oneOf || schema.anyOf || [];
    const types = schemas.map(s => resolveType(s, allSchemas));
    lines.push(`export type ${name} = ${types.join(' | ')};`);
    return lines.join('\n');
  }

  // Default: type alias
  const baseType = resolveType(schema, allSchemas);
  lines.push(`export type ${name} = ${baseType};`);
  return lines.join('\n');
}

function resolveType(schema: OpenAPISchema, allSchemas: Record<string, OpenAPISchema>): string {
  // Handle $ref
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop() || 'any';
    return refName;
  }

  // Handle array
  if (schema.type === 'array' && schema.items) {
    const itemType = resolveType(schema.items, allSchemas);
    return `${itemType}[]`;
  }

  // Handle primitive types
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date' || schema.format === 'date-time') {
        return 'string'; // Could be Date, but string is safer for JSON
      }
      if (schema.format === 'uuid') {
        return 'string';
      }
      if (schema.enum) {
        return schema.enum.map(v => `'${v}'`).join(' | ');
      }
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (schema.properties) {
        // Inline object
        const props = Object.entries(schema.properties)
          .map(([key, value]) => `${key}: ${resolveType(value, allSchemas)}`)
          .join('; ');
        return `{ ${props} }`;
      }
      return 'Record<string, any>';
    default:
      return 'any';
  }
}

// Run the script
generateTypes().catch((error) => {
  console.error('❌ Error generating types:', error);
  process.exit(1);
});
