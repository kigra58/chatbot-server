import express from 'express';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import { generate } from './promt';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3005;
const DB_PORT = process.env.DB_PORT || 3006;
app.use(express.json());


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', async (args:{userId:number;message:string}) => {
        console.log("User Message",args)
       if(!args.message ||!args.message.length)return;
       const chatId=uuidv4();
       const botResponse = await generate(args.message);
       if(!botResponse || !botResponse.length) return;
        console.log('Bot:', botResponse);
        const chatObj= {message: args.message, response: botResponse,id:chatId, user_id:args.userId };
        await axios.post(`http://localhost:${DB_PORT}/chats`, chatObj);
        socket.emit('response', chatObj);
    });

    socket.on('getAllChats', async (userId:number) => {
        if(!userId ||userId===undefined) return;
        console.log("User Id=====================>",userId)
        const {data:chats} = await axios.get(`http://localhost:${DB_PORT}/chats?user_id=${userId}`);
        if(!chats || !chats.length) return;
        socket.emit('chats', chats);
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});




server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
