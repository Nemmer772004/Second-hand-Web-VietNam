import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  getCurrentUser,
} from '../controllers/user.controller.js';

const router: Router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me/current', getCurrentUser);

export default router;
