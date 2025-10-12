import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUserByAuthId,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  getCurrentUser,
  syncProfile,
} from '../controllers/user.controller.js';

const router: Router = express.Router();

router.get('/', getAllUsers);
router.get('/auth/:authId', getUserByAuthId);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me/current', getCurrentUser);
router.post('/sync-profile', syncProfile);

export default router;
