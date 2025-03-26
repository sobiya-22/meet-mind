import express from 'express';
import { createMeeting, getMeetings, getMeeting, updateMeeting, deleteMeeting, joinMeeting } from '../controllers/meeting.controller.js';

const router = express.Router();

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:meetingId', getMeeting);
router.put('/:meetingId', updateMeeting);
router.delete('/:meetingId', deleteMeeting);
router.post('/:meetingId/join', joinMeeting);

export default router;
