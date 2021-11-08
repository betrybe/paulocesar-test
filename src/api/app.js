const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}))

require('../controllers/index')(app);
//require('../controllers/projectController')(app);

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

module.exports = app;
