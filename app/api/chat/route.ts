import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getPresetById, getDefaultPreset } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { presetId, userMessage } = await req.json();

        // Get the system prompt from the preset
        const preset = presetId ? getPresetById(presetId) : getDefaultPreset();
        const systemInstruction = preset?.systemPrompt || getDefaultPreset().systemPrompt;

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });
        
        const result = await model.generateContent(userMessage);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        return NextResponse.json({ error: `Failed to Generate ${error}` }, { status: 500 });
    }
}



