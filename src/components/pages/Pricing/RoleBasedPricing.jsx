// src/components/pricing/RoleBasedPricing.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  Code, 
  Palette, 
  Database,
  TrendingUp,
  Shield
} from 'lucide-react';

const roleCategories = [
  {
    id: 'founder',
    name: 'Founders & Leadership',
    roles: ['founder', 'advisor', 'partner'],
    icon: Briefcase,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  },
  {
    id: 'technical',
    name: 'Technical Roles',
    roles: [
      'backend_engineer', 'frontend_engineer', 'fullstack_engineer',
      'mobile_engineer', 'software_architect', 'devops_engineer',
      'cloud_engineer', 'sre', 'cybersecurity_engineer'
    ],
    icon: Code,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  },
  {
    id: 'data',
    name: 'Data & AI',
    roles: [
      'data_scientist', 'data_engineer', 'machine_learning_engineer',
      'ai_engineer', 'mlops_engineer', 'data_analyst'
    ],
    icon: Database,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  },
  {
    id: 'product',
    name: 'Product & Design',
    roles: [
      'product_manager', 'product_owner', 'ux_designer',
      'ui_designer', 'product_designer', 'ux_researcher'
    ],
    icon: Palette,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  },
  {
    id: 'growth',
    name: 'Growth & Marketing',
    roles: [
      'growth_engineer', 'growth_marketer', 'seo_specialist',
      'content_strategist'
    ],
    icon: TrendingUp,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  },
  {
    id: 'investor',
    name: 'Investors & Advisors',
    roles: ['investor', 'advisor', 'mentor'],
    icon: BarChart3,
    color: 'hover:from-indigo-700 hover:to-purple-700'
  }
];

const RoleBasedPricing = () => {
  const [selectedCategory, setSelectedCategory] = useState('founder');
  const [selectedRole, setSelectedRole] = useState('founder');

  const currentCategory = roleCategories.find(cat => cat.id === selectedCategory);
  const Icon = currentCategory?.icon;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-16 px-4"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-200 text-center mb-2">
          Find Your Perfect Plan
        </h2>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-200 text-center mb-12">
          Select your role to see recommended features and pricing
        </p>

        {/* Role Category Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {roleCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300
                  ${selectedCategory === category.id 
                    ? `border-gray-200 bg-gradient-to-br ${category.color} text-white shadow-lg` 
                    : 'border-gray-200 bg-gradient-to-br from-black to-purple-900 text-white/80'
                  }
                `}
              >
                <CategoryIcon className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Role Details and Recommended Plan */}
        <motion.div 
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black to-purple-900 rounded-2xl border border-gray-200 p-6 shadow-lg"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-400 mb-4">
                Recommended for {currentCategory?.name}
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-200">Team Lead Plan</h4>
                  <p className="text-gray-200 text-sm mt-1">$29.99/month</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-200">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Team management (up to 25 members)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Advanced analytics and reporting
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Priority 24-hour support
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Custom branding for projects
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Recommended Add-ons</h4>
                  {selectedCategory === 'technical' && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                      <p className="font-medium text-green-800">Technical Bundle</p>
                      <p className="text-sm text-green-600">+$19.99/month</p>
                    </div>
                  )}
                  {selectedCategory === 'data' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                      <p className="font-medium text-purple-800">Data & AI Bundle</p>
                      <p className="text-sm text-purple-600">+$24.99/month</p>
                    </div>
                  )}
                  {selectedCategory === 'product' && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg">
                      <p className="font-medium text-orange-800">Design & Product Bundle</p>
                      <p className="text-sm text-orange-600">+$14.99/month</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-400 mb-3">Virtual Currency Benefits</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="font-medium text-gray-200">XP Multiplier</span>
                  <span className="font-bold text-gray-200">1.5x</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="font-medium text-gray-200">Exchange Bonus</span>
                  <span className="font-bold text-gray-200">25%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="font-medium text-gray-200">Monthly Coins</span>
                  <span className="font-bold text-gray-200">200 SF Coins</span>
                </div>
              </div>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-black text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start 7-Day Free Trial
                </motion.button>
                <p className="text-center text-white text-sm mt-2">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RoleBasedPricing;