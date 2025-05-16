import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Button, Avatar, Paper,
  Tabs, Tab, Divider, CircularProgress, Chip, IconButton, 
  Snackbar, Alert, Fab, Card, CardContent, CardHeader, Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PersonAdd as FollowIcon,
  Check as FollowingIcon,
  PostAdd as PostAddIcon,
  PlaylistAdd as PlanAddIcon,
  BookmarkAdd as ProgressAddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { styled } from '@mui/material/styles';
import { userApi, postApi, learningPlanApi, learningProgressApi } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import LearningPlanCard from '../components/LearningPlanCard';
import LearningProgressCard from '../components/LearningProgressCard';
import FollowDialog from '../components/FollowDialog';
import CreatePostDialog from '../components/CreatePostDialog';
import CreateProgressDialog from '../components/CreateProgressDialog';
import { getFullImageUrl } from '../utils/imageUtils';

// Modern styled components
const ProfileHeader = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[3],
}));

const CoverPhoto = styled(Box)(({ theme }) => ({
  height: 240,
  backgroundColor: theme.palette.primary.light,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  [theme.breakpoints.down('sm')]: {
    height: 180,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid white',
  position: 'absolute',
  top: -60,
  left: 24,
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('sm')]: {
    width: 90,
    height: 90,
    top: -45,
    left: 16,
  },
}));

const StatButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.grey[200],
  borderRadius: 8,
  height: 8,
  overflow: 'hidden',
}));

