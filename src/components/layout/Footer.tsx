
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-1 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-quantum-700 to-quantum-500 bg-clip-text text-transparent">
                QuantumScribe
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Revolutionizing agile project management with intelligent collaboration tools that empower teams and drive results.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12.5h-3.5v-2h3.5c.276 0 .5.224.5.5v1c0 .276-.224.5-.5.5zm0-5h-3.5v-2h3.5c.276 0 .5.224.5.5v1c0 .276-.224.5-.5.5zm0 8h-10.5c-.276 0-.5.224-.5.5v1c0 .276.224.5.5.5h10.5c.276 0 .5-.224.5-.5v-1c0-.276-.224-.5-.5-.5zm0-8h-10.5c-.276 0-.5.224-.5.5v1c0 .276.224.5.5.5h10.5c.276 0 .5-.224.5-.5v-1c0-.276-.224-.5-.5-.5zm0 4h-10.5c-.276 0-.5.224-.5.5v1c0 .276.224.5.5.5h10.5c.276 0 .5-.224.5-.5v-1c0-.276-.224-.5-.5-.5zm4.5-9h-20c-1.104 0-2 .896-2 2v18c0 1.104.896 2 2 2h20c1.104 0 2-.896 2-2v-18c0-1.104-.896-2-2-2zm0 19h-20v-15h20v15z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Enterprise</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Knowledge Base</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-quantum-600 transition-colors">Webinars</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} QuantumScribe. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-quantum-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-quantum-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-quantum-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
