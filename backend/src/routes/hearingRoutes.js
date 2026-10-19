const express = require('express');
const router = express.Router();
const hearingController = require('../controllers/hearingController');

router.get('/', hearingController.getAllHearings);
router.post('/', hearingController.createHearing);
router.put('/:id', hearingController.updateHearing);
router.delete('/:id', hearingController.deleteHearing);

module.exports = router;
