import Meeting from '../models/MeetingModel.js';

export const createMeeting = async (req, res) => {
  const meeting = new Meeting(req.body);
  await meeting.save();
  res.status(201).json(meeting);
};

export const getMeetings = async (req, res) => {
  const meetings = await Meeting.find();
  res.json(meetings);
};

export const getMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingId);
  meeting ? res.json(meeting) : res.status(404).json({ message: 'Meeting not found' });
};

export const updateMeeting = async (req, res) => {
  const updated = await Meeting.findByIdAndUpdate(req.params.meetingId, req.body, { new: true });
  res.json(updated);
};

export const deleteMeeting = async (req, res) => {
  await Meeting.findByIdAndDelete(req.params.meetingId);
  res.json({ message: 'Meeting deleted' });
};

export const joinMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingId);
  meeting.participants.push(req.body.userId);
  await meeting.save();
  res.json(meeting);
};
