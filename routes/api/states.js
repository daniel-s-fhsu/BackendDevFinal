const express = require('express');
const router = express.Router();
const path = require('path');
const statesController = require('../../controllers/statesController');

router.route('/')
    .get(statesController.getAllStates);

router.route('/:state')
    .get(statesController.getState);

module.exports = router;