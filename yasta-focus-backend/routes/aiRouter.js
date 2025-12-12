import express from 'express'
import * as aiController from '../controllers/aiController.js'
import { protect } from '../controllers/authController.js'

const router = express.Router()

router.post('/subject-chat', protect, aiController.subjectChat)

export default router
