import express from 'express';
import { createMOM, getMOMByMeeting, updateMOM, deleteMOM } from '../controllers/momController.js';

const router = express.Router();

router.post('/', createMOM);
router.get('/:meetingId', getMOMByMeeting);
router.put('/:momId', updateMOM);
router.delete('/:momId', deleteMOM);

export default router;
