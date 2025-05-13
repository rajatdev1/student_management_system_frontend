import { Box, Container, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CssBaseline />
      <Container maxWidth="xs">
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;