import { StreamChat } from 'stream-chat'
import 'dotenv/config'


const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.log("Stream API KEY or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const createStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.log("error creating stream user", error);
    }
};

// TODO: DO IT LATER
export const generateStreamToken = (userId) => {
    try {
        // ensure userid is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.log("Error in generating stream token", error);
    }
};