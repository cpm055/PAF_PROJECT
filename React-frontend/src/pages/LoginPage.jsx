import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button,
  Link, Paper, Divider, CircularProgress,
  IconButton, InputAdornment
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';
import { AuthContext } from '../contexts/AuthContext';

// Custom Google Icon
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleOAuthLogin = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorize/${provider}?redirect_uri=${window.location.origin}/oauth2/redirect`;
  };

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6).required('Required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const result = await login(values.email, values.password);
        if (result?.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Login successful!',
            icon: 'success',
            confirmButtonColor: '#4caf50',
            timer: 1500,
            timerProgressBar: true,
            didClose: () => navigate('/')
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: result?.message || 'Login failed',
            icon: 'error',
            confirmButtonColor: '#ff5722'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'An unexpected error occurred',
          icon: 'error',
          confirmButtonColor: '#ff5722'
        });
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container
    maxWidth="sm"
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: `url('/e6272498-5b0f-4960-b3b2-fc5b97e0094a.png')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      py: 4,
    }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: '100%',
          background: 'linear-gradient(145deg, #ffffff, #f8f8ff)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#6a1b9a',
            fontWeight: 700,
            mb: 2,
            textAlign: 'center',
          }}
        >
          Welcome Back!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#555',
            mb: 3,
          }}
        >
          Sign in to continue to your dashboard
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ mb: 2 }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              sx={{
                color: '#6a1b9a',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline', color: '#8e24aa' },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 600,
              backgroundColor: '#6a1b9a',
              '&:hover': { backgroundColor: '#7b1fa2' },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Divider sx={{ my: 3 }}>or continue with</Divider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthLogin('google')}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderColor: '#dadce0',
                '&:hover': { backgroundColor: '#f1f3f4' },
              }}
            >
              Google
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={<GitHubIcon />}
              onClick={() => handleOAuthLogin('github')}
              sx={{
                py: 1.5,
                fontWeight: 600,
                backgroundColor: '#24292e',
                '&:hover': { backgroundColor: '#1b1f23' },
              }}
            >
              GitHub
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 3 }}>
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: '#1976d2',
                fontWeight: 600,
                '&:hover': { color: '#0d47a1' },
              }}
            >
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
