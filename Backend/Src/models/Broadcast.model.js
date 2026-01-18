import mongoose from "mongoose";

const BroadcastSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article"
  },
  channelName: {
    type: String,
    required: true
  },
  airDate: {
    type: Date,
    required: true
  },
  duration: String,
  description: String,
  streamUrl: String
});

export default mongoose.model("Broadcast", BroadcastSchema);
