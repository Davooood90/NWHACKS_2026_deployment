import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getPresetById, getDefaultPreset } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

interface HistoryMessage {
    role: "user" | "assistant";
    content: string;
}

async function generateWithModel(
    modelName: string,
    systemInstruction: string,
    history: HistoryMessage[],
    userMessage: string
): Promise<string> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
    });

    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }))
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
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

        let text: string;

        try {
            // Try primary model first
            text = await generateWithModel(PRIMARY_MODEL, systemInstruction, history, userMessage);
        } catch (primaryError) {
            console.warn(`Primary model (${PRIMARY_MODEL}) failed, falling back to ${FALLBACK_MODEL}:`, primaryError);
            // Fall back to lite model
            text = await generateWithModel(FALLBACK_MODEL, systemInstruction, history, userMessage);
        }

        return NextResponse.json({ text });
    } catch (error) {
        return NextResponse.json({ error: `Failed to Generate ${error}` }, { status: 500 });
    }
}



