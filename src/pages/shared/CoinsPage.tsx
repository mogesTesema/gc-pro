import React, { useState, useEffect } from 'react';
import { coinsAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ICoinTransaction } from '../../types';
import { PageLoading, EmptyState, Modal, Spinner } from '../../components/common/index';
import { Coins, ArrowUpCircle, ArrowDownCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CoinsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ICoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await coinsAPI.getTransactions();
        setTransactions(res.data.transactions || []);
      } catch {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRequest = async () => {
    if (!reqAmount || parseInt(reqAmount) <= 0) { toast.error('Enter valid amount'); return; }
    setReqLoading(true);
    try {
      await coinsAPI.request({ amount: parseInt(reqAmount), note: reqNote });
      toast.success('Request submitted! Admin will review and add coins.');
      setShowRequestModal(false);
      setReqAmount('');
      setReqNote('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setReqLoading(false);
    }
  };

  const credits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const debits  = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coins</h1>
        <p className="text-gray-500 mt-1">Manage your coin balance and transactions</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">Current Balance</p>
            <p className="text-5xl font-bold mt-1">🪙 {user?.coinBalance ?? 0}</p>
            <p className="text-yellow-100 text-sm mt-2">Coins</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-xl px-4 py-2 mb-2 text-center">
              <p className="text-xs text-yellow-100">Total Earned</p>
              <p className="text-lg font-bold">+{credits}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-yellow-100">Total Spent</p>
              <p className="text-lg font-bold">-{debits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Post a Campaign', cost: 10, icon: '📢', role: 'business' },
          { label: 'Apply to Campaign', cost: 5, icon: '📝', role: 'creator' },
        ].map(({ label, cost, icon, role }) => (
          <div key={label} className={`bg-white rounded-xl border p-4 ${user?.role === role ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}`}>
            <p className="text-2xl mb-2">{icon}</p>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">🪙 {cost} coins</p>
          </div>
        ))}
      </div>

      {/* Request button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">Transaction History</h2>
        <button onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={15} /> Request Coins
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <EmptyState icon={<span className="text-5xl">🪙</span>} title="No transactions yet" description="Your transaction history will appear here." />
        ) : (
          <div className="divide-y">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'credit'
                      ? <ArrowUpCircle size={18} className="text-green-600" />
                      : <ArrowDownCircle size={18} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                  </p>
                  <p className="text-xs text-gray-400">Balance: {tx.balanceAfter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Coins from Admin" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Submit a request to admin for additional coins. The admin will review and add coins manually.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount Needed</label>
            <input type="number" value={reqAmount} onChange={(e) => setReqAmount(e.target.value)} placeholder="e.g. 50" min={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
            <textarea value={reqNote} onChange={(e) => setReqNote(e.target.value)} rows={3} placeholder="Why do you need more coins?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowRequestModal(false)} className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleRequest} disabled={reqLoading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {reqLoading ? <Spinner size={15} /> : null} Submit Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CoinsPage;
