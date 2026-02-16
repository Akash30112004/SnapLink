import { Link } from 'react-router-dom';
import { ArrowRight, Send, MessageCircle, Zap, Users, MessageSquare as MessageIcon, Bot } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import FeatureCard from '../components/home/FeatureCard';
import StepCard from '../components/home/StepCard';
import Footer from '../components/home/Footer';
import { ROUTES } from '../utils/constants';

const Home = () => {
  return (
    <div className="bg-[#022C22] min-h-screen overflow-hidden">
      <Navbar />

      {/* PHASE 2: Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Animated background gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-linear-to-br from-[#064E3B] to-[#10B981] rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                <span className="bg-linear-to-r from-[#10B981] via-[#D1FAE5] to-[#10B981] bg-clip-text text-transparent">
                  SnapLink
                </span>
              </h1>
              <div className="w-20 h-1 bg-linear-to-r from-[#10B981] to-[#065F46] rounded-full mb-6" />
            </div>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#D1FAE5] mb-8 leading-relaxed max-w-lg">
              Real-time messaging with AI-powered assistance. Connect. Chat. Grow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to={ROUTES.LOGIN}
                className="
                  px-8 py-4 rounded-xl
                  bg-linear-to-r from-[#10B981] to-[#065F46]
                  text-white font-semibold
                  hover:shadow-2xl hover:shadow-[#10B981]/40
                  transform hover:scale-105 active:scale-95
                  transition-all duration-300
                  flex items-center justify-center gap-2
                "
              >
                Login <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="
                  px-8 py-4 rounded-xl
                  border-2 border-[#10B981]
                  text-[#10B981] font-semibold
                  hover:bg-[#10B981]/10
                  transform hover:scale-105 active:scale-95
                  transition-all duration-300
                  flex items-center justify-center gap-2
                "
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Product Features Trust */}
            <div className="flex items-center gap-6 text-sm text-[#D1FAE5]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span>Live Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span>Instant Notifications</span>
              </div>
            </div>
          </div>

          {/* Right Side: Chat UI Preview Mock */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="w-full max-w-md">
              {/* Chat Window Mock */}
              <div className="bg-gradient-to-b from-[#064E3B] to-[#022C22] rounded-3xl border-2 border-[#10B981]/30 shadow-2xl shadow-[#10B981]/20 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                {/* Chat Header */}
                <div className="h-16 bg-linear-to-r from-[#10B981] to-[#065F46] px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">AI Assistant</p>
                      <p className="text-white/80 text-xs">Online</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-[#D1FAE5] rounded-full animate-pulse" />
                </div>

                {/* Messages Area */}
                <div className="h-80 px-6 py-6 space-y-4 flex flex-col justify-end">
                  {/* Received Message */}
                  <div className="flex justify-start">
                    <div className="max-w-xs bg-white/10 backdrop-blur border border-white/20 text-[#D1FAE5] px-4 py-2 rounded-2xl rounded-bl-none">
                      <p className="text-sm">Hey! How can I help?</p>
                    </div>
                  </div>

                  {/* Sent Message */}
                  <div className="flex justify-end">
                    <div className="max-w-xs bg-linear-to-r from-[#10B981] to-[#065F46] text-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg">
                      <p className="text-sm">Connect my team instantly! 🚀</p>
                    </div>
                  </div>

                  {/* Received Message */}
                  <div className="flex justify-start">
                    <div className="max-w-xs bg-white/10 backdrop-blur border border-white/20 text-[#D1FAE5] px-4 py-2 rounded-2xl rounded-bl-none">
                      <p className="text-sm">Perfect! Let's get started.</p>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur border border-white/20 text-[#D1FAE5] px-4 py-2 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="h-20 border-t border-[#064E3B]/50 bg-[#022C22]/50 px-6 py-4 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    disabled
                    className="flex-1 bg-white/5 border border-[#10B981]/30 rounded-lg px-4 py-2 text-[#D1FAE5] placeholder-[#D1FAE5]/50 text-sm focus:outline-none"
                  />
                  <button className="p-2 rounded-lg bg-linear-to-r from-[#10B981] to-[#065F46] text-white hover:shadow-lg transition-shadow">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHASE 3: Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#022C22]">
        {/* Animated background gradient orbs */}
        <div className="absolute top-40 right-20 w-80 h-80 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-full blur-3xl opacity-5" />
        <div className="absolute bottom-32 left-20 w-96 h-96 bg-linear-to-br from-[#064E3B] to-[#10B981] rounded-full blur-3xl opacity-5" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-[#10B981] via-[#D1FAE5] to-[#10B981] bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-[#D1FAE5]/80 max-w-2xl mx-auto">
              Everything you need for seamless real-time communication with advanced features
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Zap}
              title="Real-Time Messaging"
              description="Send and receive messages instantly with Socket.IO powered real-time updates. No delays, pure speed."
            />
            <FeatureCard
              icon={Users}
              title="Online Presence"
              description="See who's online and available. Real-time status updates show when contacts come online or go offline."
            />
            <FeatureCard
              icon={MessageIcon}
              title="Typing Indicators"
              description="Know when someone is typing. Live typing notifications keep conversations flowing naturally."
            />
            <FeatureCard
              icon={Bot}
              title="AI Chatbot"
              description="Get instant help from our AI assistant. Answer questions, get suggestions, and enhance productivity."
            />
          </div>
        </div>
      </section>

      {/* PHASE 4: How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#022C22]">
        {/* Animated background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-full blur-3xl opacity-5" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-[#10B981] via-[#D1FAE5] to-[#10B981] bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg text-[#D1FAE5]/80 max-w-2xl mx-auto">
              Get started in three simple steps and start chatting instantly
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Create Account"
              description="Sign up in seconds with your email or social account. Set your profile and you're ready to go."
            />

            <StepCard
              number={2}
              title="Start Chatting"
              description="Find friends or create group conversations. Browse contacts and begin your first conversation."
            />

            <StepCard
              number={3}
              title="Chat in Real-Time"
              description="Enjoy instant messaging with typing indicators and presence. Stay connected with your team."
            />
          </div>
        </div>
      </section>

      {/* PHASE 4: Call To Action Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#022C22]">
        {/* Animated background gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-linear-to-r from-[#10B981]/10 to-[#065F46]/10 rounded-full blur-3xl opacity-30" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-linear-to-r from-[#10B981] via-[#D1FAE5] to-[#10B981] bg-clip-text text-transparent">
              Start Chatting in Seconds
            </span>
          </h2>

          <p className="text-lg text-[#D1FAE5]/80 mb-8 leading-relaxed">
            Join thousands of users who are already enjoying seamless real-time communication. No credit card required.
          </p>

          <Link
            to={ROUTES.REGISTER}
            className="
              inline-flex items-center gap-2
              px-10 py-4 rounded-xl
              bg-linear-to-r from-[#10B981] to-[#065F46]
              text-white font-semibold text-lg
              hover:shadow-2xl hover:shadow-[#10B981]/40
              transform hover:scale-105 active:scale-95
              transition-all duration-300
            "
          >
            Create Free Account <ArrowRight className="w-6 h-6" />
          </Link>

          {/* Secondary CTA */}
          <div className="mt-8 text-[#D1FAE5]/70 text-sm">
            or <a href={ROUTES.LOGIN} className="text-[#10B981] hover:text-[#D1FAE5] font-semibold transition-colors">
              Login to your account
            </a>
          </div>
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
