"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Target, TrendingUp, ChevronDown } from "lucide-react";
import { ImageWithFallback } from "@/components/image-with-fallback";

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What type of data is supported?",
      answer:
        "Moneyball supports CSV and XLSX (Excel) file formats. Excel files are particularly well-suited for our platform as they preserve data structure and allow for multiple sheets. Simply upload your player statistics spreadsheet, and our system will automatically parse and visualize the data in our radar chart interface.",
    },
    {
      question: "What kind of teams would benefit from this?",
      answer:
        "Teams looking for a competitive advantage will benefit most from Moneyball. Whether you're a professional club scouting talent, a collegiate program tracking player development, or a youth academy identifying potential, our data-driven approach gives you insights that traditional observation alone cannot provide.",
    },
    {
      question: "How does Moneyball give my team a competitive advantage?",
      answer:
        "Moneyball transforms raw statistics into actionable insights through visual radar charts that make player comparison instant and intuitive. You'll identify strengths, weaknesses, and hidden talent faster than competitors relying on manual analysis.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We take data security seriously. All uploaded files are encrypted in transit and at rest. Your player data belongs to you and is never shared with third parties. We employ industry-standard security practices to ensure your competitive intelligence stays private.",
    },
    {
      question: "Can I compare multiple players at once?",
      answer:
        "Yes! Our comparison view allows you to overlay multiple players on the same radar chart, making it easy to see how they stack up across different performance categories. You can toggle individual players on and off to focus on specific comparisons, perfect for scouting, recruitment, and tactical planning.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a4d2e] relative overflow-x-hidden">
      {/* Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span
            className="text-2xl tracking-tight text-white"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Moneyball
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="hover-lift px-5 py-2 text-xs text-white/50 hover:text-white/90 transition-all uppercase tracking-wide"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              Demo
            </Link>
            <Link
              href="/sign-in"
              className="hover-lift px-5 py-2 text-xs text-white/90 bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] hover:bg-white/[0.14] hover:border-white/25 transition-all uppercase tracking-wide shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.15)]"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("/hero-stadium.png")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(26, 77, 46, 0) 84%, rgba(26, 77, 46, 0.35) 94%, rgba(26, 77, 46, 0.65) 98%, #1a4d2e 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 w-full px-6">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-7xl md:text-8xl lg:text-9xl text-white uppercase tracking-tight leading-none" style={{ marginBottom: "10px" }}>
              Beat Your
              <br />
              Competitors
            </h1>
            <p
              className="text-gray-300 tracking-wide text-xl md:text-2xl"
              style={{
                fontFamily: '"Instrument Sans", sans-serif',
                fontWeight: 400,
                marginTop: "-10px",
              }}
            >
              while you spend less than them
            </p>
            <Link
              href="/upload"
              className="hover-lift mt-10 inline-block px-8 py-3 text-sm text-white/90 bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] hover:bg-white/[0.14] hover:border-white/25 transition-all uppercase tracking-wider shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.2)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Device Showcase Section */}
      <div className="relative z-10 px-6 py-24 bg-white/[0.015] overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="text-white/[0.04] uppercase leading-none w-full text-center block"
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: "17.5vw",
              letterSpacing: "-0.02em",
            }}
          >
            MONEYBALL
          </span>
        </div>
        <div className="relative max-w-[1400px] mx-auto">
          <h2
            className="text-5xl md:text-6xl text-white text-center mb-4"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            A glimpse at Moneyball
          </h2>
          <p
            className="text-center text-gray-200 mb-16 text-lg"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            Access your data anywhere, on any device
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {[
              {
                alt: "Player Analysis",
                src: "/screenshot-analysis.png",
              },
              {
                alt: "Player Comparison",
                src: "/screenshot-comparison.png",
                lift: true,
              },
              {
                alt: "Data Upload",
                src: "/screenshot-upload.png",
              },
            ].map((device) => (
              <div
                key={device.alt}
                className={`relative group ${device.lift ? "md:translate-y-[-20px]" : ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#E8A838] to-[#4a9d5e] rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10">
                  <ImageWithFallback
                    src={device.src}
                    alt={device.alt}
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 px-6 py-24 bg-white/[0.015]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Users size={48} className="text-[#E8A838]" />
              </div>
              <div
                className="text-6xl text-white mb-2"
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                5+
              </div>
              <p
                className="text-xl text-gray-300"
                style={{ fontFamily: '"Instrument Sans", sans-serif' }}
              >
                Player Profiles
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Target size={48} className="text-[#3A7D44]" />
              </div>
              <div
                className="text-6xl text-white mb-2"
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                100+
              </div>
              <p
                className="text-xl text-gray-300"
                style={{ fontFamily: '"Instrument Sans", sans-serif' }}
              >
                Games Analyzed
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp size={48} className="text-[#E8A838]" />
              </div>
              <div
                className="text-6xl text-white mb-2"
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                5+
              </div>
              <p
                className="text-xl text-gray-300"
                style={{ fontFamily: '"Instrument Sans", sans-serif' }}
              >
                Highlights Generated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who is Moneyball for? Section */}
      <div className="relative z-10 px-6 py-24 bg-white/[0.015]">
        <div className="max-w-[1400px] mx-auto">
          <h2
            className="text-5xl md:text-6xl text-white text-center mb-4"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Who is Moneyball for?
          </h2>
          <p
            className="text-center text-gray-200 mb-16 text-lg"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            Empowering every role in the beautiful game
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Athletes",
                image:
                  "https://images.unsplash.com/photo-1580974869414-5e7b7e796a24?w=1080",
                description:
                  "Check your ratings and compare them to other players. Use it to drive your next performance.",
              },
              {
                title: "Coaches",
                image:
                  "https://images.unsplash.com/photo-1609503842755-77f4a81d69ae?w=1080",
                description:
                  "Track player development and team performance with advanced analytics. Make informed decisions backed by comprehensive data.",
              },
              {
                title: "Recruiters",
                image:
                  "https://images.unsplash.com/photo-1601489865452-407a1b801dde?w=1080",
                description:
                  "Discover hidden talent with powerful search filters and detailed player statistics. Find the perfect fit for your team.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
              >
                <div className="h-64 overflow-hidden">
                  <ImageWithFallback
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3
                    className="text-3xl text-white mb-3"
                    style={{ fontFamily: '"Instrument Serif", serif' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-gray-200 leading-relaxed"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 px-6 py-24 bg-white/[0.015]">
        <div className="max-w-[900px] mx-auto">
          <h2
            className="text-4xl md:text-5xl text-white text-center mb-4"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-center text-gray-200 mb-16 text-lg"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            Everything you need to know about Moneyball
          </p>

          <div>
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="hover-lift w-full py-6 flex items-center justify-between text-left transition-all"
                >
                  <span
                    className="text-xl text-white pr-8"
                    style={{ fontFamily: '"Instrument Serif", serif' }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={24}
                    className={`text-[#E8A838] flex-shrink-0 transition-transform duration-300 ${openFaqIndex === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${openFaqIndex === index ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"} overflow-hidden`}
                >
                  <p
                    className="text-gray-300 leading-relaxed"
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                  >
                    {faq.answer}
                  </p>
                </div>
                <div className="border-b border-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-white/[0.015]">
        <div className="max-w-[1400px] mx-auto text-center">
          <p
            className="text-white uppercase tracking-wide"
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontSize: "clamp(0.875rem, 2.5vw, 1.25rem)",
              letterSpacing: "0.05em",
            }}
          >
            © 2026 Brandon Corona — Bhardwaj
          </p>
        </div>
      </footer>
    </div>
  );
}
