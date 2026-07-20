import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DescriptionSection({ startup }) {
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid lg:grid-cols-2 gap-8"
    >
      {/* Company Description */}
      <Card className="bg-gray-800 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            About Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">
            {startup.description || "No description provided yet."}
          </p>
        </CardContent>
      </Card>
  
      {/* Financial Overview */}
      <Card className="bg-gray-800 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Funding Round</p>
              <p className="text-white font-semibold capitalize">{startup.funding_round?.replace('-', ' ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Runway</p>
              <p className="text-white font-semibold">{startup.runway_months || 0} months</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Funding</p>
              <p className="text-white font-semibold text-lg">{formatCurrency(startup.funding_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Valuation</p>
              <p className="text-white font-semibold text-lg">{formatCurrency(startup.valuation)}</p>
            </div>
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Annual Revenue</p>
              <p className="text-white font-semibold">{formatCurrency(startup.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Burn</p>
              <p className="text-white font-semibold">{formatCurrency(startup.burn_rate)}</p>
            </div>
          </div>
  
          {startup.financial_notes && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Financial Notes</p>
              <p className="text-gray-300 text-sm">{startup.financial_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}