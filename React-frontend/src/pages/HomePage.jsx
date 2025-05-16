import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Paper, 
  CircularProgress, TextField, Avatar, IconButton,
  Fade, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Explore as ExploreIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { AuthContext } from '../contexts/AuthContext';
import { postApi, userApi } from '../services/api';
import PostCard from '../components/PostCard';
import SuggestedUserCard from '../components/SuggestedUserCard';
import TrendingSkillsCard from '../components/TrendingSkillsCard';
import CreatePostDialog from '../components/CreatePostDialog';
import { getFullImageUrl } from '../utils/imageUtils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const { data: feedData, isLoading: feedLoading } = useQuery(
    ['feed', activeTab],
    () => activeTab === 0 
      ? postApi.getFeed() 
      : postApi.getExploreFeed(),
    {
      enabled: isAuthenticated,
      staleTime: 60000,
    }
  );

  const { data: suggestedUsersData } = useQuery(
    ['suggestedUsers'],
    () => userApi.getSuggestedUsers(),
    {
      enabled: isAuthenticated,
      staleTime: 300000,
    }
  );

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const posts = feedData?.data?.content || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Sidebar - Navigation */}
        <Grid item xs={12} md={2}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              position: 'sticky', 
              top: 20,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button 
                startIcon={<ExploreIcon />}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: activeTab === 0 ? 600 : 400,
                  color: activeTab === 0 ? 'primary.main' : 'text.primary',
                  backgroundColor: activeTab === 0 ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: activeTab === 0 ? 'action.selected' : 'action.hover'
                  }
                }}
                onClick={() => handleTabChange(0)}
              >
                Feed
              </Button>
              <Button 
                startIcon={<TrendingUpIcon />}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: activeTab === 1 ? 600 : 400,
                  color: activeTab === 1 ? 'primary.main' : 'text.primary',
                  backgroundColor: activeTab === 1 ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: activeTab === 1 ? 'action.selected' : 'action.hover'
                  }
                }}
                onClick={() => handleTabChange(1)}
              >
                Discover
              </Button>
              <Button 
                startIcon={<GroupIcon />}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 3,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => navigate('/explore')}
              >
                Network
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main content */}
        <Grid item xs={12} md={7}>
          {/* Search and Create Post */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar 
                src={getFullImageUrl(currentUser?.profilePicture) || '/default-avatar.png'}
                sx={{ width: 48, height: 48, cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${currentUser?.id}`)}
              />
              <TextField
                fullWidth
                placeholder="What's on your mind?"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: (theme) => 
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: '1px'
                      }
                    }
                  }
                }}
                onClick={() => setCreatePostOpen(true)}
              />
              <Tooltip title="Create post">
                <IconButton
                  color="primary"
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      backgroundColor: 'primary.dark',
                      transform: 'scale(1.05)' 
                    }
                  }}
                  onClick={() => setCreatePostOpen(true)}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Feed Content */}
          {feedLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : posts.length === 0 ? (
            <Fade in={true} timeout={500}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 5, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {activeTab === 0 ? "Your feed is empty" : "No posts to discover"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {activeTab === 0 
                      ? "Follow more people or create your first post to get started" 
                      : "Explore trending topics or try searching for something different"}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    disableElevation
                    sx={{ 
                      borderRadius: 3, 
                      px: 4, 
                      py: 1.5,
                      mt: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => activeTab === 0 ? setCreatePostOpen(true) : navigate('/explore')}
                  >
                    {activeTab === 0 ? "Create Post" : "Explore"}
                  </Button>
                </Box>
              </Paper>
            </Fade>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {posts.map((post, index) => (
                <Fade key={post.id} in={true} timeout={300 + index * 100}>
                  <Box>
                    <PostCard post={post} />
                  </Box>
                </Fade>
              ))}
            </Box>
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Search */}
            <Paper
              elevation={0}
              sx={{
                p: 0.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <TextField
                fullWidth
                placeholder="Search"
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  sx: {
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Paper>

            {/* Trending Skills */}
            <TrendingSkillsCard 
              sx={{ 
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)'
              }} 
            />

            {/* Suggested Users */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Suggested Connections
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Find more people">
                  <IconButton 
                    size="small" 
                    onClick={() => navigate('/explore')}
                    sx={{
                      color: 'primary.main',
                      backgroundColor: 'action.selected',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ExploreIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {suggestedUsersData?.data?.slice(0, 5).map((user, index) => (
                  <Fade key={user.id} in={true} timeout={300 + index * 100}>
                    <Box>
                      <SuggestedUserCard user={user} />
                    </Box>
                  </Fade>
                ))}
                {!suggestedUsersData?.data?.length && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No suggestions available
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Footer Links */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              justifyContent: 'center',
              pt: 2,
              opacity: 0.7
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                About
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Privacy
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Terms
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                Help
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <CreatePostDialog 
        open={createPostOpen} 
        onClose={() => setCreatePostOpen(false)} 
      />
    </Container>
  );
}