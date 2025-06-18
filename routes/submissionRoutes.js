const express = require('express');
const { generateSubmission } = require('../controllers/submissionController');
const { getSubmissions } = require('../controllers/submissionController');
const { downloadPdf } = require('../controllers/submissionController');
const { getSingleSubmission } = require('../controllers/submissionController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.post('/generate', verifyToken, generateSubmission);
router.get('/history', verifyToken, getSubmissions);
router.get('/:id/download', verifyToken, downloadPdf);
router.get('/:id', verifyToken, getSingleSubmission)

module.exports = router;
