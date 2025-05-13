import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterFirstUser from './pages/auth/RegisterFirstUser';
import ClassesPage from './pages/classes/ClassesPage';
import ClassStudentsPage from './pages/students/ClassStudentsPage';
import CreateStudentPage from './pages/students/CreateStudentPage';
import EditStudentPage from './pages/students/EditStudentPage';
import StudentDetailsPage from './pages/students/StudentDetailsPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/setup" element={<RegisterFirstUser />} />
      {!user ? (
        <>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route index element={<Navigate to="login" />} />
          </Route>
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/:classId/students" element={<ClassStudentsPage />} />
            <Route path="students/create" element={<CreateStudentPage />} />
            <Route path="/students/:id/edit" element={<EditStudentPage />} />
            <Route path="students/:id" element={<StudentDetailsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;