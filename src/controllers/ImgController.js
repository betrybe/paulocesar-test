const express = require('express');
const multer = require('multer')

const router = express.Router();



module.exports = app => app.use('/', router);