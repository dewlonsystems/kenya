import React from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Typography
} from '@mui/material'
import { AttachMoney, TrendingUp, TrendingDown } from '@mui/icons-material'

function WalletTransactions({ transactions = [], loading = false }) {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'activation_fee':
        return <TrendingDown color="error" />
      case 'referral_bonus':
        return <TrendingUp color="success" />
      case 'job_payment':
        return <AttachMoney color="primary" />
      case 'milestone_payment':
        return <AttachMoney color="primary" />
      case 'withdrawal':
        return <TrendingDown color="error" />
      default:
        return <AttachMoney color="action" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'activation_fee':
      case 'withdrawal':
        return 'error'
      case 'referral_bonus':
      case 'job_payment':
      case 'milestone_payment':
        return 'success'
      default:
        return 'default'
    }
  }

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'activation_fee': return 'Activation Fee'
      case 'referral_bonus': return 'Referral Bonus'
      case 'job_payment': return 'Job Payment'
      case 'milestone_payment': return 'Milestone Payment'
      case 'withdrawal': return 'Withdrawal'
      case 'admin_adjustment': return 'Admin Adjustment'
      default: return type.replace('_', ' ').toUpperCase()
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Transaction History" 
        avatar={<AttachMoney sx={{ color: 'primary.main' }} />}
        sx={{ backgroundColor: 'primary.light', color: 'white' }}
      />
      <CardContent>
        {transactions.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center">
            No transactions yet
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={getTransactionIcon(transaction.transaction_type)}
                        label={getTransactionLabel(transaction.transaction_type)}
                        color={getTransactionColor(transaction.transaction_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'activation_fee' ? 'error' : 'success'}
                        fontWeight="600"
                      >
                        {transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'activation_fee' ? '-' : '+'}KSh {transaction.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default WalletTransactions