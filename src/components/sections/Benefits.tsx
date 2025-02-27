
import React from 'react';

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 bg-quantum-50 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-quantum-100/30"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="px-3 py-1 text-xs font-medium bg-quantum-100 text-quantum-700 rounded-full animate-fade-in">
            Why QuantumScribe
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Transform how your team works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            It's not just a tool—it's a transformation engine. QuantumScribe bridges strategy and execution, turning complexity into clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-quantum-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-quantum-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Accelerate Delivery</h3>
                  <p className="text-muted-foreground">
                    Leverage AI-driven predictive insights to identify bottlenecks and streamline your development pipeline.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-quantum-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-quantum-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Enhance Transparency</h3>
                  <p className="text-muted-foreground">
                    Create a culture of visibility with dynamic dashboards and intuitive dependency mapping for stakeholders.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-quantum-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-quantum-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Adapt Seamlessly</h3>
                  <p className="text-muted-foreground">
                    Adjust to evolving project requirements with modular workflows that scale with your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <div className="rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center bg-black/90 px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-medium">Sprint Progress</h4>
                        <p className="text-sm text-gray-500">Team Velocity</p>
                      </div>
                      <div className="text-right">
                        <p className="text-quantum-700 font-semibold">24 / 30 points</p>
                        <p className="text-sm text-gray-500">80% complete</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-quantum-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-gray-500">To Do</p>
                        <p className="font-semibold">3</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="font-semibold">4</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="font-semibold">12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow-lg p-4 transform rotate-3 animate-float">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-medium">Predicted sprint completion: 2 days ahead</p>
                </div>
              </div>
              
              <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow-lg p-4 transform -rotate-2 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-quantum-500 rounded-full"></div>
                  <p className="text-sm font-medium">Team productivity increased by 27%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
