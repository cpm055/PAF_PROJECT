import { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Explore as ExploreIcon,
  Person as PersonIcon,
  BookmarkBorder as BookmarkIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { notificationApi } from '../services/api';
import { useQuery } from 'react-query';
import { getFullImageUrl } from '../utils/imageUtils';

export default function Header() {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: unreadCount } = useQuery(
    ['unreadNotifications'],
    () => notificationApi.getUnreadCount(),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000,
    }
  );

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    setMobileOpen(false);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Explore Skills', icon: <ExploreIcon />, path: '/explore' },
    { text: 'Learning Plans', icon: <BookmarkIcon />, path: '/learning-plans' },
    { text: 'Profile', icon: <PersonIcon />, path: currentUser ? `/profile/${currentUser.id}` : '/' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      {isAuthenticated && currentUser && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={currentUser.profilePicture}
            alt={currentUser.name}
            sx={{ width: 64, height: 64, mb: 1 }}
          />
          <Typography variant="subtitle1">{currentUser.name}</Typography>
          <Typography variant="body2" color="text.secondary">{currentUser.email}</Typography>
        </Box>
      )}
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem button key={item.text} onClick={() => handleNavigate(item.path)}>
            <ListItemIcon sx={{ color: '#00fffb' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon sx={{ color: '#00fffb' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#ffbb00' }}>
        <Toolbar>
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'black',
              fontWeight: 'bold',
            }}
          >
            SkillShare
          </Typography>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <Box sx={{ display: 'flex' }}>
                  {drawerItems.map((item) => (
                    <Button
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      sx={{
                        color: 'black',
                        mx: 0.5,
                        '&:hover': {
                          backgroundColor: '#00fffb',
                          color: 'black',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}

              <IconButton
                color="inherit"
                onClick={() => navigate('/notifications')}
                sx={{ ml: 1 }}
              >
                <Badge
                  badgeContent={unreadCount?.data || 0}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#00fffb',
                      color: 'black',
                    },
                  }}
                >
                  <NotificationsIcon sx={{ color: 'black' }} />
                </Badge>
              </IconButton>

              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={getFullImageUrl(currentUser.profilePicture) || '/default-avatar.png'}
                  alt={currentUser?.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate(`/profile/${currentUser.id}`); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile/edit'); }}>
                  Edit Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#00fffb',
                  }
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                sx={{
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#00fffb',
                  }
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
