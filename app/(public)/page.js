'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Image from 'next/image';

/**
 * Landing Page
 * Modern hero with image carousel and engaging sections
 */

const heroSlides = [
  {
    image: '/landingPage1.png',
    title: 'Turn Goals',
    highlight: 'Into Daily Routine',
    subtitle: 'Adaptive Routine. Real Results.',
    accent: 'from-blue-600/80 to-blue-800/80',
  },
  {
    image: '/landingPage2.png',
    title: 'Maximize',
    highlight: 'Your Potential',
    subtitle: 'Intelligent routines for unstoppable growth.',
    accent: 'from-slate-600/80 to-slate-800/80',
  },
  {
    image: '/landingPage3.png',
    title: 'Level Up With',
    highlight: 'NeoRoutine',
    subtitle: 'Build habits that transform your life.',
    accent: 'from-sky-600/80 to-sky-800/80',
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image Carousel */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Images */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            {/* Animated Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
              </svg>
              Redesigning habits. One drop at a time.
            </div>

            {/* Dynamic Headline */}
            <h1 
              className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {heroSlides[currentSlide].title}{' '}
              <span className="block text-neo-300">
                {heroSlides[currentSlide].highlight}
              </span>
            </h1>

            {/* Dynamic Subtitle */}
            <p 
              className={`text-xl sm:text-2xl text-white/90 mb-8 max-w-xl transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button href="/register" variant="primary" size="lg" className="shadow-lg shadow-neo-500/30">
                Start Your Journey - Free
              </Button>
              <Button 
                href="/login" 
                variant="secondary" 
                size="lg" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Sign In
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-neo-100 dark:bg-neo-900/50 text-neo-600 dark:text-neo-400 text-sm font-medium mb-4">
              Why NeoRoutine?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-calm-800 dark:text-white mb-4">
              Habits that flow, not force
            </h2>
            <p className="text-lg text-calm-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built on research about sustainable behavior change, Neo Routine removes the 
              pressure that makes most habit apps fail.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Drops not streaks */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-neo-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-neo-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-neo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C9.791 19 8 17.209 8 15C8 13.5 9 11.5 12 8C15 11.5 16 13.5 16 15C16 17.209 14.209 19 12 19Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Drops, Not Streaks</h3>
              <p className="text-calm-600 dark:text-slate-400">
                Each completed task is a drop in your progress pool. Miss one? 
                The water stays - no streak to break, no guilt to feel.
              </p>
            </div>

            {/* Feature 2: Ripple progress */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-neo-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-neo-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-neo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" strokeWidth="2" />
                  <circle cx="12" cy="12" r="2" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Ripple Progress</h3>
              <p className="text-calm-600 dark:text-slate-400">
                See your progress as gentle ripples expanding outward. A calm visualization 
                that celebrates consistency without anxiety.
              </p>
            </div>

            {/* Feature 3: Adaptive reminders */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-neo-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-neo-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mb-6 rounded-xl bg-neo-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Adaptive Reminders</h3>
              <p className="text-calm-600 dark:text-slate-400">
                Struggling? Reminders become softer and more supportive. Thriving? 
                We&apos;ll encourage gradual progression with gentle nudges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neo-600 dark:bg-neo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">10K+</div>
              <p className="text-neo-100">Active Users</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">500K+</div>
              <p className="text-neo-100">Habits Tracked</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">87%</div>
              <p className="text-neo-100">Success Rate</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">4.9</div>
              <p className="text-neo-100">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-24 bg-calm-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-neo-100 dark:bg-neo-900/50 text-neo-600 dark:text-neo-400 text-sm font-medium mb-4">
              See It In Action
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-calm-800 dark:text-white mb-4">
              Transform Your Daily Life
            </h2>
            <p className="text-lg text-calm-600 dark:text-slate-400 max-w-2xl mx-auto">
              See how NeoRoutine helps you build lasting habits with a fresh approach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Showcase Image 1 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
              <div className="aspect-[4/3]">
                <Image
                  src="/landingPage1.png"
                  alt="Turn Goals Into Daily Routine"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-neo-300 text-sm font-medium mb-2">ADAPTIVE ROUTINE</span>
                <h3 className="text-white text-2xl font-bold">Turn Goals Into Daily Routine</h3>
              </div>
            </div>

            {/* Showcase Image 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
              <div className="aspect-[4/3]">
                <Image
                  src="/landingPage2.png"
                  alt="Maximize Your Potential"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-neo-300 text-sm font-medium mb-2">UNSTOPPABLE GROWTH</span>
                <h3 className="text-white text-2xl font-bold">Maximize Your Potential</h3>
              </div>
            </div>

            {/* Showcase Image 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
              <div className="aspect-[4/3]">
                <Image
                  src="/landingPage3.png"
                  alt="Level Up With NeoRoutine"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-neo-300 text-sm font-medium mb-2">LEVEL UP</span>
                <h3 className="text-white text-2xl font-bold">Level Up With NeoRoutine</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-neo-100 dark:bg-neo-900/50 text-neo-600 dark:text-neo-400 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-calm-800 dark:text-white mb-4">
              Simple as water
            </h2>
            <p className="text-lg text-calm-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get started in minutes. No complex setup, no overwhelming options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-neo-100 dark:bg-neo-900/30 group-hover:scale-110 transition-transform duration-300" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neo-500 to-neo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-neo-500/30">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Set Your Flow</h3>
              <p className="text-calm-600 dark:text-slate-400">
                Define your long-term goals and break them into small daily drops.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-neo-100 dark:bg-neo-900/30 group-hover:scale-110 transition-transform duration-300" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neo-500 to-neo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-neo-500/30">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Complete Drops</h3>
              <p className="text-calm-600 dark:text-slate-400">
                Check off your daily drops. Each one adds to your progress pool.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-neo-100 dark:bg-neo-900/30 group-hover:scale-110 transition-transform duration-300" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neo-500 to-neo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-neo-500/30">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-calm-800 dark:text-white mb-3">Watch Ripples Grow</h3>
              <p className="text-calm-600 dark:text-slate-400">
                See your consistent effort visualized as expanding ripples of progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neo-600 via-neo-700 to-neo-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-white animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white animate-ping" style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to flow with your goals?
          </h2>
          <p className="text-xl text-neo-100 mb-10 max-w-2xl mx-auto">
            Join thousands who&apos;ve discovered that sustainable habits come from 
            gentle systems, not forced discipline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/register" variant="primary" size="lg" className="bg-white text-neo-600 hover:bg-neo-50 shadow-xl">
              Start Your Neo Routine - Free
            </Button>
            <Button href="/pricing" variant="secondary" size="lg" className="border-white/30 text-white hover:bg-white/10">
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
