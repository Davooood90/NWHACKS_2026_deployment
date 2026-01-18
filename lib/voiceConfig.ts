// ElevenLabs voice ID mappings for each personality mode
export interface VoiceConfig {
    id: string;
    name: string;
    voiceId: string;
    description: string;
}

export const voiceConfigs: Record<string, VoiceConfig> = {
    soothing: {
        id: "soothing",
        name: "Lily",
        voiceId: "pFZP5JQG7iQjIQuC4Bku",
        description: "Warm, gentle voice for calming conversations"
    },
    Rational: {
        id: "Rational",
        name: "Charlie",
        voiceId: "IKne3meq5aSn9XLyUdCD",
        description: "Clear, professional voice for logical discussions"
    },
    Bubbly: {
        id: "Bubbly",
        name: "Gigi",
        voiceId: "jBpfuIE2acCO8z3wKNLl",
        description: "Energetic, upbeat voice for motivational chats"
    },
    Ragebait: {
        id: "Ragebait",
        name: "Callum",
        voiceId: "N2lVS1w4EtoT3dr4eOWO",
        description: "Dramatic, intense voice for provocative exchanges"
    }
};

export function getVoiceIdByPresetId(presetId: string): string {
    return voiceConfigs[presetId]?.voiceId || voiceConfigs.soothing.voiceId;
}

export function getVoiceConfigByPresetId(presetId: string): VoiceConfig {
    return voiceConfigs[presetId] || voiceConfigs.soothing;
}
