const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const swaggerSpec = require('../docs/swagger');

const setupSwagger = (app) => {
  const swaggerEnabled = process.env.SWAGGER_ENABLED
    ? process.env.SWAGGER_ENABLED === 'true'
    : true;

  if (!swaggerEnabled) return;

  const swaggerPath = process.env.SWAGGER_PATH || '/api-docs';
  const swaggerUser = process.env.SWAGGER_USER || 'admin';
  const swaggerPass = process.env.SWAGGER_PASS;

  // If password exists -> protect Swagger
  if (swaggerPass) {
    const docsAuth = basicAuth({
      users: { [swaggerUser]: swaggerPass },
      challenge: true,
    });

    app.use(
      swaggerPath,
      docsAuth,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec)
    );
    return;
  }

  app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
