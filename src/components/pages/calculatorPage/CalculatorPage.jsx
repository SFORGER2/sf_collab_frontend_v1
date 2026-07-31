import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  PieChart,
  Percent,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
  Flame,
  TrendingDown
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import NormalCalculator from './NormalCalculatorSection';

const CalculatorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(localStorage.getItem("calculatorActiveTab") || "normal-calculator");
  
  useEffect(() => {
    localStorage.setItem("calculatorActiveTab", activeTab);
  }, [activeTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const upcomingCalculators = [
    { icon: Flame, label: 'Burn Rate', color: 'from-orange-500 to-red-500' },
    { icon: Clock, label: 'Runway', color: 'from-blue-500 to-cyan-500' },
    { icon: TrendingUp, label: 'Valuation', color: 'from-green-500 to-emerald-500' },
    { icon: Percent, label: 'Equity Dilution', color: 'from-purple-500 to-pink-500' },
    { icon: Users, label: 'CAC/LTV', color: 'from-yellow-500 to-orange-500' },
    { icon: Target, label: 'Break Even', color: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-star)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border)]"
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--color-dim)] hover:text-[var(--color-star)]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] rounded-xl shadow-lg shadow-blue-500/20">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                    Calculator Suite
                  </h1>
                  <p className="text-xs text-[var(--color-dim)] mt-1">Professional financial calculations</p>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-[var(--color-cyan)] border-[var(--color-cyan)] px-3 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Tools
            </Badge>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-x-auto"
          >
            <TabsList className="inline-flex bg-[var(--muted)] backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-xl w-full justify-start sm:justify-center">
              <TabsTrigger
                value="normal-calculator"
                className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/40 data-[state=active]:to-cyan-500/40 data-[state=active]:border data-[state=active]:border-[var(--color-cyan)] data-[state=active]:text-[var(--color-star)] text-[var(--color-dim)] hover:text-[var(--color-star)]"
              >
                <Calculator className="w-4 h-4 mr-2" />
                <span>Basic Calculator</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="normal-calculator" className="space-y-6 mt-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <NormalCalculator />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Upcoming Calculators Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[var(--color-star)] flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Coming Soon
            </h2>
            <p className="text-gray-400">More powerful calculators launching soon</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingCalculators.map((calc, idx) => {
              const Icon = calc.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${calc.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative bg-[var(--card)] backdrop-blur border border-[var(--border)] group-hover:border-[var(--color-cyan)] rounded-xl p-4 transition-all">
                    <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${calc.color} mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[var(--color-star)] font-semibold text-sm">{calc.label}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      Coming Soon
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalculatorPage;
