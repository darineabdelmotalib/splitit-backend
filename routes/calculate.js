import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.apiKey});

router.get("/", (req, res) => {
    console.log("in calculate");
    res.send(""); 
})

router.post("/chat", async (req, res) => {
    const { message } = req.body;

    try {
        // make req to openai api
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message}],
        })

        console.log(response);

        // send response back to client
        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;



