const User = require('../models/User');

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password');
    // Mapping MongoDB _id sang id cho nhất quán với auth response
    const mappedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    res.json(mappedUsers);
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email & password are required' });
    const user = await User.create({ name, email, password });
    // Mapping response giống getUsers
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
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
    // Mapping response giống getUsers
    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (err) { next(err); }
};

// ===== DELETE USER =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'user not found' });

    res.json({ 
      message: 'User deleted successfully', 
      id: deleted._id,
      name: deleted.name,
      email: deleted.email
    });
  } catch (err) { next(err); }
};
