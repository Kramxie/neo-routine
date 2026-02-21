import Button from '@/components/ui/Button';
import Image from 'next/image';

/**
 * Landing Page
 * Hero section with value proposition and CTAs
 * Features calm, water-inspired design elements
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-water-bg min-h-[90vh] flex items-center relative overflow-hidden">
        {/* Decorative ripples */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-neo-200 opacity-30 animate-ripple" />
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full border border-neo-300 opacity-20 animate-ripple" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full border border-neo-200 opacity-25 animate-ripple" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              {/* Tagline badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-neo-100 text-neo-700 text-sm font-medium mb-6 animate-drop">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                </svg>
                Redesigning habits. One drop at a time.
              </div>

              {/* Main headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-calm-800 leading-tight mb-6">
                Your goals don&apos;t need pressure.{' '}
                <span className="text-gradient-water">They need a system.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-calm-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Transform overwhelming goals into daily drops. Watch your progress ripple 
                forward - without streak anxiety or guilt.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button href="/register" variant="primary" size="lg">
                  Start Your Neo Routine
                </Button>
                <Button href="/login" variant="secondary" size="lg">
                  Login
                </Button>
              </div>

              {/* Trust indicator */}
              <p className="mt-8 text-sm text-calm-500">
                Free to start | No credit card required | Cancel anytime
              </p>
            </div>

            {/* Right: Visual element */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main progress visualization */}
                <div className="progress-ripple w-64 h-64 sm:w-80 sm:h-80">
                  <div className="text-center z-10 relative">
                    <div className="text-5xl sm:text-6xl font-bold text-neo-600 mb-2">87%</div>
                    <p className="text-calm-600 font-medium">Weekly Progress</p>
                    <p className="text-sm text-calm-500 mt-1">Flowing smoothly</p>
                  </div>
                </div>

                {/* Floating micro-message cards */}
                <div className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-neo px-4 py-3 shadow-neo animate-float">
                  <p className="text-sm text-calm-700">3 drops completed today</p>
                </div>
                <div className="absolute -bottom-4 -right-4 sm:-right-8 bg-white rounded-neo px-4 py-3 shadow-neo animate-float" style={{ animationDelay: '1.5s' }}>
                  <p className="text-sm text-calm-700">Gentle reminder at 9am</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-800 mb-4">
              Habits that flow, not force
            </h2>
            <p className="text-lg text-calm-600 max-w-2xl mx-auto">
              Built on research about sustainable behavior change, Neo Routine removes the 
              pressure that makes most habit apps fail.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Drops not streaks */}
            <div className="card-soft text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2ZM12 19C9.791 19 8 17.209 8 15C8 13.5 9 11.5 12 8C15 11.5 16 13.5 16 15C16 17.209 14.209 19 12 19Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-3">Drops, Not Streaks</h3>
              <p className="text-calm-600">
                Each completed task is a drop in your progress pool. Miss one? 
                The water stays - no streak to break, no guilt to feel.
              </p>
            </div>

            {/* Feature 2: Ripple progress */}
            <div className="card-soft text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" strokeWidth="2" />
                  <circle cx="12" cy="12" r="2" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-3">Ripple Progress</h3>
              <p className="text-calm-600">
                See your progress as gentle ripples expanding outward. A calm visualization 
                that celebrates consistency without anxiety.
              </p>
            </div>

            {/* Feature 3: Adaptive reminders */}
            <div className="card-soft text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neo-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-neo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-3">Adaptive Reminders</h3>
              <p className="text-calm-600">
                Struggling? Reminders become softer and more supportive. Thriving? 
                We&apos;ll encourage gradual progression with gentle nudges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 bg-gradient-to-b from-white to-neo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-800 mb-4">
              Transform Your Daily Life
            </h2>
            <p className="text-lg text-calm-600 max-w-2xl mx-auto">
              See how NeoRoutine helps you build lasting habits with a fresh approach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Showcase Image 1 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-neo hover:shadow-lg transition-shadow duration-300">
              <Image
                src="/landingPage1.png"
                alt="Turn Goals Into Daily Routine"
                width={400}
                height={300}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-calm-800/60 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-semibold">Turn Goals Into Daily Routine</h3>
              </div>
            </div>

            {/* Showcase Image 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-neo hover:shadow-lg transition-shadow duration-300">
              <Image
                src="/landingPage2.png"
                alt="Maximize Your Potential"
                width={400}
                height={300}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-calm-800/60 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-semibold">Maximize Your Potential</h3>
              </div>
            </div>

            {/* Showcase Image 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-neo hover:shadow-lg transition-shadow duration-300">
              <Image
                src="/landingPage3.png"
                alt="Level Up With NeoRoutine"
                width={400}
                height={300}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-calm-800/60 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-semibold">Level Up With NeoRoutine</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-water">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-calm-800 mb-4">
              Simple as water
            </h2>
            <p className="text-lg text-calm-600 max-w-2xl mx-auto">
              Get started in minutes. No complex setup, no overwhelming options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neo-500 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-2">Set Your Flow</h3>
              <p className="text-calm-600">
                Define your long-term goals and break them into small daily drops.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neo-500 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-2">Complete Drops</h3>
              <p className="text-calm-600">
                Check off your daily drops. Each one adds to your progress pool.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neo-500 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-calm-800 mb-2">Watch Ripples Grow</h3>
              <p className="text-calm-600">
                See your consistent effort visualized as expanding ripples of progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-calm-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to flow with your goals?
          </h2>
          <p className="text-lg text-calm-300 mb-8 max-w-2xl mx-auto">
            Join thousands who&apos;ve discovered that sustainable habits come from 
            gentle systems, not forced discipline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/register" variant="primary" size="lg">
              Start Your Neo Routine - Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
