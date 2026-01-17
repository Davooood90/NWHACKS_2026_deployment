import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json(text);
    } catch (error) {
        return NextResponse.json({ error: `Failed to Generate ${error}` }, { status: 500 });
    }
}
