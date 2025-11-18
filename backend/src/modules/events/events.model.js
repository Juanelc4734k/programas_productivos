import mongoose from 'mongoose'

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  vereda: { type: String, trim: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', calendarEventSchema)