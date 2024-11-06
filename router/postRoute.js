const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
const commentController = require('../controller/commentController');
const auth = require('../middleware/auth');

// POST Routes

// Add a new post
router.post('/', auth.authenticate, postController.addPost);

// // Get all posts
router.get('/', postController.getAllPosts);

// // Get active posts
router.get('/active', postController.getActivePosts);

// // Edit a post
router.put('/:postId', auth.authenticate, postController.editPost);

// // Archive a post
router.patch('/:postId/archive', auth.authenticate, postController.archivePost);

// // Upvote a post
router.post('/:postId/upvote', auth.authenticate, postController.upvotePost);

// // Downvote a post
router.post('/:postId/downvote', auth.authenticate, postController.downvotePost);

// // COMMENT Routes (Nested)

// // Add a comment to a post
router.post('/:postId/comments', auth.authenticate, commentController.addComment);

// // Get all comments for a post
router.get('/:postId/comments', commentController.getAllComments);

// // Get active comments for a post
router.get('/:postId/comments/active', commentController.getActiveComments);

// // Edit a comment
router.put('/:postId/comments/:commentId', auth.authenticate, commentController.editComment);

// // Archive a comment
router.patch('/:postId/comments/:commentId/archive', auth.authenticate, commentController.archiveComment);

// // Upvote a comment
router.post('/:postId/comments/:commentId/upvote', auth.authenticate, commentController.upvoteComment);

// // Downvote a comment
router.post('/:postId/comments/:commentId/downvote', auth.authenticate, commentController.downvoteComment);

module.exports = router;
