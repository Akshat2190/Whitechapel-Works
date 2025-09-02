import axios from "axios";
import Chat from "../models/chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";


// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        //check credits
        if(req.user.credits < 2) {
            return res.json({success: false, message: "Not enough credits"});
        }

        const {chatId, prompt} = req.body;

        const chat = await Chat.findOne({userId, _id: chatId});

        //✅ fallback check
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false});

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = {
            role: choices[0].message.role,
            content: choices[0].message.content,
            timestamp: Date.now(),
            isImage: false
          };
         
        res.json({success: true, reply});

        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({_id: userId}, {$inc: {credits: -1}})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        //check credits
        if(req.user.credits < 2) {
            return res.json({success: false, message: "Not enough credits"});
        }
        const {prompt, chatId, isPublished} = req.body;
        //Find chat
        const chat = await Chat.findOne({userId, _id: chatId});
        //✅ fallback check
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        //push user message to chat
        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false});

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt);

        // Construct ImageKit AI generation URL
        const genreratedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/
        whitechapel_works/${Date.now()}.png?tr=w-800,h-800`; //transformation

        //Trigger generation by fetching from Imagekit
        const aiImageResponse = await axios.get(genreratedImageUrl, {responseType: 'arraybuffer'});

        // Convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

        //upload to imagekit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "/whitechapel_works",
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }
        res.json({success: true, reply});

        chat.messages.push(reply);
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}