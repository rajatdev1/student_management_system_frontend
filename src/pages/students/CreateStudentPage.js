import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateStudentPage = () => {
  const [classes, setClasses] = useState([]);
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
        const classesResponse = await api.get('/classes');
        if (classesResponse.data.length === 0) {
          await api.post('/classes/initialize');
          const newClassesResponse = await api.get('/classes');
          setClasses(newClassesResponse.data);
        } else {
          setClasses(classesResponse.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
  try {
    const formData = new FormData();
    
    // Append all form values
    Object.keys(values).forEach(key => {
      if (key !== 'is_active') {
        formData.append(key, values[key]);
      }
    });
    
    // Fix: Ensure proper boolean conversion for status
    formData.append('status', values.is_active === true || values.is_active === 'true' ? 'active' : 'inactive');
    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    const response = await api.post('/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    setSuccessMessage('Student created successfully!');
    setOpenSnackbar(true);
    resetForm();
    setSelectedImage(null);
    setImagePreview(null);
    
    setTimeout(() => {
      navigate(`/classes/${values.class_id}/students`);
    }, 1500);
  } catch (err) {
    console.error('Error creating student:', err);
    setError(err.response?.data?.error || 'Failed to create student');
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

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          Add New Student
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <Formik
          initialValues={{
            name: '',
            class_id: '',
            father_name: '',
            mother_name: '',
            father_occupation: '',
            father_education: '',
            mother_occupation: '',
            mother_education: '',
            father_aadhar: '',
            mother_aadhar: '',
            address: '',
            contact_number: '',
            is_active: true
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
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
                <Grid item xs={8}>
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
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
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

export default CreateStudentPage;