import {PineconeClient} from "pinecone-client"

async function connectToDatabase() {
    const pinecone = new PineconeClient({
        apiKey: process.env.PINECONE_API_KEY,
        // environment: process.env.PINECONE_ENVIRONMENT,
    });


    // const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    // return index;
}


