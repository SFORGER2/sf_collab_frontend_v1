/**
 * MarketplacePage — SF Collab
 * Dark theme · Bigger cards · FAB · Grid/List toggle · Mobile-first
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Code2, Palette, LayoutDashboard, TrendingUp,
  Star, Download, Eye, Plus, Upload, X, Package,
  CheckCircle, AlertCircle, Loader2, ArrowLeft,
  DollarSign, FileUp, Image, Sparkles, ShieldCheck,
  LayoutGrid, List, SlidersHorizontal, ChevronDown,
  Zap, Crown, Tag, Filter, CreditCard, Gem, ExternalLink,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { categoryAPI, listingAPI, sellerAPI, myListingsAPI, purchaseAPI, earningsAPI, boostAPI } from '@/utils/APIs/MarketplaceAPI';
import { API_BASE_URL } from '@/utils/config';

// ─── URL helper ───────────────────────────────────────────────────
const BACKEND_URL = API_BASE_URL.replace('/api', '');
const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

// ─── Constants ───────────────────────────────────────────────────
const CATEGORY_ICONS = {
  development: Code2,
  design:      Palette,
  product:     LayoutDashboard,
  growth:      TrendingUp,
};

const CATEGORY_COLORS = {
  development: { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   dot: 'bg-blue-400' },
  design:      { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  product:     { bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',dot: 'bg-emerald-400' },
  growth:      { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
};

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'popular',   label: 'Popular' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc',label: 'Price ↓' },
];

const STATUS_COLORS = {
  draft:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  archived:  'bg-gray-500/10 text-gray-400 border-gray-500/30',
  rejected:  'bg-red-500/10 text-red-400 border-red-500/30',
};

// ─── Listing Card — Grid View ─────────────────────────────────────
const GridCard = ({ listing, onClick }) => {
  const Icon  = CATEGORY_ICONS[listing.category?.slug] || Package;
  const color = CATEGORY_COLORS[listing.category?.slug] || CATEGORY_COLORS.development;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      onClick={() => onClick(listing)}
      className="group relative bg-[#111318] border border-white/[0.06] rounded-2xl overflow-hidden
                 cursor-pointer hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/40
                 transition-all duration-200 flex flex-col"
    >
      {/* Preview area */}
      <div className="relative h-48 bg-[#0d0f14] overflow-hidden flex-shrink-0">
        {listing.preview_images?.[0] ? (
          <img
            src={getFileUrl(listing.preview_images[0])}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-16 h-16 rounded-2xl ${color.bg} flex items-center justify-center`}>
              <Icon size={28} className={color.text} />
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111318]/80 via-transparent to-transparent" />

        {/* Boost badge */}
        {listing.is_boosted && (
          <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm text-white
                          text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={9} /> Boosted
          </div>
        )}

        {/* Price pill — overlaps bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/70 backdrop-blur-sm text-white font-bold text-sm
                           px-3 py-1 rounded-full border border-white/10">
            ${listing.price?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category tag */}
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                         ${color.bg} ${color.text} border ${color.border}
                         px-2.5 py-0.5 rounded-full self-start mb-2.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
          {listing.category?.name}
          {listing.item_type && <span className="opacity-60">· {listing.item_type}</span>}
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2 flex-1">
          {listing.title}
        </h3>

        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.05]">
          {/* Seller */}
          <div className="flex items-center gap-2">
            {listing.seller?.user?.profile_picture ? (
              <img src={getFileUrl(listing.seller.user.profile_picture)}
                   className="w-6 h-6 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                              flex items-center justify-center text-white text-[10px] font-bold">
                {listing.seller?.user?.name?.[0] || 'S'}
              </div>
            )}
            <span className="text-gray-400 text-xs truncate max-w-[80px]">
              {listing.seller?.user?.name?.split(' ')[0] || 'Seller'}
            </span>
            {listing.seller?.is_verified && (
              <ShieldCheck size={11} className="text-blue-400 flex-shrink-0" />
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2.5 text-gray-600 text-[11px]">
            {listing.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Star size={11} fill="currentColor" />
                {listing.rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Download size={11} />
              {listing.downloads_count}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

// ─── Listing Card — List View ─────────────────────────────────────
const ListCard = ({ listing, onClick }) => {
  const Icon  = CATEGORY_ICONS[listing.category?.slug] || Package;
  const color = CATEGORY_COLORS[listing.category?.slug] || CATEGORY_COLORS.development;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ x: 2 }}
      onClick={() => onClick(listing)}
      className="group flex gap-4 bg-[#111318] border border-white/[0.06] rounded-xl p-4
                 cursor-pointer hover:border-white/[0.14] hover:bg-[#13161c]
                 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0d0f14] overflow-hidden flex-shrink-0">
        {listing.preview_images?.[0] ? (
          <img src={getFileUrl(listing.preview_images[0])} alt={listing.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${color.bg}`}>
            <Icon size={24} className={color.text} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1 text-[10px] font-medium
                             ${color.text} mb-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
              {listing.category?.name}
            </div>
            <h3 className="text-white font-semibold text-sm leading-snug truncate">
              {listing.title}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{listing.description}</p>
          </div>
          <span className="text-white font-bold text-base flex-shrink-0">
            ${listing.price?.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                            flex items-center justify-center text-white text-[8px] font-bold">
              {listing.seller?.user?.name?.[0] || 'S'}
            </div>
            <span className="text-gray-500 text-xs">{listing.seller?.user?.name?.split(' ')[0]}</span>
            {listing.seller?.is_verified && <ShieldCheck size={10} className="text-blue-400" />}
          </div>
          {listing.rating > 0 && (
            <span className="flex items-center gap-1 text-yellow-400 text-xs">
              <Star size={10} fill="currentColor" /> {listing.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1 text-gray-600 text-xs">
            <Download size={10} /> {listing.downloads_count}
          </span>
          {listing.is_boosted && (
            <span className="flex items-center gap-1 text-purple-400 text-[10px]">
              <Sparkles size={10} /> Boosted
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

// ─── Listing Detail Modal ─────────────────────────────────────────
const ListingDetailModal = ({ listing, onClose, myPurchases = [] }) => {
  if (!listing) return null;
  const Icon  = CATEGORY_ICONS[listing.category?.slug] || Package;
  const color = CATEGORY_COLORS[listing.category?.slug] || CATEGORY_COLORS.development;
  const { user, access_token } = useSelector(s => s.auth);
  const [activePreview, setActivePreview]         = useState(0);
  const [purchasing, setPurchasing]               = useState(false);
  const [stripeRedirecting, setStripeRedirecting] = useState(false);
  const [boosting, setBoosting]           = useState(false);
  const [boostUnits, setBoostUnits]       = useState(1);
  const [showBoost, setShowBoost]         = useState(false);
  const [rating, setRating]              = useState(0);
  const [reviewText, setReviewText]       = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [tab, setTab]                     = useState('details'); // details | boost | rate

  // Check if current user already purchased this listing
  const myPurchase = myPurchases.find(p => String(p.listing_id) === String(listing.id));
  const alreadyPurchased = !!myPurchase;
  const alreadyRated     = myPurchase?.rating != null;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await purchaseAPI.purchase(listing.id);
      if (res.success) {
        toast.success(res.message || 'Purchase successful!');
        if (res.download_url) {
          window.open(`${BACKEND_URL}${res.download_url}`, '_blank');
        }
        onClose();
      } else {
        toast.error(res.error || 'Purchase failed');
      }
    } catch { toast.error('Purchase failed'); }
    finally { setPurchasing(false); }
  };

  const handleStripeCheckout = async () => {
    setStripeRedirecting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/payments/create-checkout-session`,
        {
          id: `marketplace-${listing.id}`,
          title: listing.title,
          description: listing.description || 'Marketplace purchase',
          price: Math.round((listing.price || 0) * 100), // dollars → cents
          currency: 'usd',
          user_id: user?.id,
          type: 'marketplace',
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not start checkout');
      }
    } catch {
      toast.error('Stripe checkout failed. Please try again.');
    } finally {
      setStripeRedirecting(false);
    }
  };

  const handleDownload = async () => {
    const res = await purchaseAPI.getDownloadUrl(listing.id);
    if (res.success && res.download_url) {
      window.open(`${BACKEND_URL}${res.download_url}`, '_blank');
    } else {
      toast.error('Download not available');
    }
  };

  const handleBoost = async () => {
    setBoosting(true);
    try {
      const res = await boostAPI.boostListing(listing.id, boostUnits);
      if (res.success) {
        toast.success(res.message || 'Listing boosted!');
        setShowBoost(false);
      } else {
        toast.error(res.error || 'Boost failed');
      }
    } catch { toast.error('Boost failed'); }
    finally { setBoosting(false); }
  };

  const handleRate = async () => {
    if (!rating) { toast.error('Select a star rating first'); return; }
    if (!myPurchase) { toast.error('You must purchase this listing first'); return; }
    setRatingLoading(true);
    try {
      const res = await purchaseAPI.rate(myPurchase.id, rating, reviewText);
      if (res.success) {
        toast.success('Rating submitted!');
        setTab('details');
      } else {
        toast.error(res.error || 'Rating failed');
      }
    } catch { toast.error('Rating failed'); }
    finally { setRatingLoading(false); }
  };

  const boostCost = 100 * boostUnits;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
                   justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                     w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color.text} />
              </div>
              <div>
                <div className={`text-xs font-medium ${color.text} mb-0.5`}>
                  {listing.category?.name}{listing.item_type && ` · ${listing.item_type}`}
                </div>
                <h2 className="text-white font-bold text-base leading-tight">{listing.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 -mt-1 -mr-1">
              <X size={20} />
            </button>
          </div>

          {/* Tabs — only show boost/rate if relevant */}
          <div className="flex items-center gap-1 px-5 mb-1">
            {[
              { key: 'details', label: 'Details' },
              ...(alreadyPurchased && !alreadyRated ? [{ key: 'rate', label: '⭐ Rate' }] : []),
              ...(listing.seller ? [{ key: 'boost', label: '💎 Boost' }] : []),
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${tab === t.key ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <>
              {/* Preview images */}
              {listing.preview_images?.length > 0 && (
                <div className="px-5 mb-4">
                  <div className="rounded-xl overflow-hidden bg-[#0d0f14] aspect-video">
                    <img src={getFileUrl(listing.preview_images[activePreview])} alt="Preview"
                         className="w-full h-full object-cover" />
                  </div>
                  {listing.preview_images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {listing.preview_images.map((url, i) => (
                        <button key={i} onClick={() => setActivePreview(i)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors
                            ${i === activePreview ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                          <img src={getFileUrl(url)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="px-5 pb-6 space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed">{listing.description}</p>

                {listing.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {listing.tags.map((t, i) => (
                      <span key={i} className="text-[11px] bg-white/[0.04] text-gray-400
                                               border border-white/[0.06] px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Seller card */}
                <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.05]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {listing.seller?.user?.name?.[0] || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-medium text-sm">{listing.seller?.user?.name}</span>
                      {listing.seller?.is_verified && <ShieldCheck size={13} className="text-blue-400" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{listing.seller?.delivery_history_count} deliveries</span>
                      <span>·</span>
                      <span>Trust {listing.seller?.trust_score}/100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye size={12} /> {listing.views_count}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price</span>
                    <span className="text-white font-bold text-lg">${listing.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Platform fee (10%)</span>
                    <span>${listing.platform_fee?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/[0.05] pt-2 flex justify-between text-sm">
                    <span className="text-gray-500">Seller receives</span>
                    <span className="text-emerald-400 font-medium">${listing.seller_receives?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Download size={14} /> {listing.downloads_count}</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} /> {listing.views_count}</span>
                  {listing.rating > 0 && (
                    <span className="flex items-center gap-1.5 text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      {listing.rating.toFixed(1)} ({listing.rating_count})
                    </span>
                  )}
                </div>

                {/* CTA */}
                {alreadyPurchased ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20
                                    rounded-xl px-4 py-3">
                      <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-300 text-sm font-medium">You own this resource</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleDownload}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.10] text-white font-semibold
                                 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Download size={16} /> Download File
                    </motion.button>
                    {!alreadyRated && (
                      <button onClick={() => setTab('rate')}
                        className="w-full text-yellow-400 text-sm py-2 hover:text-yellow-300 transition-colors flex items-center justify-center gap-1.5">
                        <Star size={14} /> Leave a rating
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1.5">
                      <CreditCard size={12} /> Choose how to pay
                    </p>

                    {/* Option 1: Balance wallet */}
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handlePurchase}
                      disabled={purchasing || stripeRedirecting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500
                                 hover:to-blue-400 disabled:opacity-50 text-white font-semibold py-3.5
                                 rounded-xl transition-all shadow-lg shadow-blue-600/20
                                 flex items-center justify-center gap-2">
                      {purchasing
                        ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                        : <><CreditCard size={16} /> Pay with Balance — ${listing.price?.toFixed(2)}</>
                      }
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-2 py-0.5">
                      <div className="flex-1 h-px bg-white/[0.05]" />
                      <span className="text-gray-600 text-[10px] uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-white/[0.05]" />
                    </div>

                    {/* Option 2: Stripe card checkout */}
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleStripeCheckout}
                      disabled={purchasing || stripeRedirecting}
                      className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10]
                                 disabled:opacity-50 text-white font-semibold py-3
                                 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                      {stripeRedirecting
                        ? <><Loader2 size={15} className="animate-spin" /> Redirecting to Stripe...</>
                        : <><ExternalLink size={14} /> Pay with Card (Stripe) — ${listing.price?.toFixed(2)}</>
                      }
                    </motion.button>

                    <p className="text-[10px] text-gray-600 text-center">
                      Card payments are processed securely by Stripe
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── RATE TAB ── */}
          {tab === 'rate' && (
            <div className="px-5 pb-6 space-y-4 pt-2">
              {alreadyRated ? (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">Already rated</p>
                  <p className="text-gray-500 text-sm mt-1">You gave this {myPurchase.rating} stars</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">How was your experience with <span className="text-white">{listing.title}</span>?</p>

                  {/* Star picker */}
                  <div className="flex items-center justify-center gap-3 py-4">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setRating(n)}>
                        <Star size={36}
                          className={`transition-colors ${n <= rating ? 'text-yellow-400' : 'text-gray-700'}`}
                          fill={n <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-gray-400 text-sm">
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                    </p>
                  )}

                  <textarea rows={3} value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your thoughts (optional)..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                               text-white text-sm placeholder-gray-600 focus:outline-none
                               focus:border-blue-500/50 resize-none" />

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleRate}
                    disabled={ratingLoading || !rating}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black
                               font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {ratingLoading ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
                    Submit Rating
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* ── BOOST TAB ── */}
          {tab === 'boost' && (
            <div className="px-5 pb-6 space-y-4 pt-2">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gem size={16} className="text-purple-400" />
                  <p className="text-purple-300 font-semibold text-sm">Visibility Boost</p>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Boost your listing to the top of discovery results using Crystals.
                  Crystals only accelerate visibility — they cannot reduce prices or affect reputation.
                </p>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cost per 24h</span>
                  <span className="text-purple-400 font-semibold">100 crystals</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Duration</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button onClick={() => setBoostUnits(u => Math.max(1, u - 1))}
                      className="w-8 h-8 bg-white/[0.06] rounded-lg text-white hover:bg-white/[0.10] transition-colors">
                      −
                    </button>
                    <span className="text-white font-semibold w-8 text-center">{boostUnits}</span>
                    <button onClick={() => setBoostUnits(u => Math.min(7, u + 1))}
                      className="w-8 h-8 bg-white/[0.06] rounded-lg text-white hover:bg-white/[0.10] transition-colors">
                      +
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">{boostUnits * 24}h</span>
                </div>
                <div className="border-t border-white/[0.05] pt-3 flex justify-between text-sm">
                  <span className="text-gray-400">Total cost</span>
                  <span className="text-white font-bold">{boostCost} crystals</span>
                </div>
              </div>

              {listing.is_boosted && (
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20
                                rounded-xl px-4 py-3 text-sm text-purple-300">
                  <Sparkles size={14} />
                  Listing is currently boosted until {listing.boost_expires_at
                    ? new Date(listing.boost_expires_at).toLocaleDateString()
                    : '—'}
                </div>
              )}

              <motion.button whileTap={{ scale: 0.98 }} onClick={handleBoost} disabled={boosting}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500
                           hover:to-purple-400 disabled:opacity-50 text-white font-semibold py-3.5
                           rounded-xl transition-all shadow-lg shadow-purple-600/20
                           flex items-center justify-center gap-2">
                {boosting
                  ? <><Loader2 size={16} className="animate-spin" /> Boosting...</>
                  : <><Sparkles size={16} /> Boost for {boostCost} crystals</>
                }
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Create Listing Modal ─────────────────────────────────────────
const CreateListingModal = ({ categories, onClose, onCreated }) => {
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [listing, setListing]   = useState(null);
  const [progress, setProgress] = useState(0);
  const [form, setForm]         = useState({
    title: '', description: '', price: '', category_id: '', item_type: '', tags: '',
  });
  const [productFile, setProductFile]   = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [errors, setErrors]             = useState({});

  const selectedCat = categories.find(c => String(c.id) === String(form.category_id));

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title       = 'Required';
    if (!form.description.trim())  e.description = 'Required';
    if (!form.price)               e.price       = 'Required';
    if (parseFloat(form.price) <= 0) e.price     = 'Must be > 0';
    if (!form.category_id)         e.category_id = 'Select a category';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreateDraft = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await sellerAPI.register({});
      const res = await myListingsAPI.create({
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        category_id: parseInt(form.category_id),
        item_type:   form.item_type,
        tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      if (!res.success) { toast.error(res.error); return; }
      setListing(res.listing);
      setStep(2);
    } catch { toast.error('Failed to create listing'); }
    finally { setLoading(false); }
  };

  const handleUploadFiles = async () => {
    if (!listing) return;
    setLoading(true);
    try {
      if (productFile) {
        const res = await myListingsAPI.uploadFile(listing.id, productFile, setProgress);
        if (!res.success) { toast.error(res.error); return; }
        setListing(res.listing);
      }
      if (previewFiles.length > 0) {
        const res = await myListingsAPI.uploadPreviews(listing.id, previewFiles);
        if (!res.success) { toast.error(res.error); return; }
        setListing(res.listing);
      }
      setStep(3);
    } catch { toast.error('Upload failed'); }
    finally { setLoading(false); setProgress(0); }
  };

  const handlePublish = async () => {
    if (!listing) return;
    setLoading(true);
    try {
      const res = await myListingsAPI.publish(listing.id);
      if (!res.success) { toast.error(res.error); return; }
      toast.success('Listing published!');
      onCreated(res.listing);
      onClose();
    } catch { toast.error('Failed to publish'); }
    finally { setLoading(false); }
  };

  const STEPS = ['Details', 'Files', 'Publish'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
                 justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                   w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div>
            <h2 className="text-white font-bold">List a Resource</h2>
            <div className="flex items-center gap-2 mt-2">
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center gap-1.5 text-xs
                    ${step > i+1 ? 'text-emerald-400' : step === i+1 ? 'text-blue-400' : 'text-gray-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${step > i+1 ? 'bg-emerald-500/20' : step === i+1 ? 'bg-blue-500/20' : 'bg-white/[0.04]'}`}>
                      {step > i+1 ? '✓' : i+1}
                    </div>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-white/[0.06]" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              {[
                { key: 'title', label: 'Title', placeholder: 'e.g. React SaaS Boilerplate with Auth' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label} *</label>
                  <input value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                               text-white text-sm focus:outline-none focus:border-blue-500/60
                               placeholder-gray-600 transition-colors" />
                  {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this resource do? How does it help builders?"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                             text-white text-sm focus:outline-none focus:border-blue-500/60
                             placeholder-gray-600 resize-none transition-colors" />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Category *</label>
                  <select value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value, item_type: '' }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                               text-white text-sm focus:outline-none focus:border-blue-500/60 appearance-none">
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select value={form.item_type}
                    onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}
                    disabled={!selectedCat}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5
                               text-white text-sm focus:outline-none focus:border-blue-500/60
                               appearance-none disabled:opacity-40">
                    <option value="">Any</option>
                    {selectedCat?.allowed_types?.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Price (USD) *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" min="0.01" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="20.00"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5
                               text-white text-sm focus:outline-none focus:border-blue-500/60 transition-colors" />
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                {parseFloat(form.price) > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    You receive ${(parseFloat(form.price) * 0.9).toFixed(2)} after 10% fee
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tags <span className="text-gray-600">(comma separated)</span></label>
                <input value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="react, typescript, auth"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5
                             text-white text-sm focus:outline-none focus:border-blue-500/60
                             placeholder-gray-600 transition-colors" />
              </div>

              <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreateDraft} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                           font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                Continue
              </motion.button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed
                rounded-2xl p-8 cursor-pointer transition-all duration-200
                ${productFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/[0.08] hover:border-blue-500/40 bg-white/[0.02]'}`}>
                {productFile ? (
                  <>
                    <CheckCircle size={28} className="text-emerald-400" />
                    <span className="text-white text-sm font-medium">{productFile.name}</span>
                    <span className="text-gray-500 text-xs">{(productFile.size / (1024*1024)).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                      <FileUp size={22} className="text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">Drop your product file</p>
                      <p className="text-gray-500 text-xs mt-0.5">ZIP, PDF, Figma, code · max 50MB</p>
                    </div>
                  </>
                )}
                <input type="file" className="hidden"
                  onChange={e => setProductFile(e.target.files?.[0] || null)} />
              </label>

              <label className="flex items-center gap-3 border border-dashed border-white/[0.08]
                                hover:border-white/[0.16] bg-white/[0.02] rounded-xl p-4 cursor-pointer transition-colors">
                <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Preview screenshots</p>
                  <p className="text-gray-600 text-xs">PNG/JPG · max 5MB · up to 5</p>
                </div>
                {previewFiles.length > 0 && (
                  <span className="ml-auto bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">
                    {previewFiles.length} selected
                  </span>
                )}
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={e => setPreviewFiles(Array.from(e.target.files || []))} />
              </label>

              {progress > 0 && progress < 100 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Uploading</span><span>{progress}%</span>
                  </div>
                  <div className="bg-white/[0.06] rounded-full h-1.5">
                    <motion.div className="bg-blue-500 h-1.5 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 py-3
                             rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft size={14} /> Back
                </button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleUploadFiles}
                  disabled={loading || !productFile}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white
                             font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  Upload
                </motion.button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && listing && (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <p className="text-white font-bold text-lg">Ready to publish</p>
                <p className="text-gray-500 text-sm mt-1">Your files are uploaded</p>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] space-y-2.5">
                {[
                  ['Title',    listing.title],
                  ['Category', listing.category?.name],
                  ['Price',    `$${listing.price?.toFixed(2)}`],
                  ['You get',  `$${listing.seller_receives?.toFixed(2)} (after 10% fee)`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/[0.07] border border-blue-500/[0.15] rounded-xl p-3.5
                              flex items-start gap-2.5 text-xs text-blue-300/80">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                Buyers pay using their Balance wallet. Crystals cannot be used for purchases.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 py-3
                             rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  <ArrowLeft size={14} /> Back
                </button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handlePublish} disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white
                             font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Publish
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── My Listings Sheet ────────────────────────────────────────────
const MyListingsSheet = ({ listings, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center
               justify-center p-0 sm:p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 28 }}
      onClick={e => e.stopPropagation()}
      className="bg-[#0f1116] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl
                 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
    >
      <div className="flex justify-center pt-3 sm:hidden">
        <div className="w-10 h-1 bg-white/20 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h2 className="text-white font-bold">My Listings</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="px-4 pb-5 space-y-2.5">
        {listings.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <Package size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No listings yet</p>
          </div>
        ) : listings.map(l => (
          <div key={l.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05]
                                     rounded-xl p-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0d0f14] overflow-hidden flex-shrink-0">
              {l.preview_images?.[0] ? (
                <img src={getFileUrl(l.preview_images[0])} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={16} className="text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{l.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{l.category?.name} · ${l.price?.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[l.status]}`}>
                {l.status}
              </span>
              <span className="text-gray-600 text-xs flex items-center gap-1">
                <Download size={10} /> {l.downloads_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────
const MarketplacePage = () => {
  const [categories, setCategories]   = useState([]);
  const [listings, setListings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [viewMode, setViewMode]       = useState('grid');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListings, setMyListings]   = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '', category_slug: '', item_type: '', sort: 'newest',
    min_price: '', max_price: '',
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const searchRef = useRef(null);

  useEffect(() => {
    categoryAPI.getAll().then(res => {
      if (res.success) setCategories(res.categories);
    });
    // Load user's purchases so modal can show owned state
    purchaseAPI.getMyPurchases().then(res => {
      if (res.success) setMyPurchases(res.purchases);
    });
  }, []);

  const loadListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (filters.search)        params.search        = filters.search;
      if (filters.category_slug) params.category_slug = filters.category_slug;
      if (filters.item_type)     params.item_type     = filters.item_type;
      if (filters.sort)          params.sort          = filters.sort;
      if (filters.min_price)     params.min_price     = parseFloat(filters.min_price);
      if (filters.max_price)     params.max_price     = parseFloat(filters.max_price);
      const res = await listingAPI.getListings(params);
      if (res.success) { setListings(res.listings); setPagination(res.pagination); }
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadListings(1); }, [loadListings]);

  const loadMyListings = async () => {
    const res = await myListingsAPI.getAll();
    if (res.success) setMyListings(res.listings);
    setShowMyListings(true);
  };

  const selectedCat = categories.find(c => c.slug === filters.category_slug);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0a0c10]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">

          {/* Top row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-none">
                SF Marketplace
              </h1>
              <p className="text-gray-500 text-xs mt-0.5 hidden sm:block">
                Resources to build and launch faster
              </p>
            </div>

            {/* My Listings — desktop only */}
            <button onClick={loadMyListings}
              className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white
                         border border-white/[0.08] hover:border-white/[0.16]
                         px-3 py-2 rounded-xl text-xs transition-colors">
              <List size={13} /> My Listings
            </button>

            {/* List Resource — always visible */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                         font-semibold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
                         transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>List Resource</span>
            </motion.button>

            {/* View toggle */}
            <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 gap-0.5">
              {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === mode
                    ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Mobile filter toggle */}
            <button onClick={() => setShowFilters(v => !v)}
              className="sm:hidden flex items-center gap-1.5 border border-white/[0.08] px-3 py-2
                         rounded-xl text-gray-400 text-xs transition-colors">
              <Filter size={13} />
              {(filters.category_slug || filters.item_type || filters.min_price) && (
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              )}
            </button>

            {/* My Listings — mobile only */}
            <button onClick={loadMyListings}
              className="sm:hidden flex items-center gap-1.5 border border-white/[0.08] px-3 py-2
                         rounded-xl text-gray-400 text-xs transition-colors">
              <List size={13} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              ref={searchRef}
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search resources, templates, tools..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl
                         pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600
                         focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setFilters(f => ({ ...f, category_slug: '', item_type: '' }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${!filters.category_slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border border-white/[0.06]'}`}
            >
              All
            </button>
            {categories.map(cat => {
              const Icon  = CATEGORY_ICONS[cat.slug] || Package;
              const color = CATEGORY_COLORS[cat.slug] || CATEGORY_COLORS.development;
              const active = filters.category_slug === cat.slug;
              return (
                <button key={cat.id}
                  onClick={() => setFilters(f => ({ ...f, category_slug: cat.slug, item_type: '' }))}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                              text-xs font-medium transition-colors border
                    ${active
                      ? `${color.bg} ${color.text} ${color.border}`
                      : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] border-white/[0.06]'}`}
                >
                  <Icon size={11} /> {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/[0.05] bg-[#0a0c10]"
            >
              <div className="px-4 py-3 space-y-3">
                {/* Sort */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Sort by</p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value}
                        onClick={() => setFilters(f => ({ ...f, sort: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                          ${filters.sort === opt.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-type */}
                {selectedCat?.allowed_types?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Type</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setFilters(f => ({ ...f, item_type: '' }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                          ${!filters.item_type ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                        All
                      </button>
                      {selectedCat.allowed_types.map(t => (
                        <button key={t} onClick={() => setFilters(f => ({ ...f, item_type: t }))}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                            ${filters.item_type === t ? 'bg-blue-600 text-white' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Price range</p>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min $" min="0"
                      value={filters.min_price}
                      onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2
                                 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                    <span className="text-gray-600 text-xs">to</span>
                    <input type="number" placeholder="Max $" min="0"
                      value={filters.max_price}
                      onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2
                                 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop sort bar ────────────────────────────── */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => setFilters(f => ({ ...f, sort: opt.value }))}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors
                  ${filters.sort === opt.value
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'}`}>
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sub-type filter desktop */}
            {selectedCat?.allowed_types?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 text-xs">Type:</span>
                <select value={filters.item_type}
                  onChange={e => setFilters(f => ({ ...f, item_type: e.target.value }))}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5
                             text-gray-300 text-xs focus:outline-none appearance-none">
                  <option value="">All</option>
                  {selectedCat.allowed_types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            <p className="text-gray-600 text-xs">
              {loading ? '...' : `${pagination.total} resource${pagination.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Listings grid / list ─────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 pb-8">
        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`bg-[#111318] border border-white/[0.05] rounded-2xl animate-pulse
                ${viewMode === 'grid' ? 'h-72' : 'h-24'}`} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-4">
              <Package size={36} className="text-gray-600" />
            </div>
            <p className="text-white font-semibold text-lg">No listings found</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              {filters.search || filters.category_slug
                ? 'Try adjusting your search or filters'
                : 'Be the first to list a startup resource'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div key="grid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.map(l => (
                  <GridCard key={l.id} listing={l} onClick={setSelectedListing} />
                ))}
              </motion.div>
            ) : (
              <motion.div key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2.5 max-w-3xl">
                {listings.map(l => (
                  <ListCard key={l.id} listing={l} onClick={setSelectedListing} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => loadListings(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                  ${pagination.page === i+1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] border border-white/[0.06]'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── Modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedListing && (
          <ListingDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            myPurchases={myPurchases}
          />
        )}
        {showCreate && (
          <CreateListingModal
            categories={categories}
            onClose={() => setShowCreate(false)}
            onCreated={(nl) => { setListings(p => [nl, ...p]); loadListings(1); }}
          />
        )}
        {showMyListings && (
          <MyListingsSheet listings={myListings} onClose={() => setShowMyListings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketplacePage;