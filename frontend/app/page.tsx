'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, FiZap, FiShield, FiArrowRight, 
  FiStar, FiClock, FiTrendingUp, FiLayers 
} from 'react-icons/fi';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { 
      credentials: 'include' 
    })
      .then(res => {
        if (res.ok) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);
  
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Image */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo_TaskHive.jpg"
                  alt="TaskHive Logo"
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-purple-500 transition">
                TaskHive
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 px-4 py-2 transition">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 mb-6">
              <FiStar className="text-primary-600" />
              <span className="text-sm text-primary-600 font-medium">Personal Productivity Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Organize Your Tasks
              <br />
              with <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">TaskHive</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A beautiful, secure task management system for personal productivity. 
              Track your tasks, meet deadlines, and achieve your goals.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
                Get Started Free <FiArrowRight className="group-hover:translate-x-1 transition" />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Grid - Updated for Personal Task Management */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Personal Productivity</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your daily tasks effectively
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FiZap, title: 'Lightning Fast', desc: 'Instant task creation and updates with real-time sync', color: 'text-yellow-500' },
              { icon: FiShield, title: 'Secure & Private', desc: 'Your tasks are encrypted and only accessible by you', color: 'text-green-500' },
              { icon: FiClock, title: 'Smart Deadlines', desc: 'Track due dates with overdue alerts and reminders', color: 'text-blue-500' },
              { icon: FiTrendingUp, title: 'Progress Tracking', desc: 'Visual statistics to monitor your productivity', color: 'text-orange-500' },
              { icon: FiLayers, title: 'Priority System', desc: 'Organize tasks by Low, Medium, or High priority', color: 'text-red-500' },
              { icon: FiCheckCircle, title: 'Task Completion', desc: 'Mark tasks complete with satisfying animations', color: 'text-green-600' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group hover:scale-105 transition-transform"
              >
                <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section - Simple and Clean */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 text-center max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary-600">100%</div>
              <p className="text-gray-600">Your Data</p>
              <p className="text-sm text-gray-500">Complete ownership & privacy</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary-600">24/7</div>
              <p className="text-gray-600">Accessibility</p>
              <p className="text-sm text-gray-500">Manage tasks from anywhere</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join TaskHive and take control of your daily tasks
          </p>
          <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2">
            Start Free <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}