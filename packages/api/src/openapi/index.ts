import { OpenAPIRegistry, OpenApiGeneratorV3 } from 'zod-to-openapi'
import { authPaths } from './auth'

// Create OpenAPI registry
const registry = new OpenAPIRegistry()

// Register all paths
Object.entries(authPaths).forEach(([path, methods]) => {
  Object.entries(methods).forEach(([method, definition]) => {
    registry.registerPath({
      path,
      method: method as any,
      ...definition,
    })
  })
})

// Register security schemes
registry.registerComponent('securitySchemes', 'sessionToken', {
  type: 'apiKey',
  in: 'cookie',
  name: 'session-token',
  description: 'Session token stored in HTTP-only cookie',
})

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Bearer token',
})

// Generate OpenAPI specification
const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiSpec = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Reform One API',
    version: '1.0.0',
    description: 'Reform One Platform API - Integrated membership, billing, CMS, training, and materials platform',
    contact: {
      name: 'Reform One Support',
      email: 'support@reform-one.jp',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.reform-one.jp',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Multi-Factor Authentication',
      description: 'MFA setup and verification endpoints',
    },
    {
      name: 'Organizations',
      description: 'Organization management endpoints',
    },
    {
      name: 'Billing',
      description: 'Subscription and payment endpoints',
    },
    {
      name: 'Content',
      description: 'Article and media content endpoints',
    },
  ],
  components: {
    securitySchemes: {
      sessionToken: {
        type: 'apiKey',
        in: 'cookie',
        name: 'session-token',
        description: 'Session token stored in HTTP-only cookie',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token for API access',
      },
    },
  },
})