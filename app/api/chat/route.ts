import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getPresetById, getDefaultPreset } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface HistoryMessage {
    role: "user" | "assistant";
    content: string;
}

export async function POST(req: Request) {
    try {
        const { presetId, userMessage, history = [] } = await req.json() as {
            presetId: string;
            userMessage: string;
            history: HistoryMessage[];
        };

        // Get the system prompt from the preset
        const preset = presetId ? getPresetById(presetId) : getDefaultPreset();
        const systemInstruction = preset!.systemPrompt;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // Start a chat session with the conversation history
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }))
        });

        // Send the new message and get the response
        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        return NextResponse.json({ error: `Failed to Generate ${error}` }, { status: 500 });
    }
}



