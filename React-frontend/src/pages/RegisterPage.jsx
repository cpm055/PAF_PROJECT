import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, TextField, Button,
  Link, Paper, Divider, InputAdornment, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const validationSchema = [
  // Step 1 validation
  Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  }),
  // Step 2 validation
  Yup.object({
    bio: Yup.string().max(250, 'Bio must be at most 250 characters'),
    skills: Yup.string(),
    interests: Yup.string(),
  }),
];

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      skills: '',
      interests: '',
    },
    validationSchema: validationSchema[activeStep],
    onSubmit: async (values) => {
      if (activeStep === 0) {
        // Move to next step
        setActiveStep(1);
      } else {
        // Final submission
        setIsLoading(true);
        
        try {
          const skillsArray = values.skills
            ? values.skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];
            
          const interestsArray = values.interests
            ? values.interests.split(',').map(s => s.trim()).filter(Boolean)
            : [];
          
          const result = await register(
            values.name,
            values.email,
            values.password,
            {
              bio: values.bio,
              skills: skillsArray,
              interests: interestsArray,
            }
          );
          
          if (result && result.success) {
            // Show success message with SweetAlert and auto-redirect after a delay
            Swal.fire({
              title: 'Registration Successful!',
              text: 'Your account has been created successfully. Redirecting to login...',
              icon: 'success',
              timer: 2000, // Auto close after 2 seconds
              timerProgressBar: true,
              showConfirmButton: false
            }).then(() => {
              navigate('/login');
            });
          } else {
            // Show error with SweetAlert
            Swal.fire({
              title: 'Registration Failed',
              text: result?.message || 'An error occurred during registration. Please try again.',
              icon: 'error',
              confirmButtonText: 'Try Again',
              confirmButtonColor: '#8e24aa'
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#8e24aa'
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
  });

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:4000/oauth2/authorize/${provider}?redirect_uri=${window.location.origin}/oauth2/redirect`;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              fullWidth
              id="bio"
              label="Bio (optional)"
              name="bio"
              multiline
              rows={3}
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="skills"
              label="Skills (comma separated, optional)"
              name="skills"
              placeholder="E.g. Programming, Design, Photography"
              value={formik.values.skills}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.skills && Boolean(formik.errors.skills)}
              helperText={formik.touched.skills && formik.errors.skills}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="interests"
              label="Interests (comma separated, optional)"
              name="interests"
              placeholder="E.g. Music, Cooking, Travel"
              value={formik.values.interests}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.interests && Boolean(formik.errors.interests)}
              helperText={formik.touched.interests && formik.errors.interests}
              sx={{ mb: 2 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 1, 
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 500, color: '#6a1b9a' }}>
              {activeStep === 0 ? 'Create an Account' : 'Personal Details'}
            </Typography>
            {activeStep === 0 && (
              <Typography variant="body2" color="text.secondary">
                Sign up to continue to your dashboard
              </Typography>
            )}
          </Box>

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            {renderStepContent()}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 2, 
                mb: 2,
                py: 1.5,
                backgroundColor: '#8e24aa',
                '&:hover': {
                  backgroundColor: '#6a1b9a',
                },
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {activeStep === 0 ? 'Sign Up' : 'Register'}
            </Button>
            
            {activeStep > 0 && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBack}
                sx={{ 
                  mb: 2,
                  py: 1.5,
                  color: '#8e24aa',
                  borderColor: '#8e24aa',
                  '&:hover': {
                    borderColor: '#6a1b9a',
                    backgroundColor: 'rgba(142, 36, 170, 0.04)'
                  },
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Back
              </Button>
            )}
          </Box>

          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  or continue with
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleOAuthLogin('google')}
                  sx={{ 
                    py: 1.2,
                    color: '#757575',
                    borderColor: '#e0e0e0',
                    '&:hover': {
                      borderColor: '#bdbdbd',
                      backgroundColor: 'rgba(0, 0, 0, 0.01)'
                    },
                    textTransform: 'none'
                  }}
                  startIcon={<img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" width="16" />}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleOAuthLogin('github')}
                  sx={{ 
                    py: 1.2,
                    backgroundColor: '#24292e',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1b1f23',
                    },
                    textTransform: 'none'
                  }}
                  startIcon={<img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="16" />}
                >
                  GitHub
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: '#8e24aa',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}