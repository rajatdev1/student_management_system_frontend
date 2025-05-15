import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import AdmitCardButton from './AdmitCardButton'; 
import ResultCardButton from './ResultCardButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const ClassStudentsPage = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
const [selectedStudentId, setSelectedStudentId] = useState(null);


  const [filters, setFilters] = useState({
    id: '',
    name: '',
    father_name: '',
    mother_name: '',
    contact_number: '',
    status: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classResponse, studentsResponse] = await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/students/class/${classId}`)
        ]);
        setClassInfo(classResponse.data);
        setStudents(studentsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch class and student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/students/${studentId}`);
      setStudents(students.filter(student => student.id !== studentId));
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Failed to delete student');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredStudents = students.filter(student =>
    student.id.toString().includes(filters.id) &&
    student.name.toLowerCase().includes(filters.name.toLowerCase()) &&
    student.father_name.toLowerCase().includes(filters.father_name.toLowerCase()) &&
    student.mother_name.toLowerCase().includes(filters.mother_name.toLowerCase()) &&
    student.contact_number.toLowerCase().includes(filters.contact_number.toLowerCase()) &&
    student.status.toLowerCase().includes(filters.status.toLowerCase())
  );

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

  if (!classInfo) {
    return (
      <Typography variant="h6" color="error">
        Class not found
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton component={Link} to="/classes" sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {classInfo.name} - Students
        </Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/students/create"
        >
          Add New Student
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table
          sx={{
            borderCollapse: 'collapse',
            '& .MuiTableCell-root': {
              paddingTop: '4px',
              paddingBottom: '4px',
            },
            '& .MuiTableRow-root': {
              height: 'auto',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Sr. No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Photo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Father's Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mother's Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Admit Card</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.id}
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.father_name}
                  onChange={(e) => handleFilterChange('father_name', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.mother_name}
                  onChange={(e) => handleFilterChange('mother_name', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.contact_number}
                  onChange={(e) => handleFilterChange('contact_number', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  variant="standard"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  placeholder="Filter"
                  sx={{ width: '90%' }}
                />
              </TableCell>
              <TableCell /> {/* Empty for admit card filter */}
              <TableCell /> {/* Empty for actions */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow key={student.id}>
                <TableCell>{index + 1}</TableCell>
           <TableCell>
  <img
    src={student.image_url}
    alt={student.name}
    style={{
      width: '48px',
      height: '48px',
      objectFit: 'cover',
      borderRadius: '50%'
    }}
  />
</TableCell>

                <TableCell>{student.name}</TableCell>
                <TableCell>{student.father_name}</TableCell>
                <TableCell>{student.mother_name}</TableCell>
                <TableCell>{student.contact_number}</TableCell>
                <TableCell>
                  {student.status === 'active' ? (
                    <Typography color="success.main">Active</Typography>
                  ) : (
                    <Typography color="error">Inactive</Typography>
                  )}
                </TableCell>
                <TableCell>
                 
                  <AdmitCardButton student={student} classInfo={classInfo} />
                </TableCell>
                 <TableCell>
                 
                  <ResultCardButton student={student} classInfo={classInfo} />
                </TableCell>
                <TableCell sx={{ display: 'flex', gap: '10px' }}>
                  <IconButton
                    component={Link}
                    to={`/students/${student.id}`}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/students/${student.id}/edit`}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                   onClick={() => {
  setSelectedStudentId(student.id);
  setOpenConfirmDialog(true);
}}

                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
                <Dialog
  open={openConfirmDialog}
  onClose={() => setOpenConfirmDialog(false)}
>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this student record?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmDialog(false)} autoFocus>
      No
    </Button>
    <Button
      onClick={async () => {
        await handleDelete(selectedStudentId);
        setOpenConfirmDialog(false);
      }}
      color="error"
    >
      Yes
    </Button>
  </DialogActions>
</Dialog>

              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No matching records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClassStudentsPage;