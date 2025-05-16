import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postApi, commentApi } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import NotFoundPage from './NotFoundPage';
import { getFullImageUrl } from '../utils/imageUtils';

// Modern UI Components
import {
  Container, Typography, Box, Paper, Divider, CircularProgress,
  TextField, Button, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Snackbar, Alert, Card, Chip,
  Tooltip, Fade, Backdrop, alpha
} from '@mui/material';

// Icons
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ChatBubbleOutline as CommentIcon
} from '@mui/icons-material';

export default function PostPage() {
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCommentText, setEditCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { postId } = useParams();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check if comments section should be focused
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('focus') === 'comments') {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const { data: postData, isLoading: postLoading, error: postError } = useQuery(
    ['post', postId],
    () => postApi.getPost(postId),
    {
      staleTime: 60000, // 1 minute
    }
  );

  const { data: commentsData, isLoading: commentsLoading } = useQuery(
    ['comments', postId],
    () => postApi.getComments(postId),
    {
      staleTime: 60000, // 1 minute
      onError: (error) => {
        console.error("Error fetching comments:", error);
        setErrorMessage("Failed to load comments. Please try again.");
        setShowError(true);
      }
    }
  );

  const addCommentMutation = useMutation(
    (commentData) => postApi.createComment(postId, commentData),
    {
      onSuccess: () => {
        setCommentText('');
        setReplyToId(null);
        setReplyToUser(null);
        queryClient.invalidateQueries(['comments', postId]);
        queryClient.invalidateQueries(['post', postId]);
        setSuccessMessage('Comment added successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error adding comment:", error);
        setErrorMessage("Failed to add comment. Please try again.");
        setShowError(true);
      }
    }
  );

  const deleteCommentMutation = useMutation(
    (commentId) => commentApi.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        queryClient.invalidateQueries(['post', postId]);
        setSelectedComment(null);
        setSuccessMessage('Comment deleted successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error deleting comment:", error);
        setErrorMessage("Failed to delete comment. Please try again.");
        setShowError(true);
      }
    }
  );

  const updateCommentMutation = useMutation(
    ({ commentId, content }) => commentApi.updateComment(commentId, { content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', postId]);
        setEditMode(false);
        setSelectedComment(null);
        setSuccessMessage('Comment updated successfully!');
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Error updating comment:", error);
        setErrorMessage("Failed to update comment. Please try again.");
        setShowError(true);
      }
    }
  );

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate({ content: commentText.trim() });
    }
  };

  const handleReplyClick = (commentId, username) => {
    setReplyToId(commentId);
    setReplyToUser(username);
    // Focus the comment input
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.focus();
    }
  };

  const cancelReply = () => {
    setReplyToId(null);
    setReplyToUser(null);
  };

  const handleEditComment = (comment) => {
    setEditMode(true);
    setSelectedComment(comment);
    setEditCommentText(comment.content);
  };

  const handleDeleteComment = (comment) => {
    setSelectedComment(comment);
    deleteCommentMutation.mutate(comment.id);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditCommentText('');
    setSelectedComment(null);
  };

  const handleEditSubmit = () => {
    if (editCommentText.trim() && editCommentText !== selectedComment.content) {
      updateCommentMutation.mutate({
        commentId: selectedComment.id,
        content: editCommentText.trim()
      });
    } else if (editCommentText === selectedComment.content) {
      setEditMode(false);
      setSelectedComment(null);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  if (postError && postError.response?.status === 404) {
    return <NotFoundPage message="The post you're looking for doesn't exist." />;
  }

  if (postLoading) {
    return (
      <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  const post = postData?.data;
  
  // Extract comments from the response data
  const comments = commentsData?.data?.content || (Array.isArray(commentsData?.data) ? commentsData.data : []);
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Post */}
      {post && <PostCard post={post} />}

      {/* Comments Section */}
      <Card 
        elevation={2} 
        sx={{ 
          mt: 4, 
          borderRadius: 2, 
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }} 
        id="comments-section"
      >
        <Box sx={{ 
          p: 3, 
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CommentIcon color="primary" />
          <Typography variant="h6" fontWeight="500">
            Discussions ({post?.commentCount || 0})
          </Typography>
        </Box>

        {isAuthenticated ? (
          <Box 
            component="form" 
            onSubmit={handleCommentSubmit} 
            sx={{ 
              p: 3, 
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            {replyToUser && (
              <Chip
                label={`Replying to @${replyToUser}`}
                onDelete={cancelReply}
                deleteIcon={<CloseIcon />}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar 
                src={getFullImageUrl(currentUser.profilePicture) || '/default-avatar.png'}
                alt={currentUser?.name} 
                sx={{ 
                  width: 40, 
                  height: 40,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  id="comment-input"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={addCommentMutation.isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!commentText.trim() || addCommentMutation.isLoading}
                    endIcon={addCommentMutation.isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    sx={{ 
                      borderRadius: 6,
                      px: 3
                    }}
                  >
                    Post
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body1" gutterBottom>
              Sign in to join the discussion
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/login', { state: { from: location } })}
              sx={{ borderRadius: 6, px: 3, mt: 1 }}
            >
              Sign In
            </Button>
          </Box>
        )}

        {commentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No comments yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {comments.map((comment) => (
              <Fade in key={comment.id}>
                <Box>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      py: 2,
                      px: 3,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                    secondaryAction={
                      currentUser?.id === comment.userId && (
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              edge="end" 
                              color="primary"
                              onClick={() => handleEditComment(comment)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              edge="end" 
                              color="error"
                              onClick={() => handleDeleteComment(comment)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={getFullImageUrl(comment.userProfilePicture) || '/default-avatar.png'}
                        alt={comment.userName} 
                        onClick={() => navigate(`/profile/${comment.userId}`)}
                        sx={{ 
                          cursor: 'pointer', 
                          width: 44, 
                          height: 44,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography
                            variant="subtitle1"
                            component="span"
                            sx={{ 
                              cursor: 'pointer',
                              fontWeight: 500,
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                            onClick={() => navigate(`/profile/${comment.userId}`)}
                          >
                            {comment.userName || "Unknown User"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {comment.username ? `@${comment.username}` : ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            component="span"
                            sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        editMode && selectedComment?.id === comment.id ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              disabled={updateCommentMutation.isLoading}
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                              <Button 
                                size="small" 
                                onClick={handleEditCancel}
                                sx={{ borderRadius: 6 }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained" 
                                onClick={handleEditSubmit}
                                disabled={!editCommentText.trim() || updateCommentMutation.isLoading}
                                sx={{ borderRadius: 6 }}
                              >
                                {updateCommentMutation.isLoading ? <CircularProgress size={16} /> : "Save"}
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Typography
                              variant="body1"
                              component="div"
                              color="text.primary"
                              sx={{ 
                                mt: 1, 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.5
                              }}
                            >
                              {comment.content}
                            </Typography>
                            {isAuthenticated && (
                              <Button
                                size="small"
                                startIcon={<ReplyIcon fontSize="small" />}
                                onClick={() => handleReplyClick(comment.id, comment.username || comment.userName)}
                                sx={{ 
                                  mt: 1,
                                  borderRadius: 6,
                                  fontSize: '0.75rem',
                                  textTransform: 'none'
                                }}
                              >
                                Reply
                              </Button>
                            )}
                          </Box>
                        )
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              </Fade>
            ))}
          </List>
        )}
      </Card>

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%', 
            boxShadow: 4,
            borderRadius: 2
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ 
            width: '100%',
            boxShadow: 4,
            borderRadius: 2
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}