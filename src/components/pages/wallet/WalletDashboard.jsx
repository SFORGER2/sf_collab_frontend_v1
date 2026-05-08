import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  History, ShoppingBag, Sparkles, RefreshCw, ChevronRight,
  Zap, X, Plus, Minus, RotateCcw, DollarSign, Gem,
} from 'lucide-react';
import { walletAPI, balanceAPI, crystalsAPI } from '@/utils/APIs/walletAPI';
import { paymentAPI } from '@/utils/APIs/paymentAPI';
import useGetCredits from '@/utils/hooks/useGetCredits';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';

const TRANSACTION_ICONS = {
  earn:     { icon: TrendingUp,    bg: 'bg-green-500/20',  color: 'text-green-400' },
  spend:    { icon: TrendingDown,  bg: 'bg-red-500/20',    color: 'text-red-400' },
  purchase: { icon: TrendingDown,  bg: 'bg-red-500/20',    color: 'text-red-400' },
  deposit:  { icon: ArrowDownLeft, bg: 'bg-cyan-500/20',   color: 'text-cyan-400' },
  withdraw: { icon: ArrowUpRight,  bg: 'bg-orange-500/20', color: 'text-orange-400' },
  refund:   { icon: RotateCcw,     bg: 'bg-yellow-500/20', color: 'text-yellow-400' },
  bonus:    { icon: Sparkles,      bg: 'bg-purple-500/20', color: 'text-purple-400' },
  transfer: { icon: ArrowUpRight,  bg: 'bg-blue-500/20',   color: 'text-blue-400' },
};

