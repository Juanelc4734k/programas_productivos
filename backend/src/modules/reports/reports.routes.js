import { Router } from 'express'
import { protect, authorize } from '../../middlewares/auth.middleware.js'
import { overviewReport, exportReport } from './reports.controller.js'

const router = Router()

router.use(protect)
router.use(authorize(['funcionario','admin']))

router.get('/overview', overviewReport)
router.get('/export', exportReport)

export default router