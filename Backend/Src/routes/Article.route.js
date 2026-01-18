import { verifyJWT, requireEditor } from '../middleware/Auth.middleware.js';
import { Router } from 'express';
import { requireAdmin,createArticle, getArticles, getArticleById, updateArticle, deleteArticle, approveArticle, rejectArticle } from '../controllers/Articles.controller.js';
    
const router = Router();

router.route("/").post(verifyJWT, createArticle);
router.route("/").get(getArticles); // Public access for published articles
router.route("/:id").get(getArticleById);
router.route("/:id").put(verifyJWT, updateArticle);
router.route("/:id").delete(verifyJWT, deleteArticle);

// Editor or Admin routes for approval workflow
router.route("/:id/approve").put(verifyJWT, requireEditor, approveArticle);
router.route("/:id/reject").put(verifyJWT, requireEditor, rejectArticle);

export default router;
