import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema({
  
  
});

SessionSchema.set("timestamps", true);


export const Session = mongoose.model("Session", SessionSchema);

const ConversationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: ["USER", "AI"],
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
});
export const Conversation = mongoose.model("Conversation", ConversationSchema);

const DocsSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: Array,
    required: true,
  },
  
});

DocsSchema.set("timestamps", true);


export const Docs = mongoose.model("Docs", DocsSchema);
 
// module.exports = { Conversation, Session, Docs };
