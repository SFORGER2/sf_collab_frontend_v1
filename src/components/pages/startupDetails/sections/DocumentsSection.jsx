import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reduceText } from "@/utils/reduceText";
import { Plus, FileText, Download, Trash2, Eye, EyeOff, Grid3x3, List, FilePlus } from "lucide-react";
import UploadDocumentModal from "../modals/UploadDocument";
import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { motion } from "framer-motion";
import DeleteConfirmationModal from "@/utils/confirm";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function DocumentsSection({ documents, isAdmin, id, fetchStartupData }) {
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    document: null,
    document_type: 'general'
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(null);
  const [view, setView] = useState(localStorage.getItem("documentsView") || "grid");
  useEffect(() => {
    localStorage.setItem("documentsView", view);
  }, [view]);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentForm.document) return;

    const formData = new FormData();
    formData.append('document', documentForm.document);
    formData.append('document_type', documentForm.document_type);
    formData.append('visible_by', documentForm.visible_by || 'private');

    try {
      const response = await startupsAPI.uploadDocument(id, formData);

      if (response.success) {
        toast.success('Document uploaded successfully');
        setIsUploadDocModalOpen(false);
        setDocumentForm({ document: null, document_type: 'general' });
        fetchStartupData();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch {
      toast.error('Error uploading document');
    }
  };

  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await startupsAPI.downloadDocument(id, documentId);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Error downloading document');
      console.error('Error downloading document:', error);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    try {
      const response = await startupsAPI.deleteDocument(id, documentId);

      if (response.success) {
        toast.success('Document deleted successfully');
        fetchStartupData();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast.error('Error deleting document');
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(null)}
        onConfirm={() => {
          handleDocumentDelete(isDeleteConfirmOpen);
          setIsDeleteConfirmOpen(null);
        }}
        title="Confirm Document Deletion"
        message="Are you sure you want to delete this document?"
        type="soft"
      />
      <div className="space-y-6">
        <motion.div
          className="flex flex-wrap items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="flex-1 text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Documents
          </h2>
          
          <div className="flex flex-1 justify-end gap-2">
            <Button onClick={() => setView("grid")} variant={view === "grid" ? "default" : "ghost"}>
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button onClick={() => setView("list")} variant={view === "list" ? "default" : "ghost"}>
              <List className="w-4 h-4" />
            </Button>
            {isAdmin && (
            <Button
              onClick={() => setIsUploadDocModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <FilePlus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
          </div>
        </motion.div>

        <motion.div
          className={`grid ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {documents.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-lg">No documents found</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            documents.map((doc, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {!isMobile && (
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white break-words">
                            {reduceText(doc.filename, 40)}
                          </CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                            {(doc.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                          {doc.document_type}
                        </Badge>
                        <Badge className="bg-white/10 text-white text-sm">
                          {doc.visible_by === 'public' ? (
                            <Eye className="w-3 h-3 mr-1 inline-block" />
                          ) : (
                            <EyeOff className="w-3 h-3 mr-1 inline-block" />
                          )}
                          {doc.visible_by.charAt(0).toUpperCase() + doc.visible_by.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2 border-t border-gray-700/50 pt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(doc.id, doc.filename)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </motion.div>
                    {isAdmin && (
                      <motion.div className="flex gap-2" whileHover={{ scale: 1.02 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsDeleteConfirmOpen(doc.id)}
                          className="border-red-600/50 bg-red-600 text-white hover:bg-white hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </motion.div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <UploadDocumentModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        onSubmit={handleDocumentUpload}
        formData={documentForm}
        onFormChange={setDocumentForm}
      />
    </>
  );
}
