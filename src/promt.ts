import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { config } from "dotenv";
import { Conversation, Docs, Session } from "./schema/schema";
import PdfParse from "pdf-parse";
import fs from "fs";
import { HfInference } from "@huggingface/inference";

config();
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Please provide GOOGLE_API_KEY in .env file");
}

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generate = async (vectorSearch: any[], question: string) => {
  try {
    const prompt = [
      {
        role: "system",
        content:
          "you are humble AI assistant who can answer for questions asked by users from the given context.",
      },
      {
        role: "user",
        content: `${vectorSearch.map((item) => item.text + "\n")}
        \n
        from the above context, answer the following question ${question}`,
      },
    ];
    const myprompt = JSON.stringify(prompt);
    const { response } = await geminiModel.generateContent(myprompt);
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.log("response error", error);
  }
};

export const generateStream = async (vectorSearch: any[],question: string) => {
  try {
    // const { stream } = await geminiModel.generateContentStream(question);
    // return stream;

    const prompt = [
      {
        role: "system",
        content:
          "you are humble AI assistant who can answer for questions asked by users from the given context.",
      },
      {
        role: "user",
        content: `${vectorSearch.map((item) => item.text + "\n")}
        \n
        from the above context, answer the following question ${question}`,
      },
    ];
    const myprompt = JSON.stringify(prompt);
    const { stream } =  await geminiModel.generateContentStream(myprompt);
    return stream;
  } catch (error) {
    console.log("stream error", error);
  }
};

export const generateTextEmbedding = async (text: string) => {
  try {
    const googleAI = new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY as string
    );
    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Double-check the model name
    });

    const { embedding } = await geminiModel.embedContent(text);
    return embedding;
  } catch (error) {
    console.error("Error generating text embedding:", error);
    return null;
  }
};

export const conversationHandler = async (message: string) => {
  try {
    if (!message || !message.length) return;

    const createSession = await Session.create({});
    if (!createSession || !createSession._id) return;
    const createConversation = await Conversation.create({
      session_id: createSession._id,
      message,
      role: "USER",
    });
    if (!createConversation || !createConversation._id) return;

    const ebmRes = await embeddingByHunggingFace(message);
    if (!ebmRes || !ebmRes.length) return;

    const vectorSearch = await Docs.aggregate([
      {
        $vectorSearch: {
          index: "default",
          path: "embedding",
          queryVector: ebmRes as Array<number>,
          numCandidates: 150,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    // const data = await generate(vectorSearch, message);
    const data = await generateStream(vectorSearch, message);
    if (!data) return;
    return data;
  } catch (error) {
    console.log("Error in conversation:", error);
  }
};

export const chunkTextBySentence = async (
  text: string,
  chunkSize = 100,
  chunkOverlap = 20
) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    separators: [".", "!", "?", "\n\n"],
  });
  const chunks = await splitter.splitText(text);
  return chunks;
};


export const embeddingByHunggingFace = async (text: string) => {
  try {
    const hf = new HfInference(process.env.HF_TOKEN);
    return await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });
  } catch (error) {
    console.log("Error generating text embedding:", error);
  }
};

export const  createEmbeddingByGoogle= async(sentence:string)=> {
  try {
      // Get the embedding model
      const model = googleAI.getGenerativeModel({ model: "models/embedding-001" });

      // Generate the embedding
      const {embedding} = await model.embedContent(sentence);
      return embedding.values;

      // Return the first 5 values of the embedding vector
      // return embedding.values.slice(0, 5);
  } catch (error) {
      console.error("Error creating embedding:", error);
      throw error;
  }
}


export const uploadHandler = async () => {
  try {
    const data = fs.readFileSync("./src/documents/story.pdf");
    if (!data) return;
    const { text } = await PdfParse(data);
    if (!text) return;
    const chunkRes = await chunkTextBySentence(text);
    // console.log("chunkReschunkRes",chunkRes);
    if (!chunkRes || !chunkRes.length) return;
    for (const ele of chunkRes) {
      // const embedding = await embeddingByHunggingFace(ele);
      const embedding = await createEmbeddingByGoogle(ele);
      console.log("embedding",embedding);
      await Docs.create({ text: ele, embedding});
    }
  } catch (error) {
    console.log("Error in upload file:", error);
  }
};