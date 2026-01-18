import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  slug: {
    type: String,
    unique: true
  },
  image: String
});

export default mongoose.model("Category", CategorySchema);
