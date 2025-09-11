// src/components/Footer.jsx

import React from 'react';
// Import the Instagram icon
import { BriefcaseBusiness, Mail, Phone, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 border-t border-gray-800 mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-6 md:space-y-0">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Job Sethu</span>
            </div>
            <p className="text-sm">Connecting local talent with community needs.</p>
          </div>
          <div className="flex flex-col space-y-2 text-sm">
            <p className="font-semibold text-white">Contact Us</p>
            <div className="flex items-center justify-center md:justify-start">
              <Mail size={14} className="mr-2" />
              <span>contact@jobsethu.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <Phone size={14} className="mr-2" />
              <span>+91 12345 67890</span>
            </div>
          </div>
          {/* Social Media Links section */}
          <div>
              <p className="font-semibold text-white mb-2">Follow Us</p>
              <a 
                href="https://www.instagram.com/jobsethu_?utm_source=qr&igsh=MWh4NmpoN3g5NXllYg%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={24} />
              </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-8 border-t border-gray-800 pt-4">
          © {new Date().getFullYear()} Job Sethu. All rights reserved. Pune, Maharashtra.
        </div>
      </div>
    </footer>
  );
};

export default Footer;