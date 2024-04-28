const express = require('express');
const router = express.Router();
const path = require('path');
const checkStateCode = require('../../middleware/checkStateCode');
const statesController = require('../../controllers/statesController');

router.route('/')
    .get(statesController.getAllStates);


//Everything after this point must validate state code
router.use('/:state', checkStateCode);

router.route('/:state/funfact')
    .post(statesController.createFunFact)
    .patch(statesController.updateFunFact)
    .delete(statesController.deleteFunFact);

router.route('/:state/:filterInfo?')
    .get(statesController.getState);

module.exports = router;