import { GoogleGenerativeAI } from "@google/generative-ai";
import {config} from "dotenv"

config();


const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generate = async (question:string) => {
    try {
      const result = await geminiModel.generateContent(question);
      const response = result.response;
      console.log(response.text());
      return response.text();
    } catch (error) {
      console.log("response error", error);
    }
  };