// import Attendance from '../models/MeetingModel.js';

// export const markAttendance = async (req, res) => {
//   const attendance = new Attendance(req.body);
//   await attendance.save();
//   res.status(201).json(attendance);
// };

// export const getAttendanceByMeeting = async (req, res) => {
//   const data = await Attendance.find({ meetingId: req.params.meetingId });
//   res.json(data);
// };

// export const getUserAttendance = async (req, res) => {
//   const data = await Attendance.find({ userId: req.params.userId });
//   res.json(data);
// };