const CURRENCY_CONFIG = {
  sf_coins:     { label: 'SF Coins',    icon: Coins,      color: 'text-amber-400',  bg: 'bg-amber-500/10',  gradient: 'from-amber-500 to-yellow-500' },
  premium_gems: { label: 'SF Crystals', icon: Gem,        color: 'text-purple-400', bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-pink-500' },
  credits:      { label: 'Balance ($)', icon: DollarSign, color: 'text-green-400',  bg: 'bg-green-500/10',  gradient: 'from-green-500 to-emerald-500' },
};

// Crystal packs — must match CRYSTAL_PACKS in payment_routes.py
const CRYSTAL_PACKS = [
  { id: 'crystals_100',  crystals: 100,  price: 0.99,  label: '100 Crystals',   popular: false },
  { id: 'crystals_500',  crystals: 500,  price: 4.49,  label: '500 Crystals',   popular: true  },
  { id: 'crystals_1200', crystals: 1200, price: 9.99,  label: '1,200 Crystals', popular: false },
  { id: 'crystals_3000', crystals: 3000, price: 21.99, label: '3,000 Crystals', popular: false },
];

// ─────────────────────────────────────────────────────────────────────────────

const WalletDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const sfCoins = useGetCredits();

  const [wallet, setWallet] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0); // cents — real money Balance
  const [crystalBalance, setCrystalBalance] = useState(0); // crystals
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCrystalModal, setShowCrystalModal] = useState(false);

  useEffect(() => { fetchWalletData(); }, []);

  // Keep sf_coins live
  useEffect(() => {
    if (wallet) setWallet(prev => ({ ...prev, sf_coins: sfCoins }));
  }, [sfCoins]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'history'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  // Handle return from Stripe checkout
  useEffect(() => {
    const deposit = searchParams.get('deposit');
    const crystals = searchParams.get('crystals');
    if (deposit === 'success') {
      toast.success('Deposit successful! Balance updated.');
      fetchWalletData();
      setSearchParams({});
    }
    if (crystals === 'success') {
      toast.success('Crystals purchased! Check your balance.');
      fetchWalletData();
      setSearchParams({});
    }
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes, realBalanceRes, crystalRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getHistory({ per_page: 20 }),
        balanceAPI.getBalance().catch(() => null),   // real-money Balance
        crystalsAPI.getWallet().catch(() => null),   // crystal wallet
      ]);

      if (balanceRes?.success && balanceRes.wallet) {
        setWallet(prev => ({
          ...balanceRes.wallet,
          sf_coins: sfCoins ?? balanceRes.wallet.sf_coins,
        }));
      }
      if (historyRes?.success) setTransactions(historyRes.transactions || []);

      // Real-money Balance — stored in cents
      if (realBalanceRes?.success && realBalanceRes.balance) {
        setWalletBalance(realBalanceRes.balance.available_cents ?? 0);
      }

      // Crystal wallet balance
      if (crystalRes?.success && crystalRes.crystal_wallet) {
        setCrystalBalance(crystalRes.crystal_wallet.balance ?? 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
    toast.success('Wallet refreshed!');
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const formatNumber = num => {
    if (!num && num !== 0) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = cents => `$${(cents / 100).toFixed(2)}`;

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalEarned = transactions
    .filter(tx => ['earn', 'deposit', 'refund', 'bonus'].includes(tx.transaction_type))
    .reduce((s, tx) => s + (tx.amount || 0), 0);
  const totalSpent = transactions
    .filter(tx => ['spend', 'withdraw', 'purchase'].includes(tx.transaction_type))
    .reduce((s, tx) => s + (tx.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Coins className="w-6 h-6 text-blue-400" />
            </div>
            My Wallet
          </h1>
          <p className="text-gray-400 mt-1">SF Coins · Crystals · Balance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh} disabled={refreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/store"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Visit Store</span>
          </Link>
        </div>
      </motion.div>

      {/* ── 3 currency cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        {/* SF Coins */}
        <CurrencyCard
          label="SF Coins"
          value={0}
          icon={Coins}
          gradient="from-amber-500/10 to-yellow-600/10"
          border="border-amber-500/30"
          iconGradient="from-amber-500 to-yellow-500"
          iconShadow="shadow-amber-500/20"
          subtext="Earned through activities"
          delay={0}
        />

        {/* Crystals — with Buy button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 p-5 group hover:scale-[1.02] transition-transform"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={() => setShowCrystalModal(true)}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Buy
              </button>
            </div>
            <p className="text-gray-400 text-xs mb-1">SF Crystals</p>
            <h2 className="text-3xl font-bold text-white mb-1">{crystalBalance.toLocaleString()}</h2>
            <p className="text-gray-500 text-xs">For visibility boosts</p>
          </div>
        </motion.div>

        {/* Balance (real money) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 p-5 group hover:scale-[1.02] transition-transform"
        >
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/20">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="text-xs px-2 py-1 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-colors flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-1">Balance</p>
            <h2 className="text-3xl font-bold text-white mb-1">{formatCurrency(walletBalance)}</h2>
            <p className="text-gray-500 text-xs">Real money · deposit / withdraw</p>
          </div>
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Earned"    value={formatNumber(totalEarned)}           subtext="SF Coins" icon={TrendingUp}  color="text-green-400" />
        <StatCard label="Total Spent"     value={formatNumber(totalSpent)}            subtext="SF Coins" icon={TrendingDown} color="text-red-400" />
        <StatCard label="Current Balance" value={formatNumber(0)} subtext="SF Coins" icon={Zap} color="text-blue-400" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
        {['overview', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <QuickActionsCard
              onDepositClick={() => setShowDepositModal(true)}
              onWithdrawClick={() => setShowWithdrawModal(true)}
              onBuyCrystalsClick={() => setShowCrystalModal(true)}
            />
            <RecentActivityCard transactions={transactions.slice(0, 5)} formatDate={formatDate} onViewAll={() => handleTabChange('history')} />
          </motion.div>
        )}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TransactionHistoryCard transactions={transactions} formatDate={formatDate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal
            onClose={() => setShowDepositModal(false)}
            onSuccess={() => { setShowDepositModal(false); fetchWalletData(); }}
          />
        )}
        {showWithdrawModal && (
          <WithdrawModal
            walletBalance={walletBalance}
            onClose={() => setShowWithdrawModal(false)}
            onSuccess={() => { setShowWithdrawModal(false); fetchWalletData(); }}
          />
        )}
        {showCrystalModal && (
          <CrystalPurchaseModal
            onClose={() => setShowCrystalModal(false)}
            onSuccess={() => { setShowCrystalModal(false); fetchWalletData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CurrencyCard = ({ label, value, icon: Icon, gradient, border, iconGradient, iconShadow, subtext, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }}
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border ${border} p-5 group hover:scale-[1.02] transition-transform`}
  >
    <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${iconGradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
    <div className="relative z-10">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg ${iconShadow} w-fit mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <h2 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h2>
      <p className="text-gray-500 text-xs">{subtext}</p>
    </div>
  </motion.div>
);

const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
        {subtext && <p className="text-gray-500 text-xs">{subtext}</p>}
      </div>
    </div>
  </div>
);

const QuickActionsCard = ({ onDepositClick, onWithdrawClick, onBuyCrystalsClick }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-blue-400" /> Quick Actions
    </h3>
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Plus,  label: 'Deposit',       color: 'from-green-500 to-emerald-500', onClick: onDepositClick },
        { icon: Minus, label: 'Withdraw',       color: 'from-orange-500 to-red-500',    onClick: onWithdrawClick },
        { icon: Gem,   label: 'Buy Crystals',   color: 'from-purple-500 to-pink-500',   onClick: onBuyCrystalsClick },
      ].map(action => (
        <button
          key={action.label} onClick={action.onClick}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group text-left"
        >
          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
            <action.icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const TransactionRow = ({ tx, formatDate, large = false }) => {
  const txConfig = TRANSACTION_ICONS[tx.transaction_type] || TRANSACTION_ICONS.earn;
  const Icon = txConfig.icon;
  const isPositive = ['earn', 'deposit', 'refund', 'bonus', 'transfer_in'].includes(tx.transaction_type)
    || (tx.transaction_type === 'transfer' && tx.reference_type === 'transfer_in');
  const currCfg = CURRENCY_CONFIG[tx.currency_type] || CURRENCY_CONFIG.sf_coins;
  const CurrIcon = currCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between ${large ? 'p-4' : 'p-3'} rounded-xl bg-white/5 hover:bg-white/[0.07] ${large ? 'border border-white/5' : ''} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`${large ? 'p-3' : 'p-2'} rounded-${large ? 'xl' : 'lg'} ${txConfig.bg}`}>
          <Icon className={`${large ? 'w-5 h-5' : 'w-4 h-4'} ${txConfig.color}`} />
        </div>
        <div>
          <p className="text-white text-sm font-medium">{tx.description || 'Transaction'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-xs">{formatDate(tx.created_at)}</span>
            {large && <><span className="text-gray-600">·</span><span className="text-gray-500 text-xs capitalize">{tx.transaction_type}</span></>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`${large ? 'text-lg' : 'text-sm'} font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : '-'}{(tx.amount || 0).toLocaleString()}
        </p>
        <div className="flex items-center gap-1 justify-end">
          <CurrIcon className={`w-3 h-3 ${currCfg.color}`} />
          <span className="text-gray-500 text-xs">{currCfg.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

const RecentActivityCard = ({ transactions, formatDate, onViewAll }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <History className="w-5 h-5 text-blue-400" /> Recent Activity
      </h3>
      <button onClick={onViewAll} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
        View All <ChevronRight className="w-4 h-4" />
      </button>
    </div>
    {!transactions?.length ? (
      <div className="text-center py-8">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No recent transactions</p>
      </div>
    ) : (
      <div className="space-y-2">
        {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} formatDate={formatDate} />)}
      </div>
    )}
  </div>
);

const TransactionHistoryCard = ({ transactions, formatDate }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
      <History className="w-5 h-5 text-blue-400" /> Transaction History
    </h3>
    {!transactions?.length ? (
      <div className="text-center py-12">
        <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No transactions yet</p>
      </div>
    ) : (
      <div className="space-y-3">
        {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} formatDate={formatDate} large />)}
      </div>
    )}
  </div>
);

// ── Deposit Modal ─────────────────────────────────────────────────────────────
const DepositModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 1) { toast.error('Minimum deposit is $1.00'); return; }
    try {
      setLoading(true);
      // Use payment route to create Stripe checkout session for deposit
      const result = await paymentAPI.depositFunds(Math.round(parseFloat(amount) * 100));
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || 'Failed to start deposit');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deposit failed');
    } finally { setLoading(false); }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-green-400" /> Deposit Money
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" min="1" step="0.01"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum: $1.00</p>
        </div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-300">💳 Secure payment via Stripe. Balance credited after payment completes.</p>
        </div>
        <button
          onClick={handleDeposit} disabled={loading || !amount}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
          Deposit ${amount || '0.00'}
        </button>
      </div>
    </ModalWrapper>
  );
};

// ── Withdraw Modal ────────────────────────────────────────────────────────────
const WithdrawModal = ({ walletBalance, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const available = walletBalance / 100;

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (parseFloat(amount) > available) { toast.error('Insufficient balance'); return; }
    try {
      setLoading(true);
      // Use balanceAPI which hits /api/balance/withdraw
      const result = await balanceAPI.withdraw(parseFloat(amount));
      if (result.success) {
        toast.success(`$${parseFloat(amount).toFixed(2)} withdrawal initiated. Arrives in 2-3 business days.`);
        onSuccess();
      } else {
        toast.error(result.error || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    } finally { setLoading(false); }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Minus className="w-5 h-5 text-orange-400" /> Withdraw Money
      </h2>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">💡 Processed within 2–3 business days to your connected bank account.</p>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" min="1" max={available} step="0.01"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Available: ${available.toFixed(2)}</p>
        </div>
        <button
          onClick={handleWithdraw} disabled={loading || !amount}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Minus className="w-4 h-4" />}
          Withdraw ${amount || '0.00'}
        </button>
      </div>
    </ModalWrapper>
  );
};

// ── Crystal Purchase Modal — Coming Soon ─────────────────────────────────────
const CrystalPurchaseModal = ({ onClose }) => (
  <ModalWrapper onClose={onClose}>
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
        <Gem className="w-8 h-8 text-purple-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">SF Crystals</h2>
      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-4">
        Coming Soon
      </span>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        Crystal packs are being finalised.
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-colors"
      >
        Got it
      </button>
    </div>
  </ModalWrapper>
);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const ModalWrapper = ({ onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={e => e.stopPropagation()}
      className="relative w-full max-w-md rounded-2xl bg-[#1a1a1a] border border-white/10 p-6"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors">
        <X className="w-5 h-5 text-gray-400" />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

export default WalletDashboard;