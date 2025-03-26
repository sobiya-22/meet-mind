import Task from '../models/TaskModel.js';

export const createTask = async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
};

export const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  task ? res.json(task) : res.status(404).json({ message: 'Task not found' });
};

export const updateTask = async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
  res.json(updated);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.taskId);
  res.json({ message: 'Task deleted' });
};

export const getTasksByUser = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.params.userId });
  res.json(tasks);
};
