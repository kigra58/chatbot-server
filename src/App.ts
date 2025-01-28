import express from 'express';
import http from 'http';
import axios from 'axios';
import { Server as SocketServer } from 'socket.io';
import {conversationHandler,generateStream, uploadHandler} from './promt'; // Assuming this is your AI model
import { v4 as uuidv4 } from 'uuid';
import { conn } from './connetion/connection';
import { config } from "dotenv";

config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3005;
const DB_PORT = process.env.DB_PORT || 3006;
app.use(express.json());

conn(process.env.DB as string);

app.get("/upload",async (req, res) => {
    try {        
      await uploadHandler();
       res.json({"success":true,message:"File uploaded successfully"});
    } catch (error) {
       res.json({"success":false,message:"unable to upload file",error});
    }
});

app.post("/conversation",async (req, res) => {
   try {
    const {message}=req.body;
    if(!message || !message.length) return;
    const data=await conversationHandler(message);
    res.json({"success":true,data});
    
   } catch (error) {
     res.json({"success":false,message:"something went wrong",error});
   }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', async (args: { userId: number; message: string }) => {
        console.log("User Message", args);
        if (!args.message || !args.message.length || args.userId) return;

        const chatId = uuidv4();
        const chatObj = { message: args.message, response: '', id: chatId, user_id: args.userId };

        // Emit an initial response to indicate the bot is processing
        socket.emit('response',chatObj);

        try {
            // const stream = await generateStream(args.message); // Get the stream from your AI model
            const stream =await conversationHandler(args.message);
            console.log("streamstream",stream);
            let fullResponse = '';
            if(!stream)return;

            // Stream the response in chunks
            for await (const chunk of stream) {
                // const chunkText = chunk.text(); // Assuming the chunk has a `text()` method
                const chunkText = chunk; // Assuming the chunk has a `text()` method
                fullResponse += chunkText;

                // Emit each chunk to the frontend
                socket.emit('responseChunk', { id: chatId, chunk: chunkText });
            }

            // Save the full response to the database
            chatObj.response = fullResponse;
            await axios.post(`http://localhost:${DB_PORT}/chats`, chatObj);

            // Emit the final response
            socket.emit('response', chatObj);
        } catch (error) {
            console.error("Error streaming response:", error);
            socket.emit('responseError', { id: chatId, error: 'Failed to generate response' });
        }
    });

    socket.on('getAllChats', async (userId: number) => {
        if (!userId || userId === undefined) return;
        console.log("User Id=====================>", userId);

        try {
            const { data: chats } = await axios.get(`http://localhost:${DB_PORT}/chats?user_id=${userId}`);
            if (!chats || !chats.length) return;
            socket.emit('chats', chats);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));