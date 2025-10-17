const mongoose = require('mongoose');
const User = require('../models/User');

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ message: 'name & email are required' });
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

// ===== NEW: UPDATE =====
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // validate ObjectId để tránh cast error
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'invalid user id' });
    }

    const { name, email } = req.body || {};
    if (!name && !email) {
      return res.status(400).json({ message: 'nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { ...(name && { name }), ...(email && { email }) } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'user not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

// ===== NEW: DELETE =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'invalid user id' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'user not found' });

    // có thể trả 204 No Content – mình trả 200 để dễ debug
    res.json({ message: 'user deleted', id: deleted._id });
  } catch (err) { next(err); }
};
