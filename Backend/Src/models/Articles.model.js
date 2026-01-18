import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  tags: [String],
  journalist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MediaAsset"
  }],
  status: {
    type: String,
    enum: ["Draft", "Published", "Archived", "Pending Approval"],
    default: "Draft"
  },
  publishDate: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Article", ArticleSchema);
