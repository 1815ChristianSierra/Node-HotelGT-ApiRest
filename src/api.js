const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const rolesRoutes = require('./routes/roles');
const usersRoutes = require('./routes/usuarios');
//const roomsRoutes = require('./routes/rooms');
//const seasonsRoutes = require('./routes/seasons');
//const reservationsRoutes = require('./routes/reservations');
//const paymentMethodsRoutes = require('./routes/paymentMethods');
//const paymentsRoutes = require('./routes/payments');
//const roomPhotosRoutes = require('./routes/roomPhotos');
//const notificationsRoutes = require('./routes/notifications');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* TODO: Documentacion con Swagger */
//https://www.npmjs.com/package/swagger-jsdoc
const swaggerJsdoc = require("swagger-jsdoc");
//https://www.npmjs.com/package/swagger-ui-express
const swaggerUI = require("swagger-ui-express");

// Montamos las rutas
app.use('/roles', rolesRoutes);
app.use('/usuarios', usersRoutes);
//app.use('/rooms', roomsRoutes);
//app.use('/seasons', seasonsRoutes);
//app.use('/reservations', reservationsRoutes);
//app.use('/paymentMethods', paymentMethodsRoutes);
//app.use('/payments', paymentsRoutes);
//app.use('/roomPhotos', roomPhotosRoutes);
//app.use('/notifications', notificationsRoutes);

const port = process.env.PORT || 8090;
app.listen(port, () => {
    console.log('API Hotel iniciada en el puerto: ' + port);
});