const express = require('express');
const router = express.Router();
const path = require('path');
const statesController = require('../../controllers/statesController');

router.route('/')
    .get(statesController.getAllStates);

module.exports = router;