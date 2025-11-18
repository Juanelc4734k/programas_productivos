import CalendarEvent from './events.model.js'
import { logActivity } from '../activities/activities.controller.js'

export const listEvents = async (req, res) => {
  try {
    const { from, to } = req.query
    const filter = {}
    if (from || to) {
      filter.start = {}
      if (from) filter.start.$gte = new Date(from)
      if (to) filter.start.$lte = new Date(to)
    }
    const events = await CalendarEvent.find(filter).sort({ start: 1 }).lean()
    res.status(200).json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, vereda } = req.body
    const ev = await CalendarEvent.create({ title, description, start, end, vereda, usuario: req.user._id })
    await logActivity({ user: req.user._id, type: 'event_created', message: `Evento creado: ${title}`, meta: { eventId: ev._id } })
    res.status(201).json(ev)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateEvent = async (req, res) => {
  try {
    const ev = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!ev) return res.status(404).json({ message: 'Evento no encontrado' })
    await logActivity({ user: req.user._id, type: 'event_updated', message: `Evento actualizado: ${ev.title}`, meta: { eventId: ev._id } })
    res.status(200).json(ev)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const ev = await CalendarEvent.findByIdAndDelete(req.params.id)
    if (!ev) return res.status(404).json({ message: 'Evento no encontrado' })
    await logActivity({ user: req.user._id, type: 'event_deleted', message: `Evento eliminado: ${ev.title}`, meta: { eventId: ev._id } })
    res.status(200).json({ message: 'Evento eliminado' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}