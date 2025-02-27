
import React from 'react';
import { Link } from 'react-router-dom';
import CustomButton from '../ui/CustomButton';

const Cta = () => {
  return (
    <section id="roadmap" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-quantum-700 to-quantum-900"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full animate-fade-in">
              Future Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
              We're just getting started
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              QuantumScribe is continuously evolving to meet the needs of modern agile teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-md px-2 py-1 text-sm font-medium">Q3 2024</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Time Tracking & Budget Management</h3>
              <p className="text-white/70">
                Comprehensive time tracking tools integrated with budget management to help teams monitor project costs and resource allocation in real-time.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-md px-2 py-1 text-sm font-medium">Q1 2025</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Enhanced Generative AI</h3>
              <p className="text-white/70">
                Advanced AI capabilities for automated sprint retrospectives, smart meeting summaries, and predictive risk assessment to streamline team processes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-3">Ready to elevate your workflow?</h3>
                <p className="text-muted-foreground">
                  Join thousands of teams already using QuantumScribe to deliver better results.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <CustomButton 
                    variant="quantum" 
                    size="lg" 
                    withArrow
                    className="text-lg py-5 px-7"
                  >
                    Start Free Trial
                  </CustomButton>
                </Link>
                <Link to="/auth">
                  <CustomButton 
                    variant="outline" 
                    size="lg"
                    className="text-lg py-5 px-7"
                  >
                    Schedule Demo
                  </CustomButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-background to-transparent"></div>
    </section>
  );
};

export default Cta;
