import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#022C22] border-t border-[#064E3B]/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-[#10B981]">SnapLink</span>
            </Link>
            <p className="text-[#D1FAE5]/70 text-sm leading-relaxed">
              Real-time messaging with AI-powered assistance. Connect. Chat. Grow.
            </p>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-[#D1FAE5] font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-[#D1FAE5]/70 hover:text-[#10B981] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-[#D1FAE5]/70 hover:text-[#10B981] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-[#D1FAE5]/70 hover:text-[#10B981] transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h5 className="text-[#D1FAE5] font-semibold mb-4">Key Features</h5>
            <p className="text-[#D1FAE5]/70 text-sm">
              Real-time Messaging • Online Presence • Typing Indicators • AI Assistant
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 rounded-lg border border-[#10B981]/30 text-[#10B981] text-sm hover:bg-[#10B981]/10 transition-colors"
            >
              GitHub →
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#064E3B]/30 pt-8 mt-8">
          {/* Bottom Text */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#D1FAE5]/60 text-sm">
              © {currentYear} SnapLink. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#D1FAE5]/60 hover:text-[#10B981] text-sm transition-colors">
                Privacy Policy
              </a>
              <span className="text-[#D1FAE5]/30">•</span>
              <a href="#" className="text-[#D1FAE5]/60 hover:text-[#10B981] text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
