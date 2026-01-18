import { verifyJWT } from '../middleware/Auth.middleware.js';
import { Router } from 'express';
import { createBroadcast, getBroadcasts, getBroadcastById, updateBroadcast, deleteBroadcast } from '../controllers/Broadcast.controller.js';

const router = Router();

router.route("/").post(verifyJWT, createBroadcast);
router.route("/").get(getBroadcasts);
router.route("/:id").get(getBroadcastById);
router.route("/:id").put(verifyJWT, updateBroadcast);
router.route("/:id").delete(verifyJWT, deleteBroadcast);


export default router;
