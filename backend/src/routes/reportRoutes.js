const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Assignment 11 Section A Query 1: All records from CLIENT (+ XML)
router.get('/query1-clients', reportController.getQuery1Clients);

// Assignment 11 Section A Query 2: Insert data maintaining integrity
router.post('/query2-insert-integrity', reportController.getQuery2InsertIntegrity);

// Assignment 11 Section A Query 3: Aggregate function dropdown (+ XML)
router.get('/query3-aggregate', reportController.getQuery3Aggregate);

// Assignment 11 Section A Query 4: Conditional query with operators (+ XML)
router.get('/query4-conditional', reportController.getQuery4Conditional);

// Assignment 11 Section A Query 5: Dynamic JOIN on 2 tables
router.get('/query5-join', reportController.getQuery5Join);

// Assignment 11 Section A Query 6: Subquery across tables
router.get('/query6-subquery', reportController.getQuery6Subquery);

// Assignment 11 Section A Query 7: Correlated subquery
router.get('/query7-correlated', reportController.getQuery7Correlated);

// Assignment 11 Section A Query 8: Update records maintaining integrity
router.put('/query8-update-integrity', reportController.getQuery8UpdateIntegrity);

// Assignment 11 Section C: Views demonstration
router.get('/views', reportController.getViewData);

module.exports = router;
