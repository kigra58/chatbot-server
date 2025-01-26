import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { config } from "dotenv";
import { HfInference } from '@huggingface/inference';


config();
if(!process.env.GOOGLE_API_KEY) {
  throw new Error("Please provide GOOGLE_API_KEY in .env file");
};

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const generate = async (vectorSearch:any [], question: string) => {
  try {
    const prompt=[
      {
       role:"system",
       content:"you are humble AI assistant who can answer for questions asked by users from the given context.",
      },
      {
        role:"user",
        content:`${vectorSearch.map((item)=>item.text+"\n")}
        \n
        from the above context, answer the following question ${question}`
      }
    ]
    const myprompt=JSON.stringify(prompt);
    const {response} = await geminiModel.generateContent(myprompt);
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


export const generateTextEmbedding=async(text:string)=> {
  try {
    const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Double-check the model name
    });

    const { embedding } = await geminiModel.embedContent(text);
    return embedding;

  } catch (error) {
    console.error("Error generating text embedding:", error);
    return null;
  }
}




export const chunkTextBySentence =async(text:string, chunkSize=100, chunkOverlap = 20)=> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    separators: ["." , "!", "?", "\n\n"], 
  });
  const chunks = await splitter.splitText(text);
  return chunks;
}

// Example usage:

// const text = "This is an example of a long sentence. It contains multiple sentences. This is another sentence.";
// const chunkSize = 100; 
// const chunkOverlap = 20; 

// chunkTextBySentence(text, chunkSize, chunkOverlap)
//   .then(chunks => {
//     console.log(chunks); 
// });

export const embeddingByHunggingFace = async (text: string) => {
  try{
    
    const hf = new HfInference(process.env.HF_TOKEN);
    return await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: 'That is a happy person',
    });
    
  }
  catch(error){
  console.log("Error generating text embedding:", error);
  }
}