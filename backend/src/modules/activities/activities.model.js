import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: { type: Object }
}, { timestamps: true })

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema)