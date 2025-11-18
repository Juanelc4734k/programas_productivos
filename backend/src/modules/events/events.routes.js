import { Router } from 'express'
import { protect, authorize } from '../../middlewares/auth.middleware.js'
import { listEvents, createEvent, updateEvent, deleteEvent } from './events.controller.js'

const router = Router()

router.use(protect)
router.get('/', listEvents)
router.post('/', authorize(['funcionario','admin']), createEvent)
router.put('/:id', authorize(['funcionario','admin']), updateEvent)
router.delete('/:id', authorize(['funcionario','admin']), deleteEvent)

export default router