// src/components/pricing/FAQSection.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does the virtual currency (SF Coins) work?",
      answer: "SF Coins are earned through achievements and can be exchanged for premium features, exclusive items, and services. Higher-tier plans receive bonus coins and better exchange rates."
    },
    {
      question: "Can I switch plans later?",
      answer: "Yes! You can upgrade or downgrade at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at your next billing cycle."
    },
    {
      question: "What's included in the 7-day free trial?",
      answer: "Full access to all features of your chosen paid plan. No credit card required for Builder plan trial. For Team Lead and Startup Pro plans, card required but not charged until trial ends."
    },
    {
      question: "Are there discounts for annual payments?",
      answer: "Yes! All paid plans offer 17% discount for annual commitment. You'll be billed once per year instead of monthly."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and for Enterprise plans, we also accept bank transfers and ACH payments."
    },
    {
      question: "Can I get a refund?",
      answer: "We offer a 30-day money-back guarantee for all annual plans. Monthly plans can be cancelled anytime with prorated refunds for unused time."
    },
    {
      question: "How does the Equity Access program work?",
      answer: "Qualified startups can use our full platform in exchange for equity (5-20% based on valuation). This includes unlimited seats, premium features, and dedicated support."
    },
    {
      question: "Is there a free tier for students or non-profits?",
      answer: "Yes! Verified students get 50% discount on all plans. Non-profits receive 40% discount. Contact our support team with documentation to apply."
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 "
    >
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-bold text-center text-transparent bg-gradient-to-r bg-clip-text from-gray-500 to-gray-300 mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900 rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-800 transition-colors"
              >
                <span className="font-semibold text-gray-200">{faq.question}</span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-200" />
                )}
              </button>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={openIndex === idx ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900 to-black rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-200 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-black hover:from-black hover:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300"
              >
                Chat with Sales
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-800 border border-gray-300 text-gray-200 rounded-xl font-semibold hover:bg-gray-400 hover:text-black transition-all duration-300"
              >
                Schedule a Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQSection;