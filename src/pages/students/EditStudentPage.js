import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  Avatar
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Student name is required'),
  class_id: Yup.number().required('Class is required'),
  father_name: Yup.string().required("Father's name is required"),
  mother_name: Yup.string().required("Mother's name is required"),
  father_occupation: Yup.string(),
  father_education: Yup.string(),
  mother_occupation: Yup.string(),
  mother_education: Yup.string(),
  father_aadhar: Yup.string().matches(/^\d{12}$/, 'Aadhar must be 12 digits'),
  mother_aadhar: Yup.string().matches(/^\d{12}$/, 'Aadhar must be 12 digits'),
  address: Yup.string(),
  contact_number: Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits')
});

const EditStudentPage = () => {
  const { id } = useParams();
  const [classes, setClasses] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

 useEffect(() => {
  const fetchData = async () => {
    try {
      const [studentResponse, classesResponse] = await Promise.all([
        api.get(`/students/${id}`),
        api.get('/classes')
      ]);
      
      setStudent(studentResponse.data);
      setClasses(classesResponse.data);
      
      // Fix image preview URL
      if (studentResponse.data.image_filename) {
        setImagePreview(`http://localhost:3008/uploads/students/${studentResponse.data.image_filename}`);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch student data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const formData = new FormData();
    
    // Append all form values
    Object.keys(values).forEach(key => {
      if (key !== 'is_active') {
        formData.append(key, values[key]);
      }
    });
    
    // Ensure proper status conversion
    formData.append('status', values.is_active ? 'active' : 'inactive');
    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    const response = await api.put(`/students/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    setSuccessMessage('Student updated successfully!');
    setOpenSnackbar(true);
    
    setTimeout(() => {
      navigate(`/classes/${values.class_id}/students`);
    }, 1500);
  } catch (err) {
    console.error('Error updating student:', err);
    setError(err.response?.data?.error || 'Failed to update student');
    setOpenSnackbar(true);
  } finally {
    setSubmitting(false);
  }
};

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !student) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          Edit Student
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        {student && (
          <Formik
            initialValues={{
              name: student.name,
              class_id: student.class_id,
              father_name: student.father_name,
              mother_name: student.mother_name,
              father_occupation: student.father_occupation || '',
              father_education: student.father_education || '',
              mother_occupation: student.mother_occupation || '',
              mother_education: student.mother_education || '',
              father_aadhar: student.father_aadhar || '',
              mother_aadhar: student.mother_aadhar || '',
              address: student.address || '',
              contact_number: student.contact_number || '',
              is_active: student.status === 'active'
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Image Upload Section */}
                 <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 2 }}>
                      <Avatar
                        src={imagePreview}
                        sx={{ 
                          width: 150, 
                          height: 150,
                          mb: 2
                        }}
                      />
                      
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="student-image-upload"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      <label htmlFor="student-image-upload">
                        <Button 
                          variant="contained" 
                          component="span"
                          startIcon={<CloudUploadIcon />}
                        >
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </Button>
                      </label>
                      
                      {selectedImage && (
                        <Typography variant="body2">
                          {selectedImage.name}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Status Checkbox */}
                    <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.is_active}
                          onChange={(e) => setFieldValue('is_active', e.target.checked)}
                          name="is_active"
                          color="primary"
                        />
                      }
                      label="Active Student"
                    />
                  </Grid>

                  {/* Rest of the form fields */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Student Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                 <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.class_id && Boolean(errors.class_id)}>
                      <InputLabel>Class</InputLabel>
                      <Select
                        name="class_id"
                        value={values.class_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Class"
                      >
                        {classes.map((classItem) => (
                          <MenuItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.class_id && errors.class_id && (
                        <Typography variant="caption" color="error">
                          {errors.class_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    name="father_name"
                    value={values.father_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.father_name && Boolean(errors.father_name)}
                    helperText={touched.father_name && errors.father_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    name="mother_name"
                    value={values.mother_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.mother_name && Boolean(errors.mother_name)}
                    helperText={touched.mother_name && errors.mother_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Father's Occupation"
                    name="father_occupation"
                    value={values.father_occupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Father's Education"
                    name="father_education"
                    value={values.father_education}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Occupation"
                    name="mother_occupation"
                    value={values.mother_occupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Education"
                    name="mother_education"
                    value={values.mother_education}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Father's Aadhar"
                    name="father_aadhar"
                    value={values.father_aadhar}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.father_aadhar && Boolean(errors.father_aadhar)}
                    helperText={touched.father_aadhar && errors.father_aadhar}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Aadhar"
                    name="mother_aadhar"
                    value={values.mother_aadhar}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.mother_aadhar && Boolean(errors.mother_aadhar)}
                    helperText={touched.mother_aadhar && errors.mother_aadhar}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contact_number"
                    value={values.contact_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contact_number && Boolean(errors.contact_number)}
                    helperText={touched.contact_number && errors.contact_number}
                  />
                 </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Student'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        )}
      </Box>

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
    </Container>
  );
};

export default EditStudentPage;