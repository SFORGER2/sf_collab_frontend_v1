/**
 * StorePage - SF Collab Virtual Product Store
 * Browse and purchase virtual items with SF Coins or Crystals
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Coins, Gem, Search, Star, Sparkles, Zap,
  Crown, Palette, Gift, Package, Clock, CheckCircle, X,
  ChevronRight, TrendingUp, ShoppingCart, AlertCircle,
} from 'lucide-react';
import { storeAPI, walletAPI } from '@/utils/APIs/walletAPI';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const PRODUCT_TYPE_ICONS = {
  feature_unlock: Zap,
  cosmetic: Palette,
  booster: TrendingUp,
  subscription: Crown,
  collectible: Star,
  currency_pack: Package,
};

// event_tokens removed
const CURRENCY_CONFIG = {
  sf_coins: {
    icon: Coins,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-yellow-600',
  },
  premium_gems: {
    icon: Gem,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500 to-pink-600',
  },
};

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => { fetchStoreData(); }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [productsRes, featuredRes, walletRes] = await Promise.all([
        storeAPI.getProducts(),
        storeAPI.getFeaturedProducts(),
        walletAPI.getBalance(),
      ]);
      if (productsRes.success) setProducts(productsRes.products);
      if (featuredRes.success) setFeaturedProducts(featuredRes.products);
      if (walletRes.success) setWallet(walletRes.wallet);
    } catch (error) {
      console.error('Error fetching store data:', error);
      toast.error('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    if (!canAfford(product)) {
      toast.error(`Insufficient ${product.currency_type === 'sf_coins' ? 'SF Coins' : 'SF Crystals'}`);
      return;
    }
    try {
      setPurchasingId(product.id);
      const result = await storeAPI.purchaseProduct(product.id);
      if (result.success) {
        toast.success(`Successfully purchased ${product.name}!`);
        // Use wallet from response if available, otherwise refetch
        if (result.wallet) {
          setWallet(result.wallet);
        } else {
          const walletRes = await walletAPI.getBalance();
          if (walletRes.success) setWallet(walletRes.wallet);
        }
        setSelectedProduct(null);
      } else {
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  const canAfford = (product) => {
    if (!wallet) return false;
    switch (product.currency_type) {
      case 'sf_coins':     return wallet.sf_coins >= product.price;
      case 'premium_gems': return wallet.premium_gems >= product.price;
      default:             return false;
    }
  };

  const getBalance = (currencyType) => {
    if (!wallet) return 0;
    switch (currencyType) {
      case 'sf_coins':     return wallet.sf_coins;
      case 'premium_gems': return wallet.premium_gems;
      default:             return 0;
    }
  };

  const filteredProducts = products.filter((product) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedType && product.product_type !== selectedType) return false;
    if (selectedCurrency && product.currency_type !== selectedCurrency) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
            </div>
            SF Store
          </h1>
          <p className="text-gray-400 mt-1">Unlock features, cosmetics & boosters</p>
        </div>

        <div className="flex items-center gap-2">
          {wallet && (
            <>
              <WalletBadge icon={Coins} value={wallet.sf_coins}     color="text-amber-400"  bg="bg-amber-500/10" />
              <WalletBadge icon={Gem}   value={wallet.premium_gems} color="text-purple-400" bg="bg-purple-500/10" />
            </>
          )}
          <Link to="/wallet" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </motion.div>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.slice(0, 3).map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                canAfford={canAfford(product)}
                onPurchase={() => setSelectedProduct(product)}
                purchasing={purchasingId === product.id}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <FilterPill label="All"       active={!selectedCurrency && !selectedType} onClick={() => { setSelectedCurrency(null); setSelectedType(null); }} />
          <FilterPill label="Coins"     icon={Coins}     active={selectedCurrency === 'sf_coins'}     onClick={() => setSelectedCurrency(selectedCurrency === 'sf_coins'     ? null : 'sf_coins')}     color="text-amber-400" />
          <FilterPill label="Crystals"  icon={Gem}       active={selectedCurrency === 'premium_gems'} onClick={() => setSelectedCurrency(selectedCurrency === 'premium_gems' ? null : 'premium_gems')} color="text-purple-400" />
          <FilterPill label="Features"  icon={Zap}       active={selectedType === 'feature_unlock'}   onClick={() => setSelectedType(selectedType === 'feature_unlock'   ? null : 'feature_unlock')} />
          <FilterPill label="Cosmetics" icon={Palette}   active={selectedType === 'cosmetic'}         onClick={() => setSelectedType(selectedType === 'cosmetic'         ? null : 'cosmetic')} />
          <FilterPill label="Boosters"  icon={TrendingUp} active={selectedType === 'booster'}         onClick={() => setSelectedType(selectedType === 'booster'         ? null : 'booster')} />
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id} product={product} canAfford={canAfford(product)}
            onPurchase={() => setSelectedProduct(product)} purchasing={purchasingId === product.id} index={index}
          />
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No products found</p>
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <PurchaseModal
            product={selectedProduct}
            balance={getBalance(selectedProduct.currency_type)}
            canAfford={canAfford(selectedProduct)}
            onPurchase={() => handlePurchase(selectedProduct)}
            onClose={() => setSelectedProduct(null)}
            purchasing={purchasingId === selectedProduct.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};


// ─── Sub-components ───────────────────────────────────────────────────────────

const WalletBadge = ({ icon: Icon, value, color, bg }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bg} border border-white/10`}>
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-white font-medium text-sm">{value.toLocaleString()}</span>
  </div>
);

const FilterPill = ({ label, icon: Icon, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
      active ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
    }`}
  >
    {Icon && <Icon className={`w-4 h-4 ${active ? '' : color || ''}`} />}
    {label}
  </button>
);

const FeaturedProductCard = ({ product, canAfford, onPurchase, purchasing }) => {
  const currency = CURRENCY_CONFIG[product.currency_type];
  const TypeIcon = PRODUCT_TYPE_ICONS[product.product_type] || Gift;
  const CurrencyIcon = currency?.icon || Coins;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-6 group">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-colors" />
      {product.badge_text && (
        <span className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">{product.badge_text}</span>
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <TypeIcon className="w-6 h-6 text-white" />
          </div>
          {product.discount_percent && <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold">-{product.discount_percent}%</span>}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyIcon className={`w-5 h-5 ${currency?.color}`} />
            <span className="text-white font-bold text-lg">{product.price.toLocaleString()}</span>
            {product.original_price && <span className="text-gray-500 line-through text-sm">{product.original_price.toLocaleString()}</span>}
          </div>
          <button
            onClick={onPurchase} disabled={purchasing || !canAfford}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {purchasing ? 'Buying...' : canAfford ? 'Buy Now' : 'Insufficient'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductCard = ({ product, canAfford, onPurchase, purchasing, index }) => {
  const currency = CURRENCY_CONFIG[product.currency_type];
  const TypeIcon = PRODUCT_TYPE_ICONS[product.product_type] || Gift;
  const CurrencyIcon = currency?.icon || Coins;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 p-5 group transition-colors"
    >
      {product.badge_text && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">{product.badge_text}</span>
      )}
      <div className={`w-12 h-12 rounded-xl ${currency?.bg} flex items-center justify-center mb-4`}>
        <TypeIcon className={`w-6 h-6 ${currency?.color}`} />
      </div>
      <h3 className="text-white font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
      {product.benefits && product.benefits.length > 0 && (
        <ul className="space-y-1 mb-4">
          {product.benefits.slice(0, 2).map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-400" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
      {product.duration_days && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          {product.duration_days} days
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <CurrencyIcon className={`w-4 h-4 ${currency?.color}`} />
          <span className="text-white font-bold">{product.price.toLocaleString()}</span>
        </div>
        <button
          onClick={onPurchase} disabled={purchasing}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            canAfford ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {purchasing ? '...' : 'Buy'}
        </button>
      </div>
    </motion.div>
  );
};

const PurchaseModal = ({ product, balance, canAfford, onPurchase, onClose, purchasing }) => {
  const currency = CURRENCY_CONFIG[product.currency_type];
  const TypeIcon = PRODUCT_TYPE_ICONS[product.product_type] || Gift;
  const CurrencyIcon = currency?.icon || Coins;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden"
      >
        <div className={`h-24 bg-gradient-to-br ${currency?.gradient || 'from-blue-500 to-purple-600'} relative`}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute -bottom-6 left-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border-4 border-[#1a1a1a] flex items-center justify-center">
              <div className={`w-full h-full rounded-xl ${currency?.bg} flex items-center justify-center`}>
                <TypeIcon className={`w-8 h-8 ${currency?.color}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-10">
          <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>
          <p className="text-gray-400 text-sm mb-6">{product.description}</p>

          {product.benefits && product.benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">What you'll get:</h4>
              <ul className="space-y-2">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.duration_days && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 mb-6">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Valid for {product.duration_days} days after purchase</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Price</span>
              <div className="flex items-center gap-2">
                <CurrencyIcon className={`w-5 h-5 ${currency?.color}`} />
                <span className="text-white font-bold text-lg">{product.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-gray-400">Your balance</span>
              <div className="flex items-center gap-2">
                <CurrencyIcon className={`w-4 h-4 ${currency?.color}`} />
                <span className={`font-medium ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{balance.toLocaleString()}</span>
              </div>
            </div>
            {!canAfford && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                You need {(product.price - balance).toLocaleString()} more
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button
              onClick={onPurchase} disabled={purchasing || !canAfford}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                canAfford
                  ? `bg-gradient-to-r ${currency?.gradient || 'from-blue-600 to-purple-600'} text-white hover:shadow-lg`
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {purchasing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  {canAfford ? 'Confirm Purchase' : 'Insufficient Funds'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StorePage;