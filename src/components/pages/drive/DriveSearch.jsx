// src/components/pages/drive/DriveSearch.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, SortAsc, Sliders, X,
  FileText, Folder, Users, Calendar, Tag,
  Award, Clock, Sparkles, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader, GlassCard, Button, Badge, Spinner, EmptyState } from '@/components/erp/ui';

const FILTER_GROUPS = [
  {
    label: 'Workspace',
    options: ['All Workspaces', 'AlphaPay', 'SF Core', 'Personal'],
  },
  {
    label: 'Startup',
    options: ['All Startups', 'AlphaPay', 'BetaLaunch', 'GammaCorp'],
  },
  {
    label: 'Knowledge Type',
    options: ['All Types', 'Architecture', 'Milestone Proof', 'Meeting Transcript', 'Research', 'Product Spec'],
  },
  {
    label: 'Document Type',
    options: ['All Docs', 'PDF', 'DOCX', 'MD', 'PPTX', 'XLSX'],
  },
  {
    label: 'State',
    options: ['All States', 'Active', 'Canonical', 'Deprecated', 'Archived'],
  },
  {
    label: 'Tags',
    options: ['All Tags', 'product', 'roadmap', 'research', 'design', 'legal'],
  },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'recent', label: 'Most Recent' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'File Size' },
];

export default function DriveSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const data = [
          { id: 1, name: 'Product Roadmap 2026.pdf', type: 'PDF', workspace: 'AlphaPay', startup: 'AlphaPay', score: 0.96, updated: '2026-01-15', canonical: true },
          { id: 2, name: 'Architecture Decisions.md', type: 'MD', workspace: 'AlphaPay', startup: 'AlphaPay', score: 0.89, updated: '2026-01-14', canonical: true },
          { id: 3, name: 'Meeting Notes - Q1 Planning.docx', type: 'DOCX', workspace: 'SF Core', startup: 'AlphaPay', score: 0.82, updated: '2026-01-13', canonical: false },
          { id: 4, name: 'User Research Summary.pdf', type: 'PDF', workspace: 'AlphaPay', startup: 'BetaLaunch', score: 0.78, updated: '2026-01-12', canonical: false },
        ];
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={`Results for "${query}"`}
          subtitle={`${results.length} files found`}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1a1a1a] border border-zinc-800 rounded-lg p-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSort(opt.id)}
                    className={cn(
                      'px-3 py-1.5 rounded text-xs transition-all',
                      sort === opt.id
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-zinc-500 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter size={16} className="mr-1" /> Filters
              </Button>
            </div>
          }
        />

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {FILTER_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{group.label}</p>
                      <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                        {group.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/50">
                  <Button variant="primary" size="sm">Apply Filters</Button>
                  <Button variant="ghost" size="sm">Reset</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <SearchSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12 text-zinc-600" />}
            title="No results found"
            description={`No files match "${query}". Try different keywords.`}
          />
        ) : (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <SearchResultRow key={result.id} result={result} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultRow({ result, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-600 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{result.name}</p>
            {result.canonical && (
              <Badge color="yellow" className="flex items-center gap-1">
                <Award size={10} /> Canonical
              </Badge>
            )}
            <Badge color="gray">{result.type}</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {result.workspace}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {result.startup}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Updated {new Date(result.updated).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Sparkles size={12} />
              {Math.round(result.score * 100)}% match
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}