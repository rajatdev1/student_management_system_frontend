import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  Modal,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const StudentDetailsPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openFeeModal, setOpenFeeModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [feePayments, setFeePayments] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/students/${id}`);
        setStudent(response.data);
      } catch (err) {
        console.error('Failed to fetch student details:', err);
        setError('Failed to fetch student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleOpenFeeModal = async () => {
    setOpenFeeModal(true);
    setFeeLoading(true);
    try {
      const response = await api.get(`/fees/student/${id}`);
      setFeePayments(response.data);
    } catch (err) {
      console.error('Error fetching fee payments:', err);
      setError('Failed to load fee payments');
    } finally {
      setFeeLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setDepositAmount('');
    setDepositError('');
  };

  const handleDepositChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers with up to 2 decimal places
      setDepositAmount(value);
    }
  };

  const handleFeeDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      setDepositError('Please enter a valid amount');
      return;
    }

    try {
      const paymentData = {
        student_id: id,
        amount: parseFloat(depositAmount),
        payment_date: new Date().toISOString().split('T')[0], // Today's date
        academic_year: new Date().getFullYear(),
        payment_method: 'cash'
      };

      await api.post('/fees', paymentData);
      
      // Refresh student data
      const updatedStudent = await api.get(`/students/${id}`);
      setStudent(updatedStudent.data);
      
      // Refresh fee payments
      const updatedPayments = await api.get(`/fees/student/${id}`);
      setFeePayments(updatedPayments.data);
      
      setSuccessMessage('Fee deposited successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        handleCloseEditModal();
      }, 2000);
    } catch (err) {
      console.error('Error depositing fee:', err);
      setDepositError('Failed to deposit fee. Please try again.');
    }
  };

  const calculateDueAmount = () => {
    if (!student) return 0;
    const annualFee = parseFloat(student.class.annual_fee) || 0;
    const totalPaid = student.fee_payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    return annualFee - totalPaid;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  if (!student) {
    return (
      <Typography variant="h6">
        Student not found
      </Typography>
    );
  }

  // Ensure values are parsed as numbers
  const annualFee = parseFloat(student.class.annual_fee) || 0;
  const totalPaid = student.fee_payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  const dueAmount = calculateDueAmount();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          component={Link}
          to={`/classes/${student.class_id}/students`}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Class
        </Button>
        <Typography variant="h4">
          Student Details
        </Typography>
      </Box>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Student Details Card (unchanged) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {student.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Class: {student.class.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {student.is_active ? 'Active' : 'Inactive'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Parent Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Father's Name:</strong> {student.father_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Occupation:</strong> {student.father_occupation || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Education:</strong> {student.father_education || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Aadhar:</strong> {student.father_aadhar || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Mother's Name:</strong> {student.mother_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Occupation:</strong> {student.mother_occupation || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Education:</strong> {student.mother_education || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Aadhar:</strong> {student.mother_aadhar || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                <strong>Address:</strong> {student.address || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Contact Number:</strong> {student.contact_number || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Fee Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fee Information
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Annual Fee:</strong> ₹{annualFee.toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total Paid:</strong> ₹{totalPaid.toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Due Amount:</strong> ₹{dueAmount.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenFeeModal}
                sx={{ mt: 2 }}
              >
                Payments History
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={handleOpenEditModal}
                sx={{ mt: 2, ml: 2 }}
              >
                Deposit Fee
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fee Payments Modal */}
      <Modal
        open={openFeeModal}
        onClose={() => setOpenFeeModal(false)}
        aria-labelledby="fee-payments-modal"
        aria-describedby="fee-payments-list"
      >
        <Box sx={style}>
          <Typography id="fee-payments-modal" variant="h6" component="h2" gutterBottom>
            Fee Payments
          </Typography>
          {feeLoading ? (
            <CircularProgress />
          ) : (
            <Box>
              {feePayments.length === 0 ? (
                <Typography>No fee payments found</Typography>
              ) : (
                <Box>
                  {feePayments.map((payment) => (
                    <Paper key={payment.id} sx={{ p: 2, mb: 2 }}>
                      <Typography><strong>Amount:</strong> ₹{(parseFloat(payment.amount) || 0).toFixed(2)}</Typography>
                      <Typography><strong>Date:</strong> {new Date(payment.payment_date).toLocaleDateString()}</Typography>
                      <Typography><strong>Academic Year:</strong> {payment.academic_year}</Typography>
                      <Typography><strong>Method:</strong> {payment.payment_method}</Typography>
                      {payment.transaction_reference && (
                        <Typography><strong>Reference:</strong> {payment.transaction_reference}</Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
              <Button
                variant="contained"
                onClick={() => setOpenFeeModal(false)}
                sx={{ mt: 2 }}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Fee Deposit Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Deposit Fee</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>Student:</strong> {student.name}
            </Typography>
            <Typography variant="body1">
              <strong>Class:</strong> {student.class.name}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              <strong>Annual Fee:</strong> ₹{annualFee.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Total Paid:</strong> ₹{totalPaid.toFixed(2)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Due Amount:</strong> ₹{dueAmount.toFixed(2)}
            </Typography>

            <TextField
              fullWidth
              label="Deposit Amount (₹)"
              variant="outlined"
              value={depositAmount}
              onChange={handleDepositChange}
              sx={{ mt: 2 }}
            />
            {depositError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {depositError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button 
            onClick={handleFeeDeposit}
            variant="contained"
            color="primary"
          >
            Deposit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDetailsPage;