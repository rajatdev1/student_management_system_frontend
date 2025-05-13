import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import api from '../../services/api';
import CreateClassForm from './CreateClassForm';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      
      // First check if classes exist, if not initialize them
      const response = await api.get('/classes');
      
      if (response.data.length === 0) {
        await api.post('/classes/initialize');
        const newResponse = await api.get('/classes');
        setClasses(newResponse.data);
        setSuccessMessage('Default classes have been initialized');
        setOpenSnackbar(true);
      } else {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCounts = async () => {
    try {
      const counts = {};
      // Fetch student count for each class
      await Promise.all(
        classes.map(async (classItem) => {
          const response = await api.get(`/students/class/${classItem.id}/count`);
          counts[classItem.id] = response.data.count;
        })
      );
      setStudentCounts(counts);
    } catch (error) {
      console.error('Error fetching student counts:', error);
      // You can choose to handle this error silently or show a message
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudentCounts();
    }
  }, [classes]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClassCreated = (newClass) => {
    setClasses([...classes, newClass]);
    setSuccessMessage('Class created successfully!');
    setOpenSnackbar(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Classes</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/students/create"
            sx={{ mr: 2 }}
          >
            Add Student
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Add Class
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} sm={6} md={4} key={classItem.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h5" component="div">
                    {classItem.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {classItem.description || 'No description available'}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body1">
                    Annual Fee: ₹{classItem.annual_fee}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {studentCounts[classItem.id] !== undefined 
                        ? studentCounts[classItem.id] 
                        : <CircularProgress size={20} />}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  component={Link}
                  to={`/classes/${classItem.id}/students`}
                >
                  View Students
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Class Dialog */}
      <CreateClassForm 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)} 
        onClassCreated={handleClassCreated}
      />

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassesPage;