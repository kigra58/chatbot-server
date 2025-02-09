import express from "express";
import mongoose from "mongoose";

class Server {
    port:number;
    app = express();
    constructor(port:number){
       this.port = port;
    };

    run(){
        this.app.listen(this.port, () => {       
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
   async conn(url:string){
        if(!url) throw new Error("Please provide MONGODB_URL in .env file");
        try{
            await mongoose.connect(url);
            console.log("connection succesfully");        
        }catch(error){
            console.log("Connection error:",error)
        }
    }
    App(){
       return this.app
    }
}

export default Server;