import express from "express";
import os from "os";
import cluster from "cluster";
import Server from "../utils/NewServer";

console.log(os.cpus().length)

const app=express();

if(cluster.isPrimary){
    for(let i=0;i<os.cpus().length;i++){
        cluster.fork();
    }
    
}else{
    const server= new Server(3004);
    server.run();
    // server.conn(process.env.DB as string);
    const app=server.App();

    app.get("/test",(req,res)=>{
        res.send(`${process.pid} is running`)
    });
}
