// import { GoogleGenerativeAI } from "@google/generative-ai";
// import {config} from "dotenv"

// config();


// const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
// const geminiModel = googleAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });

// export const generate = async (question:string) => {
//     try {
//       const result = await geminiModel.generateContent(question);
//       const response = result.response;
//       console.log(response.text());
//       return response.text();
//     } catch (error) {
//       console.log("response error", error);
//     }
//   };


import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();
if(!process.env.GOOGLE_API_KEY) {
  throw new Error("Please provide GOOGLE_API_KEY in .env file");
};

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generate = async (question: string) => {
  try {
    const result = await geminiModel.generateContent(question);
    const response = result.response;
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.log("response error", error);
  }
};

export const generateStream = async (question: string) => {
  try {
    const {stream} = await geminiModel.generateContentStream(question);
    return stream;
    
    // let fullResponse = '';
    
    // for await (const chunk of result.stream) {
    //   const chunkText = chunk.text();
    //   // console.log(chunkText);
    //   fullResponse += chunkText;
    // }
    
    // return fullResponse;
  } catch (error) {
    console.log("stream error", error);
  }
};
