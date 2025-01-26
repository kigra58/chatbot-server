import mongoose from "mongoose"

let exist:typeof mongoose;
export const conn=async(url:string)=>{
    if(!url) throw new Error("Please provide MONGODB_URL in .env file");
    try {
        if(!exist){
            exist=await mongoose.connect(url);
            console.log("=======connecton=succesfully========")
        }
    } catch (error) { 
        console.log("Connection Error:",error);
    }
};