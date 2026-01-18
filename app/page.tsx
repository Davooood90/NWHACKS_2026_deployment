import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HeroSection from "@/components/landing-page/HeroSection";
import TeamSection from "@/components/landing-page/TeamSection";
import QuestionsSection from "@/components/landing-page/QuestionsSection";
import MotivationSection from "@/components/landing-page/MotivationSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9F5]">
      <HeroSection />
      <MotivationSection />
      <FeaturesSection />
      <TeamSection />
      <QuestionsSection />
    </div>
  );
}
