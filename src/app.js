const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const healthRouter = require('./routes/health');
const urlsRouter = require('./routes/urls');
const redirectRouter = require('./routes/redirect');

const app = express();
app.disable('x-powered-by'); // No revelar la tecnología del servidor (SonarCloud S5689)
app.use(express.json());

// Frontend estático: sirve la página web desde src/public (index.html en "/").
// Va antes del router de redirección para que "/" muestre la interfaz; las rutas
// que no sean un archivo (p. ej. "/abc123") caen al router de redirección.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/health', healthRouter);
app.use('/api/urls', urlsRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// El router de redirección captura "/:shortCode" en la raíz, por eso va al final.
app.use('/', redirectRouter);

// Manejador de errores centralizado.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
