import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaCheckCircle, FaHourglassHalf, FaMoneyBillWave,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import AdminLayout from '../components/AdminLayout';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const Container = styled.div`
  padding: 20px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  h1 { font-size: 2rem; font-weight: 800; color: #fff; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: #111;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;

  .icon {
    width: 50px; height: 50px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    &.total { background: rgba(55, 138, 221, 0.1); color: #378ADD; }
    &.success { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    &.pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
    &.paid { background: rgba(155, 89, 182, 0.1); color: #9b59b6; }
  }

  .details {
    p { font-size: 0.85rem; color: #888; margin-bottom: 4px; }
    h3 { font-size: 1.5rem; font-weight: 800; color: #fff; }
  }
`;

const TabContainer = styled.div`
  background: #111;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tab = styled.button`
  padding: 20px 30px;
  background: none; border: none;
  color: ${props => props.active ? '#378ADD' : '#888'};
  font-weight: 600; cursor: pointer; position: relative;
  transition: all 0.2s;
  &:after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
    background: #378ADD; transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }
  &:hover { color: #fff; }
`;

const TabBody = styled.div` padding: 30px; `;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th { text-align: left; padding: 15px; color: #888; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
  td { padding: 15px; color: #fff; font-size: 0.9rem; border-bottom: 1px solid rgba(255, 255, 255, 0.02); }
  tr:hover { background: rgba(255, 255, 255, 0.01); }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  &.enrolled { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
  &.pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
  &.paid { background: rgba(155, 89, 182, 0.1); color: #9b59b6; }
  &.not_earned { background: rgba(255, 255, 255, 0.05); color: #666; }
`;

const ActionButton = styled.button`
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(55, 138, 221, 0.3);
  background: rgba(55, 138, 221, 0.1); color: #378ADD; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: #378ADD; color: #fff; }
  &.approve { border-color: rgba(46, 204, 113, 0.3); background: rgba(46, 204, 113, 0.1); color: #2ecc71; &:hover { background: #2ecc71; color: #fff; } }
`;

// --- Settings Components ---
const SettingsGrid = styled.div`
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const SettingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  label { font-size: 0.9rem; font-weight: 600; color: #ccc; }
  input {
    background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px; padding: 12px 15px; color: #fff; font-size: 1rem;
    &:focus { border-color: #378ADD; outline: none; }
  }
  .desc { font-size: 0.8rem; color: #666; }
`;

const SaveButton = styled.button`
  background: #378ADD; color: #fff; border: none; padding: 12px 30px;
  border-radius: 12px; font-weight: 700; cursor: pointer;
  align-self: flex-start; transition: all 0.2s;
  &:hover { background: #2a6db0; transform: translateY(-2px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// --- Modal ---
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center;
`;

const ModalContent = styled.div`
  background: #111; border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px; padding: 40px; width: 100%; max-width: 500px;
  h2 { margin-bottom: 25px; font-size: 1.5rem; }
`;

const AdminReferral = () => {
  const [activeTab, setActiveTab] = useState('All Referrals');
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [settings, setSettings] = useState({ cash_reward: 1000, fee_discount: 1500, is_active: true, max_referrals_per_user: 0 });
  const [stats, setStats] = useState({ total: 0, successful: 0, pendingPayouts: 0, totalPaid: 0 });
  const [showPayoutModal, setShowPayoutModal] = useState(null);
  const [payoutData, setPayoutData] = useState({ type: 'cash', method: 'Cash', reference: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Settings
      const { data: sData } = await supabase.from('referral_settings').select('*').single();
      if (sData) setSettings(sData);

      // 2. Get All Referrals
      const { data: rData } = await supabase
        .from('referrals')
        .select('*')
        .order('referred_at', { ascending: false });
      
      if (rData) {
        setReferrals(rData);
        
        // Calculate Stats
        const total = rData.length;
        const successful = rData.filter(r => r.status === 'enrolled').length;
        const pendingPayouts = rData.filter(r => r.payout_status === 'pending').length;
        const totalPaid = rData.filter(r => r.payout_status === 'paid').reduce((sum, r) => sum + (r.reward_amount || 0), 0);
        
        setStats({ total, successful, pendingPayouts, totalPaid });
      }
    } catch (error) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const { error } = await supabase
        .from('referral_settings')
        .update(settings)
        .eq('id', 1);
      
      if (error) throw error;
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleApprovePayout = async () => {
    if (!showPayoutModal) return;
    
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          payout_status: 'paid',
          reward_type: payoutData.type,
          reward_amount: payoutData.type === 'cash' ? settings.cash_reward : settings.fee_discount,
          payout_method: payoutData.method,
          payout_reference: payoutData.reference,
          payout_notes: payoutData.notes,
          payout_approved_at: new Date().toISOString()
        })
        .eq('id', showPayoutModal.id);
      
      if (error) throw error;
      
      toast.success(`Payout approved for ${showPayoutModal.referred_name}`);
      setShowPayoutModal(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to approve payout");
    }
  };

  const filteredReferrals = activeTab === 'Pending Payouts' 
    ? referrals.filter(r => r.payout_status === 'pending') 
    : referrals;

  return (
    <AdminLayout>
      <Container>
        <Header>
          <h1>Referral Program</h1>
        </Header>

        <StatsGrid>
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard>
                <div className="icon total"><FaUsers /></div>
                <div className="details">
                  <p>Total Referrals</p>
                  <h3>{stats.total}</h3>
                </div>
              </StatCard>
              <StatCard>
                <div className="icon success"><FaCheckCircle /></div>
                <div className="details">
                  <p>Successful</p>
                  <h3>{stats.successful}</h3>
                </div>
              </StatCard>
              <StatCard>
                <div className="icon pending"><FaHourglassHalf /></div>
                <div className="details">
                  <p>Pending Payouts</p>
                  <h3>{stats.pendingPayouts}</h3>
                </div>
              </StatCard>
              <StatCard>
                <div className="icon paid"><FaMoneyBillWave /></div>
                <div className="details">
                  <p>Total Paid Out</p>
                  <h3>Rs. {stats.totalPaid.toLocaleString()}</h3>
                </div>
              </StatCard>
            </>
          )}
        </StatsGrid>

        <TabContainer>
          <TabBar>
            <Tab active={activeTab === 'All Referrals'} onClick={() => setActiveTab('All Referrals')}>All Referrals</Tab>
            <Tab active={activeTab === 'Pending Payouts'} onClick={() => setActiveTab('Pending Payouts')}>Pending Payouts ({stats.pendingPayouts})</Tab>
            <Tab active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')}>Settings</Tab>
          </TabBar>

          <TabBody>
            <AnimatePresence mode="wait">
              {activeTab !== 'Settings' ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Referrer</th>
                        <th>Referred Person</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payout</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i}>
                            <td><Skeleton height="20px" width="100px" /></td>
                            <td><Skeleton height="35px" width="150px" /></td>
                            <td><Skeleton height="20px" width="80px" /></td>
                            <td><Skeleton height="24px" width="70px" radius="12px" /></td>
                            <td><Skeleton height="24px" width="70px" radius="12px" /></td>
                            <td><Skeleton height="32px" width="100px" radius="8px" /></td>
                          </tr>
                        ))
                      ) : filteredReferrals.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div style={{fontWeight:600}}>{r.referrer_role === 'teacher' ? '👨‍🏫 ' : '🎓 '}{r.referrer_id.substring(0,8)}...</div>
                          </td>
                          <td>
                            <div style={{fontWeight:600}}>{r.referred_name}</div>
                            <div style={{fontSize:'0.75rem', color:'#666'}}>{r.referred_phone}</div>
                          </td>
                          <td>{new Date(r.referred_at).toLocaleDateString()}</td>
                          <td><Badge className={r.status}>{r.status}</Badge></td>
                          <td><Badge className={r.payout_status}>{r.payout_status.replace('_', ' ')}</Badge></td>
                          <td>
                            {r.payout_status === 'pending' && (
                              <ActionButton className="approve" onClick={() => setShowPayoutModal(r)}>
                                Approve Payout
                              </ActionButton>
                            )}
                            {r.payout_status === 'paid' && (
                              <div style={{fontSize:'0.8rem', color:'#2ecc71'}}><FaCheck /> Paid via {r.payout_method}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <SettingsGrid>
                    <SettingItem>
                      <label>Cash Reward (Rs.)</label>
                      <input 
                        type="number" 
                        value={settings.cash_reward} 
                        onChange={(e) => setSettings({...settings, cash_reward: parseInt(e.target.value)})}
                      />
                      <div className="desc">Amount paid to the referrer in cash.</div>
                    </SettingItem>
                    <SettingItem>
                      <label>Fee Discount (Rs.)</label>
                      <input 
                        type="number" 
                        value={settings.fee_discount} 
                        onChange={(e) => setSettings({...settings, fee_discount: parseInt(e.target.value)})}
                      />
                      <div className="desc">Discount amount if the referrer chooses a fee waiver.</div>
                    </SettingItem>
                    <SettingItem>
                      <label>Referral Program Status</label>
                      <div style={{display:'flex', gap:'10px'}}>
                        <ActionButton 
                          className={settings.is_active ? 'approve' : ''} 
                          onClick={() => setSettings({...settings, is_active: true})}
                        >Active</ActionButton>
                        <ActionButton 
                          className={!settings.is_active ? 'approve' : ''} 
                          style={!settings.is_active ? {borderColor:'#e74c3c', background:'rgba(231,76,60,0.1)', color:'#e74c3c'} : {}}
                          onClick={() => setSettings({...settings, is_active: false})}
                        >Paused</ActionButton>
                      </div>
                    </SettingItem>
                    <SaveButton onClick={handleUpdateSettings}>Save Settings</SaveButton>
                  </SettingsGrid>
                </motion.div>
              )}
            </AnimatePresence>
          </TabBody>
        </TabContainer>

        {/* Payout Modal */}
        {showPayoutModal && (
          <ModalOverlay onClick={() => setShowPayoutModal(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <h2>Approve Payout</h2>
              <div style={{background:'rgba(255,255,255,0.02)', padding:'20px', borderRadius:'16px', marginBottom:'25px'}}>
                <p style={{color:'#888', fontSize:'0.85rem', marginBottom:'5px'}}>Referred Person</p>
                <p style={{fontWeight:700, fontSize:'1.1rem'}}>{showPayoutModal.referred_name}</p>
              </div>

              <SettingItem>
                <label>Reward Type</label>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                  <ActionButton 
                    className={payoutData.type === 'cash' ? 'approve' : ''}
                    onClick={() => setPayoutData({...payoutData, type: 'cash'})}
                  >Cash (Rs. {settings.cash_reward})</ActionButton>
                  <ActionButton 
                    className={payoutData.type === 'fee_discount' ? 'approve' : ''}
                    onClick={() => setPayoutData({...payoutData, type: 'fee_discount'})}
                  >Discount (Rs. {settings.fee_discount})</ActionButton>
                </div>
              </SettingItem>

              {payoutData.type === 'cash' && (
                <SettingItem style={{marginTop:'20px'}}>
                  <label>Payment Method</label>
                  <select 
                    style={{background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px', color:'#fff'}}
                    value={payoutData.method}
                    onChange={(e) => setPayoutData({...payoutData, method: e.target.value})}
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>JazzCash / EasyPaisa</option>
                    <option>Online</option>
                  </select>
                </SettingItem>
              )}

              <SettingItem style={{marginTop:'20px'}}>
                <label>Reference # / Notes</label>
                <input 
                  placeholder="e.g. Transaction ID or Bank Ref"
                  value={payoutData.reference}
                  onChange={(e) => setPayoutData({...payoutData, reference: e.target.value})}
                />
              </SettingItem>

              <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                <SaveButton style={{flex:1}} onClick={handleApprovePayout}>Confirm Payout</SaveButton>
                <ActionButton style={{flex:1, border:'none'}} onClick={() => setShowPayoutModal(null)}>Cancel</ActionButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AdminReferral;
