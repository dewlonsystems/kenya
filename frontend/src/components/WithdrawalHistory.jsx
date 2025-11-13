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
import { TrendingDown } from '@mui/icons-material'

function WithdrawalHistory({ withdrawals = [], loading = false }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Withdrawal History" 
        avatar={<TrendingDown sx={{ color: 'error.main' }} />}
        sx={{ backgroundColor: 'error.light', color: 'white' }}
      />
      <CardContent>
        {withdrawals.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center">
            No withdrawals yet
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Wallet</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Processed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>KSh {withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={withdrawal.wallet_type === 'earnings' ? 'Earnings' : 'Referral'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(withdrawal.status)}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleDateString() : 'N/A'}
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

export default WithdrawalHistory