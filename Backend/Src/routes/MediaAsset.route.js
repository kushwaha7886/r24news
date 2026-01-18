import { verifyJWT } from '../middleware/Auth.middleware.js';
import { Router } from 'express';
import { createMediaAsset, getMediaAssets, getMediaAssetById, updateMediaAsset, deleteMediaAsset } from '../controllers/MediaAsset.controller.js';
import { upload } from '../middleware/Multer.middleware.js';


const router = Router();

router.route("/").post(verifyJWT, upload.single('file'), createMediaAsset);
router.route("/").get(getMediaAssets);
router.route("/:id").get(getMediaAssetById);
router.route("/:id").put(verifyJWT, updateMediaAsset);
router.route("/:id").delete(verifyJWT, deleteMediaAsset);


export default router;
