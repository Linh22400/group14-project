const User = require('../models/User');

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.find();
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

// ===== UPDATE USER =====
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body || {};
    
    if (!name && !email) {
      return res.status(400).json({ message: 'nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { ...(name && { name }), ...(email && { email }) } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'user not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

// ===== DELETE USER =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'user not found' });

    res.json({ message: 'user deleted', id: deleted._id });
  } catch (err) { next(err); }
};
