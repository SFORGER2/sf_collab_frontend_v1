import { BarChart3, CheckCircle, DollarSign, Eye, FileText, Image, Lightbulb, Rocket, Star, Target, TrendingUp, Trophy, User, Users, Zap } from "lucide-react";

  //! Sidebar content for each step 
  export default function SidebarContent({ currentStep }) {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Why This Matters</h3>
            </div>
            <p className="text-gray-300 text-sm">
              A clear company identity helps attract the right talent and investors. 
              Startups with complete profiles get <span className="text-blue-400 font-medium">3x more applications</span>.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Pro Tip</span>
              </div>
              <p className="text-gray-300 text-sm">
                Choose an industry that accurately represents your core business. This helps our algorithm match you with relevant talent.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Founder Credibility</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Complete founder profiles build trust with potential team members. 
              Verified founders see <span className="text-blue-400 font-medium">47% higher response rates</span> from applicants.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Best Practice</span>
              </div>
              <p className="text-gray-300 text-sm">
                Use a professional email address that matches your startup domain when possible. This enhances credibility.
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Stage Selection</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Accurately defining your stage helps match you with candidates who are looking for opportunities at your specific growth phase.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Growth Insight</span>
              </div>
              <p className="text-gray-300 text-sm">
                Early-stage startups typically hire for versatility, while growth-stage companies look for specialized roles.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Financial Transparency</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Startups that share financial metrics attract <span className="text-blue-400 font-medium">62% more serious candidates</span> and build investor confidence.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Financial Best Practices</span>
              </div>
              <p className="text-gray-300 text-sm">
                Be transparent about your runway. Candidates appreciate knowing the company's financial health and stability.
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Brand Impact</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Startups with professional branding receive <span className="text-blue-400 font-medium">2.8x more engagement</span> from potential hires.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Design Tip</span>
              </div>
              <p className="text-gray-300 text-sm">
                Use high-contrast logos that look good in both light and dark modes. Square aspect ratios work best for profile pictures.
              </p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Documentation</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Startups with proper documentation onboard team members <span className="text-blue-400 font-medium">40% faster</span> and build credibility with investors.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Document Strategy</span>
              </div>
              <p className="text-gray-300 text-sm">
                Upload your business plan, pitch deck, or other important documents to showcase your startup's professionalism and preparation.
              </p>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Team Building</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Clearly defined roles help attract qualified candidates. Startups with detailed role descriptions fill positions <span className="text-blue-400 font-medium">40% faster</span>.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Recruitment Strategy</span>
              </div>
              <p className="text-gray-300 text-sm">
                Mix technical and business roles to show balanced growth. Consider remote positions to access global talent pools.
              </p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Final Review</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Take a moment to review all details. Complete and accurate profiles perform significantly better in our matching algorithms.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Quality Check</span>
              </div>
              <p className="text-gray-300 text-sm">
                Ensure all information is consistent and professional. This is your chance to make a great first impression on potential team members.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Ready to Launch</h3>
            </div>
            <p className="text-gray-300 text-sm">
              You're all set! Your startup profile is now active and visible to potential team members.
            </p>
          </div>
        );
    }
  };