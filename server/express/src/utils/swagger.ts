import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Agriculture Hub API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Agriculture Hub platform',
      contact: {
        name: 'API Support',
        email: 'support@agriculture-hub.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Marketplace',
        description: 'Marketplace related endpoints'
      },
      {
        name: 'Chat',
        description: 'Chat and messaging endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };