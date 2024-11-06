const Post = require('../model/post');

// Set this flag to true to enable verbose logging
const VERBOSE_LOGGING = true;

// Utility function for logging
const log = (message) => {
  if (VERBOSE_LOGGING) {
    console.log(`[CommentController] ${message}`);
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { message, rating } = req.body;
    const author = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = { message, rating, author };
    post.comments.push(newComment);
    await post.save();

    log(`Comment added to post ${postId} by user ${author}`);
    res.status(201).json(post);
  } catch (err) {
    log(`Error adding comment: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const updates = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      log(`Comment not found with ID: ${commentId} in post ${postId}`);
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['message', 'rating'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        comment[key] = updates[key];
      }
    });

    await post.save();
    log(`Comment ${commentId} in post ${postId} updated.`);
    res.json(comment);
  } catch (err) {
    log(`Error editing comment: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Archive a comment
exports.archiveComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      log(`Comment not found with ID: ${commentId} in post ${postId}`);
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!comment.active) {
      log(`Comment ${commentId} already archived in post ${postId}`);
      return res.status(400).json({ error: 'Comment is already archived' });
    }

    comment.active = false;
    await post.save();

    log(`Comment ${commentId} in post ${postId} archived.`);
    res.json({ message: 'Comment archived successfully' });
  } catch (err) {
    log(`Error archiving comment: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Get all comments for a post
exports.getAllComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('comments.author', 'username')
      .populate('author', 'username');

    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    log(`Retrieved ${post.comments.length} comments for post ${postId}`);
    res.json(post.comments);
  } catch (err) {
    log(`Error retrieving comments: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Get active comments for a post
exports.getActiveComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate('comments.author', 'username')
      .populate('author', 'username');

    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const activeComments = post.comments.filter(comment => comment.active);
    log(`Retrieved ${activeComments.length} active comments for post ${postId}`);
    res.json(activeComments);
  } catch (err) {
    log(`Error retrieving active comments: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Upvote a comment
exports.upvoteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      log(`Comment not found with ID: ${commentId} in post ${postId}`);
      return res.status(404).json({ error: 'Comment not found' });
    }

    const existingVote = comment.voters.find(v => v.user.toString() === userId);

    if (existingVote) {
      if (existingVote.vote === 'upvote') {
        log(`User ${userId} already upvoted comment ${commentId} in post ${postId}`);
        return res.status(400).json({ error: 'You have already upvoted this comment' });
      } else {
        // Change downvote to upvote
        existingVote.vote = 'upvote';
        comment.downvotes -= 1;
        comment.upvotes += 1;
        log(`User ${userId} changed vote to upvote on comment ${commentId} in post ${postId}`);
      }
    } else {
      // Add new upvote
      comment.voters.push({ user: userId, vote: 'upvote' });
      comment.upvotes += 1;
      log(`User ${userId} upvoted comment ${commentId} in post ${postId}`);
    }

    await post.save();
    res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
  } catch (err) {
    log(`Error upvoting comment: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Downvote a comment
exports.downvoteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      log(`Comment not found with ID: ${commentId} in post ${postId}`);
      return res.status(404).json({ error: 'Comment not found' });
    }

    const existingVote = comment.voters.find(v => v.user.toString() === userId);

    if (existingVote) {
      if (existingVote.vote === 'downvote') {
        log(`User ${userId} already downvoted comment ${commentId} in post ${postId}`);
        return res.status(400).json({ error: 'You have already downvoted this comment' });
      } else {
        // Change upvote to downvote
        existingVote.vote = 'downvote';
        comment.upvotes -= 1;
        comment.downvotes += 1;
        log(`User ${userId} changed vote to downvote on comment ${commentId} in post ${postId}`);
      }
    } else {
      // Add new downvote
      comment.voters.push({ user: userId, vote: 'downvote' });
      comment.downvotes += 1;
      log(`User ${userId} downvoted comment ${commentId} in post ${postId}`);
    }

    await post.save();
    res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
  } catch (err) {
    log(`Error downvoting comment: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
