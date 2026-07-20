import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export default function Completion({
    formData,
    roles,
  }) {
  return (
    <div className="text-center py-8 animate-fadeIn">
      <div className="w-24 h-24 bg-linear-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-bounce">
        <CheckCircle size={40} className="text-white" />
      </div>
      <CardTitle className="text-3xl mb-3 text-white">Launch Complete! 🚀</CardTitle>
      <CardDescription className="text-lg mb-6 max-w-md mx-auto text-gray-300">
        Your startup <span className="text-white font-semibold">{formData.name}</span> is now ready to change the world.
      </CardDescription>
      <div className="grid md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-2xl text-white font-bold">{roles.reduce((total, role) => total + (role.positionsNumber || 0), 0)}</div>
            <div className="text-gray-400 text-sm">Open Positions</div>
          </CardContent>
        </Card>
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-2xl text-white font-bold">{roles.length}</div>
            <div className="text-gray-400 text-sm">Roles Defined</div>
          </CardContent>
        </Card>
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-2xl text-white font-bold capitalize">{formData.stage}</div>
            <div className="text-gray-400 text-sm">Current Stage</div>
          </CardContent>
        </Card>
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-2xl text-white font-bold">1200</div>
            <div className="text-gray-400 text-sm">XP Earned</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-lg text-white font-bold">{formatCurrency(formData.funding_amount)}</div>
            <div className="text-gray-400 text-sm">Total Funding</div>
          </CardContent>
        </Card>
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-lg text-white font-bold">{formatCurrency(formData.valuation)}</div>
            <div className="text-gray-400 text-sm">Valuation</div>
          </CardContent>
        </Card>
        <Card className="p-4 border border-gray-600 bg-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-0 text-center">
            <div className="text-lg text-white font-bold">{formData.runway_months}m</div>
            <div className="text-gray-400 text-sm">Runway</div>
          </CardContent>
        </Card>
      </div>
      <Button
        onClick={() => window.location.href = '/dashboard'}
        className="bg-blue-400 hover:bg-blue-500 text-white border-0 px-8 py-3 text-base transition-all hover:scale-105 shadow-lg shadow-blue-400/20"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}