import mongoose from "mongoose";

const MediaAssetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Image", "Video", "Document", "YouTube"],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  caption: String,
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article"
  }
}, { timestamps: true });

export default mongoose.model("MediaAsset", MediaAssetSchema);


