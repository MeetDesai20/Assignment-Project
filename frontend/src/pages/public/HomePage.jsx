import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components';

/**
 * Homepage
 * Landing page with CTA and platform overview
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-headline-md font-headline font-bold gradient-text">
            Ethereal Ledger
          </h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-display-lg font-headline font-bold text-on-surface leading-tight">
                Track Golf.
                <br />
                <span className="gradient-text">Win Prizes.</span>
                <br />
                Support Charity.
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-lg">
                Join a premium platform where your golf passion combines with meaningful charitable
                impact. Track scores, compete in monthly draws, and support causes you care about.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" icon="start" iconPosition="right">
                  Start Playing
                </Button>
              </Link>
              <Button variant="secondary" size="lg" icon="info" iconPosition="right">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <p className="text-headline-sm font-headline font-bold text-primary">10K+</p>
                <p className="text-label-sm text-on-surface-variant">Active Players</p>
              </div>
              <div>
                <p className="text-headline-sm font-headline font-bold text-tertiary">$500K+</p>
                <p className="text-label-sm text-on-surface-variant">Prize Pool</p>
              </div>
              <div>
                <p className="text-headline-sm font-headline font-bold text-secondary">50+</p>
                <p className="text-label-sm text-on-surface-variant">Charities</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hidden md:flex h-96 bg-gradient-to-br from-primary/20 via-surface-container to-tertiary/20 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-8xl text-primary/30">
                  sports_golf
                </span>
                <p className="text-on-surface-variant">Premium Golf Platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-4">
            Why Join?
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Experience a platform designed specifically for golfers who want to play smarter, win
            bigger, and give back.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: 'leaderboard',
              title: 'Track Performance',
              description: 'Monitor your golf scores in real-time with our advanced analytics.',
            },
            {
              icon: 'card_giftcard',
              title: 'Win Monthly Prizes',
              description: 'Compete in draws and win substantial prizes every month.',
            },
            {
              icon: 'favorite',
              title: 'Support Charity',
              description: 'A portion of every subscription goes to your chosen charity.',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="text-center p-8">
              <span className="material-symbols-outlined text-5xl text-primary mx-auto block mb-4">
                {feature.icon}
              </span>
              <h3 className="text-headline-sm font-headline font-bold text-on-surface mb-2">
                {feature.title}
              </h3>
              <p className="text-body-md text-on-surface-variant">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-20">
        <Card className="p-12 text-center bg-gradient-to-r from-primary/10 via-surface-container to-tertiary/10">
          <h2 className="text-headline-lg font-headline font-bold text-on-surface mb-4">
            Ready to Join?
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-lg mx-auto">
            Start your Ethereal Ledger journey today. Choose monthly or yearly and unlock premium
            features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/20 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-on-surface-variant text-label-md">
          <p>&copy; 2026 The Ethereal Ledger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
