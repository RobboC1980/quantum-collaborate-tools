
import React, { useEffect, useRef } from 'react';
import Button from '../ui/Button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const heroRect = heroRef.current.getBoundingClientRect();
      const mouseX = e.clientX - heroRect.left;
      const mouseY = e.clientY - heroRect.top;
      
      const items = heroRef.current.querySelectorAll('.parallax-item');
      items.forEach((item: Element) => {
        const depth = parseFloat((item as HTMLElement).dataset.depth || '0.05');
        const moveX = (mouseX - heroRect.width / 2) * depth;
        const moveY = (mouseY - heroRect.height / 2) * depth;
        
        (item as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="min-h-screen relative flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-quantum-100 to-background"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="parallax-item" data-depth="0.02" style={{ position: 'absolute', top: '15%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(163, 210, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
        <div className="parallax-item" data-depth="0.03" style={{ position: 'absolute', top: '60%', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(66, 152, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
        <div className="parallax-item" data-depth="0.04" style={{ position: 'absolute', bottom: '20%', left: '15%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26, 124, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)' }}></div>
      </div>
      
      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="px-3 py-1 text-xs font-medium bg-quantum-100 text-quantum-700 rounded-full">
              Revolutionizing Agile Project Management
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Intelligent collaboration for agile teams
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Streamline workflows, empower teams, and drive results with data-driven insights and seamless integrations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button variant="quantum" size="xl" withArrow>
              Start Free Trial
            </Button>
            <Button variant="outline" size="xl">
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-16 w-full max-w-3xl animate-fade-in shadow-xl rounded-lg overflow-hidden" style={{ animationDelay: '1s' }}>
            <div className="flex items-center bg-black/90 px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-gray-900 aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-quantum-500/10 to-quantum-700/20"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                <div className="animate-pulse mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-quantum-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">App Demo Video</p>
                <p className="text-sm text-gray-300 mt-1">Click to play</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-quantum-600"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
