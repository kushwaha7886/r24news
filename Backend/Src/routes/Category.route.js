import { verifyJWT, requireAdmin, requireEditor } from '../middleware/Auth.middleware.js';
import { Router } from 'express';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller.js';

const router = Router();

router.route("/").post(verifyJWT, requireEditor, createCategory);
router.route("/").get(getCategories);
router.route("/:id").get(getCategoryById);
router.route("/:id").put(verifyJWT, requireEditor, updateCategory);
router.route("/:id").delete(verifyJWT, requireEditor, deleteCategory);

export default router;
