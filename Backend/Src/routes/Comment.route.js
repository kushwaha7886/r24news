import { verifyJWT } from '../middleware/Auth.middleware.js';
import { Router } from 'express';
import { createComment, getComments, getCommentById, updateComment, deleteComment } from '../controllers/comment.controller.js';

const router = Router();

router.route("/").post(verifyJWT, createComment);
router.route("/").get(getComments);
router.route("/:id").get(getCommentById);
router.route("/:id").put(verifyJWT, updateComment);
router.route("/:id").delete(verifyJWT, deleteComment);


export default router;
