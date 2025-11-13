import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Select,
  MenuItem,
  FormControl,
  InputLabel, 
  Alert,
  Chip,
  Tabs,
  Tab,
  AppBar
} from '@mui/material'
import { AccountBalanceWallet, AttachMoney, TrendingUp, TrendingDown, LocalAtm } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getOverview, requestWithdrawal, getWalletTransactions, getWithdrawalHistory } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import GeometricLoader from '../../components/GeometricLoader'
import WalletTransactions from '../../components/WalletTransactions'
import WithdrawalHistory from '../../components/WithdrawalHistory'

function Wallet() {
  const { userData, loading: authLoading } = useAuth()
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    wallet_type: 'earnings'
  })
  const [withdrawalError, setWithdrawalError] = useState('')
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData && userData.user_id) {
          // Fetch overview data
          const overviewResponse = await getOverview(userData.user_id)
          setOverview(overviewResponse)
          
          // Fetch transaction history
          const transactionsResponse = await getWalletTransactions(userData.user_id)
          setTransactions(transactionsResponse.transactions || [])
          
          // Fetch withdrawal history
          const withdrawalsResponse = await getWithdrawalHistory(userData.user_id)
          setWithdrawals(withdrawalsResponse.withdrawals || [])
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setPageLoading(false)
      }
    }

    if (userData && userData.user_id) {
      fetchData()
    } else {
      setPageLoading(false)
    }
  }, [userData])

  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalData.amount)
    
    if (!amount || amount <= 0) {
      setWithdrawalError('Please enter a valid amount')
      return
    }

    if (withdrawalData.wallet_type === 'earnings') {
      if (amount > (overview?.earnings_wallet || 0)) {
        setWithdrawalError('Insufficient balance in earnings wallet')
        return
      }
      // Check if earnings can be withdrawn (once per month)
      if (overview?.last_earnings_withdrawal) {
        const lastWithdrawal = new Date(overview.last_earnings_withdrawal)
        const now = new Date()
        const oneMonthAgo = new Date(now)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        
        if (lastWithdrawal > oneMonthAgo) {
          setWithdrawalError('Earnings wallet can only be withdrawn once per month')
          return
        }
      }
    } else if (withdrawalData.wallet_type === 'referral') {
      if (amount > (overview?.referral_wallet || 0)) {
        setWithdrawalError('Insufficient balance in referral wallet')
        return
      }
      if (amount < 100) {
        setWithdrawalError('Minimum withdrawal amount is KSh 100 for referral wallet')
        return
      }
    }

    try {
      setWithdrawalLoading(true)
      setWithdrawalError('')

      const withdrawalDataToSend = {
        user_id: userData.user_id,
        amount: amount,
        wallet_type: withdrawalData.wallet_type
      }

      await requestWithdrawal(withdrawalDataToSend)
      setWithdrawalDialogOpen(false)
      setWithdrawalData({ amount: '', wallet_type: 'earnings' })
      
      // Refetch all data to update balances and history
      const overviewResponse = await getOverview(userData.user_id)
      setOverview(overviewResponse)
      
      const transactionsResponse = await getWalletTransactions(userData.user_id)
      setTransactions(transactionsResponse.transactions || [])
      
      const withdrawalsResponse = await getWithdrawalHistory(userData.user_id)
      setWithdrawals(withdrawalsResponse.withdrawals || [])
    } catch (error) {
      setWithdrawalError(error.response?.data?.error || 'Failed to request withdrawal')
      console.error(error)
    } finally {
      setWithdrawalLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Show loading if auth is still loading or wallet data is loading
  if (authLoading || pageLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <GeometricLoader />
          </Box>
        </Box>
      </Box>
    )
  }

  // Check if user is properly authenticated with user_id
  if (!userData || !userData.user_id) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <Alert severity="warning" sx={{ width: '100%' }}>
                User data not available. Please log in again.
              </Alert>
            </Box>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Wallet
            </Typography>

            {/* Wallet Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: '#f0f7f4' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" component="div">
                        Earnings Wallet
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      KSh {overview?.earnings_wallet?.toFixed(2) || '0.00'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label="Withdraw Once Per Month" 
                        color="warning" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Typography variant="h6" component="div">
                        Referral Wallet
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      KSh {overview?.referral_wallet?.toFixed(2) || '0.00'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label="Withdraw Anytime (Min KSh 100)" 
                        color="success" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalAtm sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                      <Typography variant="h6" component="div">
                        Total Wallet
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      KSh {overview?.wallet_balance?.toFixed(2) || '0.00'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label="Combined Balance" 
                        color="info" 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Withdrawal Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Request Withdrawal" 
                    avatar={<TrendingDown sx={{ color: 'error.main' }} />}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Wallet Type</InputLabel>
                          <Select
                            value={withdrawalData.wallet_type}
                            onChange={(e) => setWithdrawalData({...withdrawalData, wallet_type: e.target.value})}
                            label="Wallet Type"
                          >
                            <MenuItem value="earnings">Earnings Wallet</MenuItem>
                            <MenuItem value="referral">Referral Wallet</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Amount (KSh)"
                          type="number"
                          value={withdrawalData.amount}
                          onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                          helperText={
                            withdrawalData.wallet_type === 'earnings' 
                              ? 'Earnings wallet: Withdraw once per month' 
                              : 'Referral wallet: Minimum KSh 100'
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button 
                          variant="contained" 
                          size="large" 
                          onClick={() => setWithdrawalDialogOpen(true)}
                          disabled={!(userData?.is_activated)}  // Safe access to userData.is_activated
                          sx={{ height: '100%' }}
                        >
                          Request Withdrawal
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for different sections */}
            <AppBar position="static" color="default" sx={{ mb: 3, backgroundColor: 'white', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                indicatorColor="primary" 
                textColor="primary" 
                variant="fullWidth"
              >
                <Tab label="Transaction History" />
                <Tab label="Withdrawal History" />
              </Tabs>
            </AppBar>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <WalletTransactions transactions={transactions} />
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <WithdrawalHistory withdrawals={withdrawals} />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Withdrawal Confirmation Dialog */}
          <Dialog open={withdrawalDialogOpen} onClose={() => setWithdrawalDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogContent>
              {withdrawalError && <Alert severity="error" sx={{ mb: 2 }}>{withdrawalError}</Alert>}
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are requesting to withdraw <strong>KSh {withdrawalData.amount}</strong> from your{' '}
                <strong>{withdrawalData.wallet_type === 'earnings' ? 'Earnings' : 'Referral'} Wallet</strong>.
              </Typography>
              
              <Typography variant="body2" color="textSecondary">
                <strong>Important:</strong> {withdrawalData.wallet_type === 'earnings' 
                  ? 'Earnings wallet can only be withdrawn once per month. The withdrawal will be processed by an admin.' 
                  : 'Referral wallet withdrawals are processed immediately if minimum amount (KSh 100) is met.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setWithdrawalDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleWithdrawalSubmit} 
                disabled={withdrawalLoading}
                variant="contained"
                color="error"
              >
                {withdrawalLoading ? <GeometricLoader /> : 'Confirm Withdrawal'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  )
}

export default Wallet