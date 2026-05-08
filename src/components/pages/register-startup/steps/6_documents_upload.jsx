import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, InfoIcon, Upload, X, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AIAPI } from "@/services/auth/AIAPI";
import { toast } from "react-toastify";
import useGetCredits from "@/utils/hooks/useGetCredits";

export default function DocumentsUpload({
  existingDocuments = [],
  uploadedDocuments = [],
  removedDocumentIds = [],
  handleDocumentUpload = () => {},
  removeDocument = () => {},
  setRemovedDocumentIds = () => {},
  formData = {}
}) {
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const { user, access_token } = useSelector((state) => state.auth);
  const credits = useGetCredits();

  const costPerPlan = 10;
  const hasEnoughCredits = credits >= costPerPlan;

  const handleGenerateBusinessPlan = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Company name and description are required');
      return;
    }

    if (!access_token) {
      toast.error('You must be logged in to generate a business plan');
      return;
    }

    if (!hasEnoughCredits) {
      toast.error(`Insufficient credits. You need ${costPerPlan} credits but have ${credits}`);
      return;
    }

    setGeneratingPlan(true);

    try {
      const body = {
        content_type: 'business_plan',
        max_tokens: 4096,
        metadata: {
          business_idea: formData.description,
          industry: formData.industry || 'Technology',
          budget: formData.budget || 'Not specified',
          location: formData.location || 'Not specified',
          company_name: formData.name
        }
      };

      const response = await AIAPI.generateBusinessPlan(body, access_token);
      
      if (!response?.success) {
        throw new Error(response?.message || "Generation failed");
      }

      // Convert markdown to file and add to uploaded documents
      const mdContent = response?.data.response || '';
      const fileName = `${formData.name.replace(/\s+/g, '_')}_business_plan.md`;
      const file = new File([mdContent], fileName, { type: 'text/markdown' });
      
      handleDocumentUpload({ target: { files: [file] } });
      toast.success('Business plan generated and added successfully!');
      setShowPlanGenerator(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to generate business plan. Please try again later.');
      console.error('Plan generation error:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl mb-2 text-white">Company Documents</CardTitle>
        <CardDescription className="text-gray-300">Upload important documents for your startup</CardDescription>
      </div>

      <Button
        onClick={() => setShowPlanGenerator(!showPlanGenerator)}
        className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {showPlanGenerator ? 'Hide Generator' : 'Generate Business Plan with AI'}
      </Button>

      {showPlanGenerator && (
        <div className="border border-neutral-700/50 rounded-2xl p-6 bg-neutral-900/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">AI Business Plan Generator</h3>
            <div className="flex gap-4 text-sm">
              <div className="bg-neutral-800 rounded-lg px-3 py-2">
                <p className="text-neutral-400">Your Credits</p>
                <p className="text-white font-semibold">{credits}</p>
              </div>
              <div className={`rounded-lg px-3 py-2 ${hasEnoughCredits ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <p className="text-neutral-400">Cost</p>
                <p className={hasEnoughCredits ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{costPerPlan}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerateBusinessPlan} className="space-y-4">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm text-neutral-300">
              <p><strong>Company:</strong> {formData.name || 'Not provided'}</p>
              <p className="mt-2"><strong>Description:</strong> {formData.description || 'Not provided'}</p>
              <p className="mt-2"><strong>Industry:</strong> {formData.industry || 'Not provided'}</p>
            </div>

            <Button
              type="submit"
              disabled={generatingPlan || !hasEnoughCredits}
              className="w-full bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50"
            >
              {generatingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Business Plan
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-white flex items-center gap-2 justify-between w-full">
            Business Plan & Documents
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-600 transition-colors">
                  <InfoIcon className="size-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent arrowColor="bg-gray-800 fill-gray-800" className="max-w-xs bg-gray-800 fill-gray-800 border-gray-600 text-white">
                <p>Upload your business plan, pitch deck, or other important documents. PDF, DOC, DOCX files up to 10MB.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Card className="border-2 bg-blue-400/5 hover:scale-101 border-dashed border-gray-600 p-6 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-400/10 backdrop-blur-sm">
            <CardContent className="p-0">
              <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <div className="text-gray-300 font-medium mb-1">Upload Documents</div>
              <div className="text-gray-500 text-xs">PDF, DOC, DOCX up to 10MB each</div>
            
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="document-upload"
                onChange={handleDocumentUpload}
              />
              <Button
                onClick={() => document.getElementById('document-upload')?.click()}
                className="mt-4 bg-blue-400 hover:bg-blue-500 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing documents */}
        {existingDocuments.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">Existing Documents</Label>
            <div className="space-y-2">
              {existingDocuments
                .filter(doc => !removedDocumentIds.includes(doc.id))
                .map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-white text-sm truncate">{doc.filename}</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemovedDocumentIds(prev => [...prev, doc.id])}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Newly uploaded documents */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">New Documents</Label>
            <div className="space-y-2">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-white text-sm truncate">{doc.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}