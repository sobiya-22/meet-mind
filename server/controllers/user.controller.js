import User from '../models/UserModel.js';

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.userId);
  user ? res.json(user) : res.status(404).json({ message: 'User not found' });
};

export const updateUser = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
  res.json(updatedUser);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.userId);
  res.json({ message: 'User deleted' });
};
