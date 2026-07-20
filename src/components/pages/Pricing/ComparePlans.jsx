// src/components/pricing/ComparePlans.jsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X } from 'lucide-react';

const ComparePlans = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    { name: "AI Features", tiers: ["5/month", "50/month", "Unlimited", "Unlimited", "Custom"] },
    { name: "Team Size", tiers: ["5", "10", "25", "Unlimited", "Custom"] },
    { name: "Virtual Currency", tiers: ["1x", "1.2x + 10%", "1.5x + 25%", "2x + 50%", "Custom"] },
    { name: "Support Response", tiers: ["72h", "24h", "12h", "4h", "1h"] },
    { name: "Analytics", tiers: ["Basic", "Standard", "Advanced", "Premium", "Enterprise"] },
    { name: "Integrations", tiers: ["None", "Basic", "Advanced", "Full API", "Custom"] },
    { name: "Legal Tools", tiers: ["None", "Basic", "Advanced", "Full Suite", "Custom"] },
    { name: "Custom Branding", tiers: ["No", "Limited", "Yes", "White-label", "Full"] },
  ];

  const plans = [
    { name: "Community", price: "$0", color: "bg-gradient-to-br from-purple-900 to-black" },
    { name: "Builder", price: "$9.99", color: "bg-gradient-to-br from-purple-900 to-black" },
    { name: "Team Lead", price: "$29.99", color: "bg-gradient-to-br from-purple-900 to-black" },
    { name: "Startup Pro", price: "$99.99", color: "bg-gradient-to-br from-purple-900 to-black" },
    { name: "Enterprise", price: "Custom", color: "bg-gradient-to-br from-purple-900 to-black" },
  ];

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      className="py-20"
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-center text-transparent bg-gradient-to-r bg-clip-text from-gray-500 to-gray-300 mb-12">
          Compare All Plans
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gradient-to-br from-purple-900 to-black p-4 text-left font-semibold text-purple-200 border-b rounded-tr rounded-tl">
                  Features
                </th>
                {plans.map((plan, idx) => (
                  <th key={idx} className="p-4 border-b">
                    <div className="text-center">
                      <div className={`p-4 rounded-xl ${plan.color}`}>
                        <div className="font-bold text-lg text-gray-400">{plan.name}</div>
                        <div className="text-gray-200 mt-1">{plan.price}{plan.price !== "$0" && plan.price !== "Custom" ? "/month" : ""}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800 hover:bg-gray-900 hover:cursor-pointer' : 'bg-gray-700 hover:bg-gray-900 hover:cursor-pointer'}>
                  <td className="sticky left-0 bg-inherit p-4 font-medium text-gray-200 border-b">
                    {feature.name}
                  </td>
                  {feature.tiers.map((tier, tierIdx) => (
                    <td key={tierIdx} className="p-4 text-center border-b">
                      <span className="text-gray-400">{tier}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
};

export default ComparePlans;