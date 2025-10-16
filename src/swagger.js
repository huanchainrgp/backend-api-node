import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Backend API',
      version: '0.1.0'
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['src/routes/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };


