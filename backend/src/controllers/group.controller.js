const Group = require('../models/Group');

const createGroup = async (req, res, next) => {
  try {
    const { name, members = [], avatar } = req.body;
    const admin = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const uniqueMembers = Array.from(new Set([admin, ...members.map(String)]));
    const group = await Group.create({ name, members: uniqueMembers, admin, avatar });
    return res.status(201).json({ group });
  } catch (error) {
    return next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate('members', 'name email avatar')
      .populate('admin', 'name email avatar');
    return res.status(200).json({ groups });
  } catch (error) {
    return next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate('admin', 'name email avatar');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    return res.status(200).json({ group });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
};
