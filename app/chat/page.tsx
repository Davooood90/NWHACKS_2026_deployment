import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-[#FFF9F5] pt-20 pb-8 px-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FFAEBC] opacity-10 rounded-blob animate-blob-wobble" />
                <div className="absolute top-40 -right-10 w-48 h-48 bg-[#B4F8C8] opacity-10 rounded-blob animate-blob-wobble animation-delay-2000" />
                <div className="absolute bottom-40 left-10 w-32 h-32 bg-[#E0BBE4] opacity-10 rounded-blob animate-blob-wobble animation-delay-1000" />
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FBE7C6] opacity-10 rounded-blob animate-blob-wobble animation-delay-3000" />
            </div>

            {/* Main content */}
            <div className="relative z-10 h-[calc(100vh-8rem)]">
                <div className="max-w-4xl mx-auto mb-6 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#4A4A4A]">
                        Let&apos;s <span className="text-[#7EC8E3]">rambl</span>
                    </h1>
                    <p className="text-[#7A7A7A] mt-2">
                        Choose your mode and start talking about what&apos;s on your mind
                    </p>
                </div>
                
                <ChatInterface />
            </div>
        </div>
    );
}
