import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DocumentsPage = () => {
  const [activeRole, setActiveRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [modalPath, setModalPath] = useState([]);
  const [modalItems, setModalItems] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState("file");

  // hard coded data
  const [rootFiles, setRootFiles] = useState([
    {
      id: 1,
      type: "folder",
      name: "Pitch Decks",
      modified: "2h ago",
      items: 8,
      children: [
        {
          id: 101,
          type: "file",
          name: "Investor_Pitch_v1.pdf",
          modified: "3d ago",
          size: "3.1 MB",
        },
        {
          id: 102,
          type: "file",
          name: "Investor_Pitch_v2_final.pdf",
          modified: "1h ago",
          size: "2.8 MB",
        },
        {
          id: 103,
          type: "folder",
          name: "Feedback",
          modified: "1d ago",
          items: 4,
          children: [
            {
              id: 301,
              type: "file",
              name: "Sarah_Feedback.pdf",
              modified: "just now",
              size: "680 KB",
            },
            {
              id: 302,
              type: "file",
              name: "Mike_Notes.txt",
              modified: "2h ago",
              size: "12 KB",
            },
            {
              id: 303,
              type: "file",
              name: "Team_Comments.xlsx",
              modified: "5h ago",
              size: "945 KB",
            },
          ],
        },
        {
          id: 104,
          type: "zip",
          name: "Pitch_Backup.zip",
          modified: "1w ago",
          size: "9.4 MB",
        },
      ],
    },
    {
      id: 2,
      type: "folder",
      name: "Contracts",
      modified: "Yesterday",
      items: 12,
      children: [
        {
          id: 201,
          type: "file",
          name: "NDA_Sarah.pdf",
          modified: "2d ago",
          size: "450 KB",
        },
        {
          id: 202,
          type: "file",
          name: "Contract_Mike.docx",
          modified: "4d ago",
          size: "1.2 MB",
        },
        {
          id: 203,
          type: "zip",
          name: "Legal_Archive.zip",
          modified: "3w ago",
          size: "15 MB",
        },
      ],
    },
    {
      id: 3,
      type: "file",
      name: "Investor_Pitch_v2.pdf",
      modified: "4h ago",
      size: "2.4 MB",
    },
    {
      id: 4,
      type: "file",
      name: "Q2_Financials.xlsx",
      modified: "1d ago",
      size: "1.8 MB",
    },
    {
      id: 5,
      type: "file",
      name: "Team_Onboarding_Guide.docx",
      modified: "3d ago",
      size: "856 KB",
    },
    {
      id: 6,
      type: "file",
      name: "Brand_Guidelines_v3.png",
      modified: "5d ago",
      size: "4.2 MB",
    },
    {
      id: 7,
      type: "zip",
      name: "Project_Archive.zip",
      modified: "1w ago",
      size: "18.4 MB",
    },
  ]);

  //  fetches role from local storage
  useEffect(() => {
    const role = localStorage.getItem("activeRole");
    if (role) setActiveRole(role);
  }, []);

  const filteredRootFiles = rootFiles.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getFolderByPath = (path) => {
    if (path.length === 0) return null;
    let current = rootFiles.find(
      (f) => f.name === path[0] && f.type === "folder",
    );
    if (!current) return null;

    for (let i = 1; i < path.length; i++) {
      current = current.children?.find(
        (f) => f.name === path[i] && f.type === "folder",
      );
      if (!current) return null;
    }
    return current;
  };
  // folder logic
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

  // modal logic
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

  // Unzip Feature
  const handleUnzip = (zipItem, isInModal = false) => {
    const extractedFolderName = zipItem.name.replace(".zip", "");

    const newExtractedFolder = {
      id: Date.now(),
      type: "folder",
      name: extractedFolderName,
      modified: "just now",
      items: 5,
      children: [
        {
          id: Date.now() + 1,
          type: "file",
          name: "README.txt",
          modified: "just now",
          size: "2 KB",
        },
        {
          id: Date.now() + 2,
          type: "file",
          name: "Extracted_Document.pdf",
          modified: "just now",
          size: "1.4 MB",
        },
        {
          id: Date.now() + 3,
          type: "file",
          name: "Summary.xlsx",
          modified: "just now",
          size: "245 KB",
        },
      ],
    };

    if (!isInModal) {
      // Unzip in root view
      setRootFiles((prev) => {
        const withoutZip = prev.filter((f) => f.id !== zipItem.id);
        return [newExtractedFolder, ...withoutZip];
      });
    } else {
      // Unzip inside modal
      setModalItems((prev) => {
        const withoutZip = prev.filter((f) => f.id !== zipItem.id);
        return [newExtractedFolder, ...withoutZip];
      });
    }
  };
  // handle preview
  const handlePreview = (file) => {
    if (file.type === "folder") return;
    setSelectedFile(file);
  };

  const closePreview = () => setSelectedFile(null);
  // This is for the download
  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.download = file.name;
    link.href = "#";
    link.click();
  };

  // Upload
  const handleRealUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    if (uploadType === "folder") {
      input.setAttribute("webkitdirectory", "true");
      input.setAttribute("directory", "true");
    }

    input.onchange = (e) => {
      if (e.target.files?.length > 0) {
        // You can handle files here later (upload logic)
        console.log(
          `Selected ${e.target.files.length} ${
            uploadType === "folder" ? "files from folder" : "files"
          }`,
        );

        setIsUploadModalOpen(false);
      }
    };

    input.click();
  };

  // Grid Rendering
  const renderGrid = (items, isModal = false) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {items.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ y: -4, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (item.type === "folder") {
              isModal
                ? handleSubFolderClick(item.name)
                : handleOpenFolder(item);
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
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white"
              >
                <Download className="w-4 h-4" />
              </button>
              {item.type === "zip" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnzip(item, isModal);
                  }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white"
                  title="Extract ZIP"
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
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-zinc-400 mt-1 text-lg">Secure file management</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6 mb-10">
        {/* Total Files Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Folder className="w-5 h-5" />
                TOTAL FILES
              </div>
              <div className="text-5xl font-semibold mt-3">248</div>
              <div className="text-emerald-400 text-sm mt-1">
                ↑ 14 this week
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl flex items-center justify-center">
              <FileText className="w-9 h-9 text-violet-400" />
            </div>
          </div>
        </motion.div>

        {/* Folders Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Folder className="w-5 h-5" />
                FOLDERS
              </div>
              <div className="text-5xl font-semibold mt-3">19</div>
              <div className="text-amber-400 text-sm mt-1">4 shared</div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl flex items-center justify-center">
              <Folder className="w-9 h-9 text-amber-400" />
            </div>
          </div>
        </motion.div>

        {/* Storage Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                STORAGE
              </div>
              <div className="text-5xl font-semibold mt-3">64%</div>
              <div className="text-zinc-400 text-sm mt-1">
                47.3 GB of 75 GB used
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg
                width="80"
                height="80"
                viewBox="0 0 42 42"
                className="transform -rotate-90"
              >
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="transparent"
                  stroke="#27272a"
                  strokeWidth="7"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15"
                  fill="transparent"
                  stroke="#a78bfa"
                  strokeWidth="7"
                  strokeDasharray="94.2 94.2"
                  strokeDashoffset="33.9"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-white">
                64
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collaborating Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-3xl p-6 shadow-inner relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                COLLABORATING
              </div>
              <div className="text-5xl font-semibold mt-3">7</div>
              <div className="text-zinc-400 text-sm mt-1">
                currently editing
              </div>
            </div>
            <div className="flex -space-x-4">
              <div className="w-9 h-9 bg-violet-400 rounded-2xl flex items-center justify-center text-xs font-bold ring-2 ring-zinc-900">
                JD
              </div>
              <div className="w-9 h-9 bg-emerald-400 rounded-2xl flex items-center justify-center text-xs font-bold ring-2 ring-zinc-900">
                SM
              </div>
              <div className="w-9 h-9 bg-amber-400 rounded-2xl flex items-center justify-center text-xs font-bold ring-2 ring-zinc-900">
                PR
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Documents Area */}
      <div className="bg-zinc-900/70 backdrop-blur-2xl border border-zinc-700 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-80 flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-400 rounded-3xl pl-12 pr-6 py-4 text-sm outline-none transition-all"
            />
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 rounded-3xl font-medium text-sm shadow-lg shadow-violet-500/30 transition-all whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            {activeRole === "founder" ? "Upload new file" : "Upload file"}
          </motion.button>
        </div>

        {renderGrid(filteredRootFiles, false)}

        {filteredRootFiles.length === 0 && (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400">No documents match your search</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-8"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-violet-400" />
                  <h3 className="text-2xl font-semibold">
                    Upload to Documents
                  </h3>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-8 pt-6 flex gap-2">
                <button
                  onClick={() => setUploadType("file")}
                  className={`flex-1 py-4 text-sm font-medium rounded-3xl transition-all ${uploadType === "file" ? "bg-violet-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
                >
                  Single File
                </button>
                <button
                  onClick={() => setUploadType("folder")}
                  className={`flex-1 py-4 text-sm font-medium rounded-3xl transition-all ${uploadType === "folder" ? "bg-violet-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}
                >
                  Entire Folder
                </button>
              </div>

              <div className="mx-8 mt-6 mb-8 border border-dashed border-zinc-600 rounded-3xl p-12 text-center">
                <Upload className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                <p className="text-lg font-medium">
                  Click below to browse your computer
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRealUpload}
                  className="mt-8 px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-3xl text-sm font-medium"
                >
                  Browse {uploadType === "folder" ? "Folder" : "Files"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Modal */}
      <AnimatePresence>
        {isFolderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-8"
            onClick={closeFolderModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl max-h-[88vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Folder className="w-8 h-8 text-amber-300" />
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {modalPath[modalPath.length - 1]}
                    </h3>
                    <p className="text-zinc-400 text-sm font-medium">
                      {modalPath.length > 2
                        ? `Documents / … / ${modalPath[modalPath.length - 1]}`
                        : modalPath.join(" / ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {modalPath.length > 1 && (
                    <button
                      onClick={handleModalBack}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <button
                    onClick={closeFolderModal}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-auto">
                {renderGrid(modalItems, true)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Modal */}
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
              className="bg-zinc-900 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 md:px-8 py-5 md:py-6 border-b border-zinc-700 flex items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText className="w-8 h-8 text-violet-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-base md:text-lg leading-tight">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {selectedFile.size} • {selectedFile.modified}
                    </div>
                  </div>
                </div>

                <button
                  onClick={closePreview}
                  className="text-zinc-400 hover:text-white flex-shrink-0 p-2 -mr-2 md:-mr-1 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 md:p-12 min-h-[420px] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900">
                <div className="w-40 h-56 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center mb-8 shadow-inner">
                  <FileText className="w-16 h-16 text-violet-200 mb-6" />
                  <div className="text-xs uppercase tracking-[1px] text-zinc-400 font-medium">
                    PREVIEW
                  </div>
                </div>

                <p className="text-zinc-400 text-center max-w-xs">
                  Document Preview
                </p>

                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="flex items-center gap-2 text-sm font-medium px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-black rounded-3xl mt-8 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
