import { formatCurrency } from "@/lib/utils";
import { Eye, Building2, DollarSign, User, MapPin, Calendar, Mail, Image, FileText, Code, Users, Rocket, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { roleTypes } from "../elements";
import { API_URL } from "@/utils/config";

export default function StartupReview({
  formData,
  logoFile,
  existingLogo,
  bannerFile,
  existingBanner,
  uploadedDocuments,
  newDocuments,
  existingDocuments,
  removedDocumentIds,
  techStack,
  roles,
}) {
  const allDocuments = [...(uploadedDocuments || []), ...(existingDocuments || []), ...(newDocuments || [])].filter(
    doc => !removedDocumentIds?.includes(doc.id)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Review Your Startup</CardTitle>
        <CardDescription className="text-gray-300">Review all the details before launching</CardDescription>
      </div>
                
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Details */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Startup Name</Label>
              <p className="text-white font-medium text-lg">{formData.name || <span className="text-gray-500 italic">Not provided</span>}</p>
            </div>
            <Separator className="bg-gray-600" />
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Industry</Label>
              <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30">
                {formData.industry || "Not provided"}
              </Badge>
            </div>
            <Separator className="bg-gray-600" />
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Location</Label>
              <div className="flex items-center gap-2 text-white font-medium">
                <MapPin className="w-4 h-4 text-gray-400" />
                {formData.location || <span className="text-gray-500 italic">Not provided</span>}
              </div>
            </div>
            <Separator className="bg-gray-600" />
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Stage</Label>
              <Badge variant="outline" className="bg-purple-400/10 text-purple-400 border-purple-400/30 capitalize">
                {formData.stage || "Not provided"}
              </Badge>
            </div>
          </CardContent>
        </Card>
                
        {/* Financial Details */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Financial Foundation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Funding Round</Label>
                <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30 capitalize">
                  {formData.funding_round?.replace('-', ' ') || "Not provided"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Runway</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-white font-medium">{formData.runway_months || 0} months</p>
                </div>
              </div>
            </div>
            <Separator className="bg-gray-600" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Total Funding</Label>
                <p className="text-white font-medium text-lg">{formatCurrency(formData.funding_amount)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Valuation</Label>
                <p className="text-white font-medium text-lg">{formatCurrency(formData.valuation)}</p>
              </div>
            </div>
            <Separator className="bg-gray-600" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Annual Revenue</Label>
                <p className="text-white font-medium">{formatCurrency(formData.revenue)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Monthly Burn</Label>
                <p className="text-white font-medium">{formatCurrency(formData.burn_rate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
                
        {/* Founder Details */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Founder Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Full Name</Label>
              <div className="flex items-center gap-2 text-white font-medium text-lg">
                <User className="w-4 h-4 text-gray-400" />
                {formData.creator_first_name} {formData.creator_last_name}
              </div>
            </div>
            <Separator className="bg-gray-600" />
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Email</Label>
              <div className="flex items-center gap-2 text-white font-medium">
                <Mail className="w-4 h-4 text-gray-400" />
                {formData.creator_email}
              </div>
            </div>
          </CardContent>
        </Card>

                
        {/* Branding & Documents */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-400" />
              Branding & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo & Banner */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Label className="text-sm text-gray-400 block mb-2">Logo</Label>
                {logoFile ? (
                  <div className="w-16 h-16 rounded-xl border-2 border-blue-400/50 mx-auto overflow-hidden bg-gray-600">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : existingLogo ? (
                  <div className="w-16 h-16 rounded-xl border-2 border-blue-400/50 mx-auto overflow-hidden bg-gray-600">
                    <img
                      src={existingLogo.startsWith('http') ? existingLogo : `${API_URL}/${existingLogo}`}
                      alt="Existing logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-500 flex items-center justify-center mx-auto bg-gray-600/50">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <Label className="text-sm text-gray-400 block mb-2">Banner</Label>
                {bannerFile ? (
                  <div className="w-full h-16 rounded-lg border-2 border-blue-400/50 overflow-hidden bg-gray-600">
                    <img
                      src={URL.createObjectURL(bannerFile)}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : existingBanner ? (
                  <div className="w-full h-16 rounded-lg border-2 border-blue-400/50 overflow-hidden bg-gray-600">
                    <img
                      src={existingBanner.startsWith('http') ? existingBanner : `${API_URL}/${existingBanner}`}
                      alt="Existing banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-16 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center bg-gray-600/50">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
                
            {/* Documents */}
            <div>
              <Label className="text-sm text-gray-400 mb-2 block">Documents ({allDocuments.length})</Label>
              {allDocuments.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {allDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-gray-600 rounded-lg bg-gray-600/30">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm truncate max-w-45">{doc.name}</span>
                        {doc.id && !newDocuments?.find(d => d.id === doc.id) && (
                          <Badge variant="outline" className="bg-gray-500/30 text-gray-300 border-gray-500 text-xs">
                            Existing
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-gray-500/30 text-gray-300 border-gray-500 text-xs">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-gray-600 rounded-lg bg-gray-600/30">
                  <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No documents uploaded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
                      
                                            
        {/* Tech Stack */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm md:col-span-2 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            {techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {techStack.map(tech => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="bg-blue-400/20 text-blue-400 border-blue-400/30"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No technologies specified</p>
            )}
          </CardContent>
        </Card>
                      
        {/* Team & Roles */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm md:col-span-2 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Team & Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Available Positions</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-400/10 border border-blue-400/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">{roles.reduce((total, role) => total + (role.positionsNumber || 0), 0)}</p>
                      <p className="text-gray-400 text-sm">Total positions</p>
                    </div>
                  </div>
                </div>
                <Separator className="bg-gray-600" />
                <div>
                  <Label className="text-sm text-gray-400 mb-2 block">Roles Breakdown</Label>
                  <div className="space-y-2">
                    {roleTypes.map(type => {
                      const count = roles.filter(role => role.roleType === type.value).length;
                      if (count === 0) return null;
                      return (
                        <div key={type.value} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">{type.label}</span>
                          <Badge variant="outline" className="bg-gray-500/30 text-gray-300 border-gray-500">
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            
              <div>
                <Label className="text-sm text-gray-400 mb-3 block">Defined Roles ({roles.length})</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {roles.map((role, index) => {
                    const roleTypeObj = roleTypes.find(type => type.value === role.roleType);
                    return (
                      <Card key={index} className="p-3 border border-gray-600 bg-gray-600/30 hover:border-blue-400/50 transition-colors">
                        <CardContent className="p-0">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium text-sm">{role.title || "Untitled Role"}</span>
                            <Badge variant="outline" className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                              {roleTypeObj?.label || role.roleType}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">Positions</span>
                            <Badge variant="secondary" className="bg-green-400/20 text-green-400 border-green-400/30">
                              {role.positionsNumber || 0}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
            
        {/* Description */}
        <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm md:col-span-2 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-gray-600 rounded-lg bg-gray-600/30">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {formData.description || <span className="text-gray-500 italic">No description provided</span>}
              </p>
            </div>
          </CardContent>
        </Card>
                
        {/* Financial Notes */}
        {formData.financial_notes && (
          <Card className="border-gray-600 bg-gray-700/50 backdrop-blur-sm md:col-span-2 hover:border-blue-400/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Financial Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-gray-600 rounded-lg bg-gray-600/30">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{formData.financial_notes}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}