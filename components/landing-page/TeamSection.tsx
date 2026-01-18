import React from "react";

const TeamSection = () => {
  const teamMembers = [
    {
      name: "David",
      title: "Full Stack Developer",
      color: "#7EC8E3",
      // Replace these URLs with your actual local paths (e.g., "/images/david.jpg")
      image:
        "https://i.pinimg.com/236x/68/31/12/68311248ba2f6e0ba94ff6da62eac9f6.jpg",
    },
    {
      name: "Sean",
      title: "AI/ML Engineer",
      color: "#FFAEBC",
      image:
        "https://i.pinimg.com/236x/68/31/12/68311248ba2f6e0ba94ff6da62eac9f6.jpg",
    },
    {
      name: "Daniel",
      title: "Backend Developer",
      color: "#B4F8C8",
      image:
        "https://i.pinimg.com/236x/68/31/12/68311248ba2f6e0ba94ff6da62eac9f6.jpg",
    },
    {
      name: "Cindy",
      title: "UI/UX Designer",
      color: "#FBE7C6",
      image:
        "https://i.pinimg.com/236x/68/31/12/68311248ba2f6e0ba94ff6da62eac9f6.jpg",
    },
  ];

  return (
    <section id="team" className="scroll-mt-24 py-24 bg-[#FFF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A4A4A] mb-4">
            the minds behind the mascots
          </h2>
          <p className="text-lg md:text-xl text-[#7A7A7A] max-w-2xl mx-auto">
            A small team with big hearts, building something meaningful
          </p>
        </div>

        {/* Team Cards - Horizontal Flex Wrap */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              {/* Circular Avatar Frame */}
              <div className="relative mb-4">
                {/* Outer ring with pastel color */}
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full p-2 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: member.color }}
                >
                  {/* Inner circle - Image Container */}
                  <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-xl md:text-2xl font-bold text-[#4A4A4A] mb-1">
                {member.name}
              </h3>

              {/* Title */}
              <p className="text-[#7A7A7A] font-medium">{member.title}</p>
            </div>
          ))}
        </div>

        {/* Optional: Fun tagline */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <span className="text-gray-600 font-medium">Built with</span>
            {/* SVG Heart Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-red-500 animate-pulse"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="text-gray-600 font-medium">at</span>
            <span className="text-gray-600 font-bold">nwHacks 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
