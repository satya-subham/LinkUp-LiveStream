import express from 'express';
import { login, logout, onboard, signup } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const authRoutes = express.Router();


authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);

authRoutes.post('/onboarding', protectRoute , onboard);

authRoutes.get('/me', protectRoute, (req, res) => {
    res.status(200).json({success: true, user: req.user});
})

export default authRoutes;