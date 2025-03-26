import MOM from '../models/MomModel.js';

export const createMOM = async (req, res) => {
  const mom = new MOM(req.body);
  await mom.save();
  res.status(201).json(mom);
};

export const getMOMByMeeting = async (req, res) => {
  const mom = await MOM.find({ meetingId: req.params.meetingId });
  res.json(mom);
};

export const updateMOM = async (req, res) => {
  const updated = await MOM.findByIdAndUpdate(req.params.momId, req.body, { new: true });
  res.json(updated);
};

export const deleteMOM = async (req, res) => {
  await MOM.findByIdAndDelete(req.params.momId);
  res.json({ message: 'MOM deleted' });
};
