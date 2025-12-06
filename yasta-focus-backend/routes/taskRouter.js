import express from 'express';
import { protect } from '../controllers/authController.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Tasks for a specific subject
router
  .route('/subject/:subjectName')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/subject/:subjectName/:taskTitle')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

router.patch('/subject/:subjectName/:taskTitle/toggle', taskController.toggleTaskStatus);

export default router;
