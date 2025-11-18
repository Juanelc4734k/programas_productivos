import Activity from './activities.model.js'

export const listActivities = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10)
    const activities = await Activity.find({ user: req.user?._id }).sort({ createdAt: -1 }).limit(limit).lean()
    res.status(200).json(activities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createActivity = async (req, res) => {
  try {
    const { type, message, meta } = req.body
    const activity = await Activity.create({ type, message, user: req.user?._id, meta })
    res.status(201).json(activity)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const logActivity = async ({ user, type, message, meta }) => {
  try { await Activity.create({ user, type, message, meta }) } catch {}
}