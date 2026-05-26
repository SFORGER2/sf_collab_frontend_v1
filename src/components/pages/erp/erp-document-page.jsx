// src/components/pages/erp/erp-document-page.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Folder,
  FileText,
  Download,
  Eye,
  Search,
  ArrowLeft,
  X,
  Archive,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  requestInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from "../../../utils/APIs/interceptors";

// Use correct base URL for ERP documents
const api = axios.create({ baseURL: "/api/erp-documents" });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const DocumentsPage = () => {
  const { user } = useSelector((s) => s.auth);
  const workspaceId = user?.active_workspace_id || 1;

  const [activeRole, setActiveRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [modalPath, setModalPath] = useState([]);
  const [modalItems, setModalItems] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState("file");
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [notice, setNotice] = useState(null);

  const [rootFiles, setRootFiles] = useState([]);
  const [stats, setStats] = useState({ totalFiles: 0, folders: 0 });
  const [loading, setLoading] = useState(true);

  const flash = (msg, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 3000);
  };

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/list", { params: { workspace_id: workspaceId } });
      const docs = res.data?.data?.documents || res.data?.documents || [];
      const docsArray = Array.isArray(docs) ? docs : [];

      const folderMap = {};
      const looseFiles = [];

      docsArray.forEach((doc) => {
        const folder = doc.folder || "general";
        const fileItem = {
          id: doc.id,
          type: "file",
          name: doc.original_filename,
          modified: doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
          size: doc.file_size
            ? doc.file_size > 1024 ** 2
              ? `${(doc.file_size / 1024 ** 2).toFixed(1)} MB`
              : `${Math.round(doc.file_size / 1024)} KB`
            : null,
          _docId: doc.id,
        };
        if (folder === "general") {
          looseFiles.push(fileItem);
        } else {
          if (!folderMap[folder]) {
            folderMap[folder] = {
              id: `folder-${folder}`,
              type: "folder",
              name: folder.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              modified: "—",
              items: 0,
              children: [],
              _folder: folder,
            };
          }
          folderMap[folder].children.push(fileItem);
          folderMap[folder].items += 1;
        }
      });

      const tree = [...Object.values(folderMap), ...looseFiles];
      setRootFiles(tree);
      setStats({ totalFiles: docsArray.length, folders: Object.keys(folderMap).length });
    } catch (err) {
      console.error("Failed to load documents", err);
      setRootFiles([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    const role = localStorage.getItem("activeRole");
    if (role) setActiveRole(role);
  }, []);

  const filteredRootFiles = rootFiles.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFolderByPath = (path) => {
    if (path.length === 0) return null;
    let current = rootFiles.find(
      (f) => f.name === path[0] && f.type === "folder"
    );
    if (!current) return null;
    for (let i = 1; i < path.length; i++) {
      current = current.children?.find(
        (f) => f.name === path[i] && f.type === "folder"
      );
      if (!current) return null;
    }
    return current;
  };

  const handleOpenFolder = (folder) => {
    setModalPath([folder.name]);
    const folderData = getFolderByPath([folder.name]);
    setModalItems(folderData?.children || []);
    setIsFolderModalOpen(true);
  };

  const handleSubFolderClick = (folderName) => {
    const newPath = [...modalPath, folderName];
    setModalPath(newPath);
    const folderData = getFolderByPath(newPath);
    setModalItems(folderData?.children || []);
  };

  const handleModalBack = () => {
    if (modalPath.length <= 1) {
      closeFolderModal();
      return;
    }
    const newPath = modalPath.slice(0, -1);
    setModalPath(newPath);
    const folderData = getFolderByPath(newPath);
    setModalItems(folderData?.children || []);
  };

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
    setModalPath([]);
    setModalItems([]);
  };

  const handleUnzip = (zipItem, isInModal = false) => {
    const extractedFolderName = zipItem.name.replace(".zip", "");
    const newExtractedFolder = {
      id: Date.now(),
      type: "folder",
      name: extractedFolderName,
      modified: "just now",
      items: 3,
      children: [
        { id: Date.now() + 1, type: "file", name: "README.txt", modified: "just now", size: "2 KB" },
        { id: Date.now() + 2, type: "file", name: "Extracted_Document.pdf", modified: "just now", size: "1.4 MB" },
        { id: Date.now() + 3, type: "file", name: "Summary.xlsx", modified: "just now", size: "245 KB" },
      ],
    };
    if (!isInModal) {
      setRootFiles((prev) => [newExtractedFolder, ...prev.filter((f) => f.id !== zipItem.id)]);
    } else {
      setModalItems((prev) => [newExtractedFolder, ...prev.filter((f) => f.id !== zipItem.id)]);
    }
  };

  const handlePreview = async (file) => {
    if (file.type === "folder") return;
    setSelectedFile(file);
    setPreviewLoading(true);
    setPreviewContent(null);
    setPreviewType(null);
    setPreviewText(null);
    try {
      const res = await api.get(`/${file._docId}/download`, { responseType: "blob" });
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setPreviewContent(url);
      setPreviewType(blob.type);
      if (blob.type.startsWith("text/")) {
        const text = await blob.text();
        setPreviewText(text);
      }
    } catch (err) {
      console.error("Failed to load preview", err);
      setPreviewContent(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewContent) URL.revokeObjectURL(previewContent);
    setSelectedFile(null);
    setPreviewContent(null);
    setPreviewType(null);
    setPreviewText(null);
  };

  const handleDownload = async (file) => {
    if (!file._docId) return;
    try {
      const res = await api.get(`/${file._docId}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      flash("Download failed", true);
    }
  };

  const handleDelete = async (file) => {
    if (!file._docId) return;
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    try {
      await api.delete(`/${file._docId}`);
      flash("Document deleted");
      loadDocuments();
    } catch (err) {
      flash("Delete failed", true);
    }
  };

  const handleRealUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = uploadType !== "folder";
    if (uploadType === "folder") {
      input.setAttribute("webkitdirectory", "true");
      input.setAttribute("directory", "true");
    }
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setUploading(true);
      setIsUploadModalOpen(false);
      try {
        await Promise.all(
          files.map((file) => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("workspace_id", String(workspaceId));
            fd.append("folder", uploadFolder);
            return api.post("/upload", fd);
          })
        );
        flash(`${files.length} file(s) uploaded successfully`);
        loadDocuments();
      } catch (err) {
        flash("Upload failed — please try again", true);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const renderGrid = (items, isModal = false) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ y: -4, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (item.type === "folder") {
              isModal ? handleSubFolderClick(item.name) : handleOpenFolder(item);
            } else {
              handlePreview(item);
            }
          }}
          className="group relative bg-zinc-800/70 hover:bg-zinc-800 border border-transparent hover:border-zinc-600 rounded-3xl p-5 cursor-pointer transition-all duration-300 flex flex-col"
        >
          <div className="h-24 flex items-center justify-center mb-4">
            {item.type === "folder" ? (
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400/10 to-transparent rounded-3xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Folder className="w-12 h-12 text-amber-300" />
              </div>
            ) : item.type === "zip" ? (
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Archive className="w-12 h-12 text-cyan-300" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-violet-400/10 to-transparent rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-12 h-12 text-violet-300" />
              </div>
            )}
          </div>
          <div className="font-medium text-base line-clamp-2 mb-2 group-hover:text-violet-200 transition-colors">
            {item.name}
          </div>
          <div className="mt-auto flex-col items-center justify-between text-xs text-zinc-400">
            <div className="mb-2 md:mb-0">{item.modified}</div>
            {item.size ? <div>{item.size}</div> : <div>{item.items} items</div>}
          </div>
          {item.type !== "folder" && (
            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(item);
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="bg-white/10 hover:bg-red-500/20 backdrop-blur-md p-3 rounded-2xl text-white"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {item.type === "zip" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnzip(item, isModal);
                  }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white"
                  title="Extract ZIP (mock)"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      {notice && (
        <div className={`fixed bottom-6 right-6 z-[99999] px-6 py-4 rounded-3xl text-white font-semibold shadow-2xl ${notice.isError ? "bg-red-600" : "bg-violet-600"}`}>
          {notice.msg}
        </div>
      )}
      {uploading && (
        <div className="fixed bottom-6 right-6 z-[99999] px-6 py-4 rounded-3xl text-white font-semibold shadow-2xl bg-zinc-800 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-white animate-spin" />
          Uploading...
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-zinc-400 mt-1 text-lg">Secure file management</p>
        </div>
      </div>

      {/* Stats Cards (unchanged) */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 mb-10">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium"><Folder className="w-5 h-5" /> TOTAL FILES</div>
              <div className="text-5xl font-semibold mt-3">{stats.totalFiles}</div>
              <div className="text-emerald-400 text-sm mt-1">{stats.totalFiles} total</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl flex items-center justify-center"><FileText className="w-9 h-9 text-violet-400" /></div>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium"><Folder className="w-5 h-5" /> FOLDERS</div>
              <div className="text-5xl font-semibold mt-3">{stats.folders}</div>
              <div className="text-amber-400 text-sm mt-1">{stats.folders} folders</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl flex items-center justify-center"><Folder className="w-9 h-9 text-amber-400" /></div>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">STORAGE</div>
              <div className="text-5xl font-semibold mt-3">—</div>
              <div className="text-zinc-400 text-sm mt-1">Not tracked yet</div>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-zinc-700 flex items-center justify-center text-zinc-600 text-lg font-semibold">?</div></div>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium"><div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" /> COLLABORATING</div>
              <div className="text-5xl font-semibold mt-3">{loading ? "—" : stats.totalFiles > 0 ? 1 : 0}</div>
              <div className="text-zinc-400 text-sm mt-1">{stats.totalFiles > 0 ? "currently editing" : "no active editors"}</div>
            </div>
            <div className="flex -space-x-4">
              {stats.totalFiles > 0 && <div className="w-9 h-9 bg-violet-500 rounded-2xl flex items-center justify-center text-xs font-bold ring-2 ring-zinc-900">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Documents Area */}
      <div className="bg-zinc-900/70 backdrop-blur-2xl border border-zinc-700 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 mb-8">
          <div className="relative w-full md:w-80 flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search documents..." className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-400 rounded-3xl pl-12 pr-6 py-4 text-sm outline-none transition-all" />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 rounded-3xl font-medium text-sm shadow-lg shadow-violet-500/30 transition-all whitespace-nowrap">
            <Upload className="w-5 h-5" />
            {activeRole === "founder" ? "Upload new file" : "Upload file"}
          </motion.button>
        </div>

        {loading ? (
          <div className="py-20 text-center"><div className="w-8 h-8 rounded-full border-2 border-zinc-800 mx-auto mb-4 border-t-violet-500 animate-spin" /><p className="text-zinc-500 text-sm">Loading documents...</p></div>
        ) : (
          <>
            {renderGrid(filteredRootFiles, false)}
            {filteredRootFiles.length === 0 && (
              <div className="py-20 text-center"><FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" /><p className="text-zinc-400">{rootFiles.length === 0 ? "No documents yet — upload your first file" : "No documents match your search"}</p></div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal (unchanged) */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-8" onClick={() => setIsUploadModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3"><Upload className="w-6 h-6 text-violet-400" /><h3 className="text-2xl font-semibold">Upload to Documents</h3></div>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="px-8 pt-6 flex gap-2">
                <button onClick={() => setUploadType("file")} className={`flex-1 py-4 text-sm font-medium rounded-3xl transition-all ${uploadType === "file" ? "bg-violet-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}>Single File</button>
                <button onClick={() => setUploadType("folder")} className={`flex-1 py-4 text-sm font-medium rounded-3xl transition-all ${uploadType === "folder" ? "bg-violet-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}>Entire Folder</button>
              </div>
              <div className="mx-8 mt-6 mb-8 border border-dashed border-zinc-600 rounded-3xl p-12 text-center">
                <Upload className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                <p className="text-lg font-medium">Click below to browse your computer</p>
                <div className="mt-6 mb-2 text-left px-4">
                  <label className="text-xs uppercase tracking-widest text-zinc-500 mb-1 block">Save to folder</label>
                  <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500">
                    {["general", "contracts", "pitch-decks", "financials", "legal", "hr"].map((f) => (
                      <option key={f} value={f}>{f.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRealUpload} className="mt-6 px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-3xl text-sm font-medium">Browse {uploadType === "folder" ? "Folder" : "Files"}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Modal (unchanged) */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-8" onClick={closeFolderModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col">
              <div className="px-8 py-6 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-4"><Folder className="w-8 h-8 text-amber-300" /><div><h3 className="text-2xl font-semibold">{modalPath[modalPath.length - 1]}</h3><p className="text-zinc-400 text-sm font-medium">{modalPath.length > 2 ? `Documents / … / ${modalPath[modalPath.length - 1]}` : modalPath.join(" / ")}</p></div></div>
                <div className="flex items-center gap-6">
                  {modalPath.length > 1 && <button onClick={handleModalBack} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>}
                  <button onClick={closeFolderModal} className="text-zinc-400 hover:text-white"><X className="w-7 h-7" /></button>
                </div>
              </div>
              <div className="flex-1 p-8 overflow-auto">{renderGrid(modalItems, true)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal (fixed) */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-8"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate">{selectedFile.name}</h3>
                <button onClick={closePreview} className="text-zinc-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-4 min-h-[400px] max-h-[70vh] overflow-auto bg-zinc-950">
                {previewLoading ? (
                  <div className="flex justify-center py-20">Loading preview...</div>
                ) : previewContent ? (
                  previewText !== null ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-300 bg-black/50 p-4 rounded-lg overflow-auto">{previewText}</pre>
                  ) : previewType?.startsWith("image/") ? (
                    <img src={previewContent} alt={selectedFile.name} className="max-w-full max-h-[60vh] mx-auto object-contain" />
                  ) : previewType === "application/pdf" ? (
                    <iframe src={previewContent} className="w-full h-[60vh]" title={selectedFile.name} />
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-zinc-500">Preview not available for this file type.</p>
                      <button onClick={() => handleDownload(selectedFile)} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">Download</button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 text-zinc-500">Could not load preview.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;