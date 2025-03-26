import express from 'express';
import { markAttendance, getAttendanceByMeeting, getUserAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', markAttendance);
router.get('/:meetingId', getAttendanceByMeeting);
router.get('/user/:userId', getUserAttendance);

export default router;
