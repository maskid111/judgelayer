import { ContextParser } from '@/components/context-parser';
import { ContextDisplay } from '@/components/context-display';
import { Zap, Brain } from 'lucide-react';

export const metadata = {
  title: 'Hackathon Context - JudgeLayer',
  description: 'Extract and analyze hackathon details with AI',
};

export default function HackathonPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Hackathon Context Engine
            </h1>
          </div>
          
          <p className="text-center text-purple-300 max-w-2xl mx-auto text-lg">
            Let AI extract and analyze your hackathon details. Paste your rules, 
            criteria, or hackathon website URL, and we&apos;ll automatically parse 
            the key information for accurate evaluations.
          </p>
        </div>
      </div>

      {/* Parser Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Extract Context
            </h2>
          </div>
          
          <ContextParser />
        </div>
      </section>

      {/* Display Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
        <ContextDisplay />
      </section>

      {/* Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Share Details',
                description:
                  'Paste your hackathon rules, judging criteria, sponsor information, or paste a link to your hackathon website.',
              },
              {
                title: 'AI Analysis',
                description:
                  'Our AI system reads and analyzes your hackathon details, extracting key information automatically.',
              },
              {
                title: 'Structured Data',
                description:
                  'Get organized criteria, themes, requirements, and other details ready for consistent evaluations.',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg glassmorphism border border-purple-500/30 hover:border-purple-500/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <span className="text-white font-bold">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-purple-200">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-xl gradient-border">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to evaluate fairly?
            </h2>
            <p className="text-purple-300 mb-6">
              Once you&apos;ve set up your hackathon context, submit projects and 
              get AI-powered evaluations that align with your specific criteria.
            </p>
            <div className="flex gap-4">
              <a
                href="/submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                Submit Project
              </a>
              <a
                href="/dashboard"
                className="px-6 py-3 rounded-lg border border-purple-500/50 hover:border-purple-500/80 text-purple-300 hover:text-white font-semibold transition-all"
              >
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
