import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { THEME_EXTRACTION_PROMPT, ThemeExtractionResult } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

// Common stop words to filter out before analysis
const STOP_WORDS = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
    "at", "by", "for", "with", "about", "against", "between", "into", "through",
    "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just",
    "don", "don't", "should", "should've", "now", "d", "ll", "m", "o", "re",
    "ve", "y", "ain", "aren", "aren't", "couldn", "couldn't", "didn", "didn't",
    "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't",
    "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't", "needn",
    "needn't", "shan", "shan't", "shouldn", "shouldn't", "wasn", "wasn't",
    "weren", "weren't", "won", "won't", "wouldn", "wouldn't", "im", "i'm",
    "its", "it's", "really", "like", "get", "got", "going", "go", "know",
    "think", "want", "feel", "feeling", "thing", "things", "lot", "much",
    "also", "even", "still", "already", "always", "never", "sometimes",
    "often", "usually", "maybe", "probably", "yeah", "yes", "ok", "okay",
    "well", "um", "uh", "ah", "oh", "hey", "hi", "hello", "thanks", "thank",
    "please", "sorry", "sure", "right", "actually", "basically", "literally",
    "kind", "kinda", "sort", "sorta", "something", "anything", "everything",
    "nothing", "someone", "anyone", "everyone", "no one", "nobody", "somebody",
]);

function filterStopWords(text: string): string {
    const words = text.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, "");
        return cleaned.length > 1 && !STOP_WORDS.has(cleaned);
    });
    return filteredWords.join(" ");
}

async function extractThemesWithModel(
    modelName: string,
    userContent: string
): Promise<ThemeExtractionResult> {
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: THEME_EXTRACTION_PROMPT,
    });

    // Filter stop words from user content
    const filteredContent = filterStopWords(userContent);

    const prompt = `Analyze these user messages and extract key themes (1-5 total):

Original messages: "${userContent}"

Filtered key words: ${filteredContent}

Return only a valid JSON object with the themes array.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    try {
        const parsed = JSON.parse(jsonStr) as ThemeExtractionResult;
        
        // Validate and limit to 5 themes
        if (parsed.themes && Array.isArray(parsed.themes)) {
            parsed.themes = parsed.themes.slice(0, 5);
            return parsed;
        }
        
        return { themes: [] };
    } catch {
        console.error("Failed to parse theme extraction response:", responseText);
        return { themes: [] };
    }
}

export async function POST(req: Request) {
    try {
        const { userMessages } = await req.json() as {
            userMessages: string[];
        };

        if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
            return NextResponse.json(
                { error: "userMessages array is required" },
                { status: 400 }
            );
        }

        // Combine all user messages
        const userContent = userMessages.join(" ");

        let result: ThemeExtractionResult;

        try {
            // Try primary model first
            result = await extractThemesWithModel(PRIMARY_MODEL, userContent);
        } catch (primaryError) {
            console.warn(
                `Primary model (${PRIMARY_MODEL}) failed for theme extraction, falling back to ${FALLBACK_MODEL}:`,
                primaryError
            );
            // Fall back to lite model
            result = await extractThemesWithModel(FALLBACK_MODEL, userContent);
        }

        // Ensure at least 1 theme is returned
        if (result.themes.length === 0) {
            result.themes = [{ type: "theme", value: "Other" }];
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Theme extraction error:", error);
        return NextResponse.json(
            { error: `Failed to extract themes: ${error}` },
            { status: 500 }
        );
    }
}
