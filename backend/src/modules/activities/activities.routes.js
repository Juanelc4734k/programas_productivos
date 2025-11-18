import { Router } from 'express'
import { protect } from '../../middlewares/auth.middleware.js'
import { listActivities, createActivity } from './activities.controller.js'

const router = Router()

router.use(protect)
router.get('/', listActivities)
router.post('/', createActivity)

export default router