import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Prowl QA Hub API',
    description: 'API for discovering and downloading verified QA hunt templates.',
    version: '1.0.0',
  },
  servers: [
    { url: 'https://hub.prowlqa.dev', description: 'Production' },
    { url: 'http://localhost:3003', description: 'Local development' },
  ],
  paths: {
    '/api/hunts': {
      get: {
        summary: 'Full hunt catalog',
        description: 'Returns all verified hunts with full YAML content.',
        responses: {
          '200': {
            description: 'Hunt catalog',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    generatedAt: { type: 'string', format: 'date-time' },
                    hunts: { type: 'array', items: { $ref: '#/components/schemas/HuntRecord' } },
                  },
                },
              },
            },
          },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
    '/api/hunts/search': {
      get: {
        summary: 'Search hunts',
        description: 'Search and filter hunts with server-side filtering.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Full-text search query' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'tags', in: 'query', schema: { type: 'string' }, description: 'Comma-separated tags' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                    results: { type: 'array', items: { $ref: '#/components/schemas/HuntSummary' } },
                  },
                },
              },
            },
          },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
    '/api/hunts/{id}': {
      get: {
        summary: 'Get single hunt',
        description: 'Returns full metadata and YAML content for a single hunt by ID.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Hunt details with content',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HuntRecord' },
              },
            },
          },
          '404': { description: 'Hunt not found' },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
    '/api/hunts/file': {
      get: {
        summary: 'Download hunt YAML',
        description: 'Returns raw YAML content as a downloadable file.',
        parameters: [
          { name: 'path', in: 'query', required: true, schema: { type: 'string' }, description: 'Hunt file path (e.g. auth/oauth-google.yml)' },
          { name: 'preview', in: 'query', schema: { type: 'string', enum: ['1'] }, description: 'Set to 1 to skip download tracking' },
        ],
        responses: {
          '200': { description: 'YAML file content', content: { 'application/x-yaml': {} } },
          '400': { description: 'Missing path parameter' },
          '404': { description: 'Hunt not found' },
          '429': { $ref: '#/components/responses/RateLimitExceeded' },
        },
      },
    },
  },
  components: {
    responses: {
      RateLimitExceeded: {
        description: 'Rate limit exceeded',
        headers: {
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Seconds to wait before retrying',
          },
          'X-RateLimit-Limit': {
            schema: { type: 'integer' },
            description: 'Total requests allowed in the current window',
          },
          'X-RateLimit-Remaining': {
            schema: { type: 'integer' },
            description: 'Requests remaining in the current window',
          },
          'X-RateLimit-Reset': {
            schema: { type: 'integer' },
            description: 'Unix timestamp when the current window resets',
          },
        },
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
    schemas: {
      HuntSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          categoryLabel: { type: 'string' },
          filePath: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          stepCount: { type: 'integer' },
          assertionCount: { type: 'integer' },
          updatedAt: { type: 'string', format: 'date-time' },
          isVerified: { type: 'boolean' },
          isNew: { type: 'boolean' },
          downloadUrl: { type: 'string' },
        },
      },
      HuntRecord: {
        allOf: [
          { $ref: '#/components/schemas/HuntSummary' },
          {
            type: 'object',
            properties: {
              content: { type: 'string' },
            },
          },
        ],
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
    },
  });
}
