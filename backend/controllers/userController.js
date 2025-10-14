// backend/controllers/userController.js
let users = [];

exports.getUsers = (req, res) => {
  res.json(users);
};

exports.createUser = (req, res) => {
  const { name, email } = req.body || {};
  const user = { id: Date.now(), name, email };
  users.push(user);
  res.status(201).json(user);
};