const ProgressFill = styled(Box)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  borderRadius: 8,
}));

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState('followers');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [createProgressDialogOpen, setCreateProgressDialogOpen] = useState(false);
  const [progressToEdit, setProgressToEdit] = useState(null);
  
  const { userId } = useParams();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOwnProfile = currentUser?.id === userId;

  // Fetch user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery(
    ['user', userId],
    () => isOwnProfile ? userApi.getUser() : userApi.getUserById(userId),
    {
      enabled: !!userId,
      staleTime: 60000,
      onError: (error) => {
        console.error("Error fetching user:", error);
        setErrorMessage("Failed to load user profile. Please try again.");
        setShowError(true);
      }
    }
  );

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery(
    ['userPosts', userId],
    () => postApi.getUserPosts(userId),
    {
      enabled: !!userId && tabValue === 0,
      staleTime: 60000,
    }
  );

  // Fetch user learning plans
  const { data: learningPlansData, isLoading: plansLoading } = useQuery(
    ['userLearningPlans', userId],
    () => learningPlanApi.getUserPlans(userId),
    {
      enabled: !!userId && tabValue === 1,
      staleTime: 60000,
    }
  );
  
  // Fetch user learning progress
  const { data: progressData, isLoading: progressLoading } = useQuery(
    ['userProgress', userId],
    () => learningProgressApi.getUserProgress(userId),
    {
      enabled: !!userId && tabValue === 2,
      staleTime: 60000,
    }
  );

  // Mutations
  const followMutation = useMutation(
    () => userApi.followUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
      onError: (error) => {
        console.error("Error following user:", error);
        setErrorMessage("Failed to follow user. Please try again.");
        setShowError(true);
      }
    }
  );

  const unfollowMutation = useMutation(
    () => userApi.unfollowUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
      onError: (error) => {
        console.error("Error unfollowing user:", error);
        setErrorMessage("Failed to unfollow user. Please try again.");
        setShowError(true);
      }
    }
  );
  
  const deleteProgressMutation = useMutation(
    (progressId) => learningProgressApi.deleteProgress(progressId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userProgress', userId]);
        setErrorMessage("Learning progress deleted successfully.");
        setShowError(true);
      },
      onError: (error) => {
        console.error("Error deleting progress:", error);
        setErrorMessage("Failed to delete learning progress. Please try again.");
        setShowError(true);
      }
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollowToggle = () => {
    if (user?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleFollowersClick = () => {
    setFollowDialogType('followers');
    setFollowDialogOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowDialogType('following');
    setFollowDialogOpen(true);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCreatePost = () => {
    setCreatePostDialogOpen(true);
  };

  const handleCreateLearningPlan = () => {
    navigate('/learning-plans/create');
  };
  
  const handleCreateProgress = () => {
    setProgressToEdit(null);
    setCreateProgressDialogOpen(true);
  };
  
  const handleEditProgress = (progress) => {
    setProgressToEdit(progress);
    setCreateProgressDialogOpen(true);
  };
  
  const handleDeleteProgress = (progressId) => {
    if (window.confirm('Are you sure you want to delete this learning progress?')) {
      deleteProgressMutation.mutate(progressId);
    }
  };

  // Extract data
  const user = userData?.data?.data || userData?.data || userData;
  const isFollowing = user?.isFollowing || false;  
  const posts = postsData?.data?.content || postsData?.data || [];
  const learningPlans = learningPlansData?.data?.content || learningPlansData?.content || [];
  const learningProgress = progressData?.data?.content || progressData?.data || [];

  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (userError || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          User not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Modern Profile Header */}
      <ProfileHeader>
        <CoverPhoto sx={{
          backgroundImage: user.coverPicture ? `url(${getFullImageUrl(user.coverPicture)})` : 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }} />
        
        <Box sx={{ p: 3, position: 'relative' }}>
          <ProfileAvatar
            src={getFullImageUrl(user.profilePicture)}
            alt={user.name}
          />

          {/* Profile Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate('/edit-profile')}
                sx={{ borderRadius: 2 }}
              >
                Edit Profile
              </Button>
            ) : isAuthenticated && (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={isFollowing ? <FollowingIcon /> : <FollowIcon />}
                onClick={handleFollowToggle}
                disabled={followMutation.isLoading || unfollowMutation.isLoading}
                sx={{ borderRadius: 2 }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{user.username}
            </Typography>
            
            {user.bio && (
              <Typography variant="body1" paragraph sx={{ maxWidth: '80ch', my: 2 }}>
                {user.bio}
              </Typography>
            )}

            {/* Stats */}
            <Stack direction="row" spacing={2} sx={{ my: 2 }}>
              <StatButton onClick={handleFollowersClick}>
                <Typography variant="h6" component="span" fontWeight="bold">
                  {user.followers?.length || user.followerCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  Followers
                </Typography>
              </StatButton>
              
              <StatButton onClick={handleFollowingClick}>
                <Typography variant="h6" component="span" fontWeight="bold">
                  {user.following?.length || user.followingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  Following
                </Typography>
              </StatButton>
            </Stack>

            {/* Skills */}
            {user.skills?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Skills & Expertise
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {user.skills.map((skill) => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      size="small"
                      onClick={() => navigate(`/explore?skill=${encodeURIComponent(skill)}`)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </ProfileHeader>

      {/* Modern Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 3,
              },
            }}
          >
            <Tab label="Posts" />
            <Tab label="Learning Plans" />
            <Tab label="Progress" />
          </Tabs>
          
          {/* Add buttons for creating content */}
          {isOwnProfile && (
            <Box sx={{ pr: 2 }}>
              {tabValue === 0 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PostAddIcon />}
                  onClick={handleCreatePost}
                  size="small"
                  sx={{ my: 1, borderRadius: 2 }}
                >
                  New Post
                </Button>
              ) : tabValue === 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlanAddIcon />}
                  onClick={handleCreateLearningPlan}
                  size="small"
                  sx={{ my: 1, borderRadius: 2 }}
                >
                  New Plan
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ProgressAddIcon />}
                  onClick={handleCreateProgress}
                  size="small"
                  sx={{ my: 1, borderRadius: 2 }}
                >
                  Track Progress
                </Button>
              )}
            </Box>
          )}
        </Box>
        <Divider />
      </Box>

      {/* Tab Content */}
      {tabValue === 0 ? (
        /* Posts */
        postsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
              No posts yet
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreatePost}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Create your first post
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
        )
      ) : tabValue === 1 ? (
        /* Learning Plans */
        plansLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : learningPlans.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
              No learning plans yet
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateLearningPlan}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Create a learning plan
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={3}>
            {Array.isArray(learningPlans) ? learningPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan.id}>
                <LearningPlanCard 
                  learningPlan={plan} 
                  isOwner={isOwnProfile}
                />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="body1" color="error">
                    Error loading learning plans
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        )
      ) : (
        /* Learning Progress */
        progressLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : learningProgress.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
              No learning progress tracked yet
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateProgress}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Track your learning progress
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={3}>
            {Array.isArray(learningProgress) ? learningProgress.map((progress) => (
              <Grid item xs={12} md={6} lg={4} key={progress.id}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    action={isOwnProfile && (
                      <IconButton aria-label="settings">
                        <MoreIcon />
                      </IconButton>
                    )}
                    title={
                      <Typography variant="h6" sx={{ pr: 6 }}>
                        {progress.title}
                      </Typography>
                    }
                    subheader={
                      <Typography color="text.secondary" variant="body2">
                        {progress.type} • {progress.startDate && new Date(progress.startDate).toLocaleDateString()}
                        {progress.completionDate && ` → ${new Date(progress.completionDate).toLocaleDateString()}`}
                      </Typography>
                    }
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    {progress.description && (
                      <Typography variant="body2" paragraph>
                        {progress.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2">Completion</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progress.completionPercentage || 0}%
                        </Typography>
                      </Box>
                      <ProgressBar>
                        <ProgressFill sx={{ width: `${progress.completionPercentage || 0}%` }} />
                      </ProgressBar>
                    </Box>
                    
                    {progress.skills?.length > 0 && (
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Skills Gained
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                          {progress.skills.map(skill => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/explore?skill=${encodeURIComponent(skill)}`)}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                  
                  {progress.resourceUrl && (
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Button 
                        variant="text" 
                        size="small" 
                        href={progress.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<LinkIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        View Resource
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="body1" color="error">
                    Error loading learning progress
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        )
      )}

      {/* Floating Action Button for quick creation */}
      {isOwnProfile && (
        <Fab
          color="primary"
          aria-label={
            tabValue === 0 ? "add post" : 
            tabValue === 1 ? "add learning plan" :
            "track progress"
          }
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
          }}
          onClick={
            tabValue === 0 ? handleCreatePost : 
            tabValue === 1 ? handleCreateLearningPlan :
            handleCreateProgress
          }
        >
          <AddIcon />
        </Fab>
      )}

      {/* Followers/Following Dialog */}
      <FollowDialog
        open={followDialogOpen}
        onClose={() => setFollowDialogOpen(false)}
        userId={userId}
        type={followDialogType}
        username={user.username}
      />

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostDialogOpen}
        onClose={() => setCreatePostDialogOpen(false)}
      />
      
      {/* Create/Edit Progress Dialog */}
      {createProgressDialogOpen && (
        <CreateProgressDialog
          open={createProgressDialogOpen}
          onClose={() => {
            setCreateProgressDialogOpen(false);
            setProgressToEdit(null);
          }}
          progressToEdit={progressToEdit}
          userId={userId}
        />
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}