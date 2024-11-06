const Post = require('../model/post');

// Set this flag to true to enable verbose logging
const VERBOSE_LOGGING = true;

// Utility function for logging
const log = (message) => {
  if (VERBOSE_LOGGING) {
    console.log(`[PostController] ${message}`);
  }
};

// Add a new post
exports.addPost = async (req, res) => {
  try {
    const { title, message, category, tags } = req.body;
    const author = req.user.userId; // Assuming auth middleware sets req.user.id

    const newPost = new Post({ title, message, category, tags, author });
    const savedPost = await newPost.save();

    log(`Post created with ID: ${savedPost._id}`);
    res.status(201).json(savedPost);
  } catch (err) {
    log(`Error adding post: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username') // Adjust fields as necessary
      .populate('comments.author', 'username')
      .sort({ createdAt: -1 });

    log(`Retrieved ${posts.length} posts.`);
    res.json(posts);
  } catch (err) {
    log(`Error retrieving all posts: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Get active posts
exports.getActivePosts = async (req, res) => {
  try {
    const posts = await Post.find({ active: true })
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .sort({ createdAt: -1 });

    log(`Retrieved ${posts.length} active posts.`);
    res.json(posts);
  } catch (err) {
    log(`Error retrieving active posts: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Edit a post
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const updates = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['title', 'message', 'category', 'tags'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        post[key] = updates[key];
      }
    });

    const updatedPost = await post.save();
    log(`Post updated with ID: ${updatedPost._id}`);
    res.json(updatedPost);
  } catch (err) {
    log(`Error editing post: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Archive a post
exports.archivePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.active) {
      log(`Post already archived with ID: ${postId}`);
      return res.status(400).json({ error: 'Post is already archived' });
    }

    post.active = false;
    await post.save();

    log(`Post archived with ID: ${postId}`);
    res.json({ message: 'Post archived successfully' });
  } catch (err) {
    log(`Error archiving post: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Upvote a post
exports.upvotePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingVote = post.voters.find(v => v.user.toString() === userId);

    if (existingVote) {
      if (existingVote.vote === 'upvote') {
        log(`User ${userId} already upvoted post ${postId}`);
        return res.status(400).json({ error: 'You have already upvoted this post' });
      } else {
        // Change downvote to upvote
        existingVote.vote = 'upvote';
        post.downvotes -= 1;
        post.upvotes += 1;
        log(`User ${userId} changed vote to upvote on post ${postId}`);
      }
    } else {
      // Add new upvote
      post.voters.push({ user: userId, vote: 'upvote' });
      post.upvotes += 1;
      log(`User ${userId} upvoted post ${postId}`);
    }

    await post.save();
    res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    log(`Error upvoting post: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Downvote a post
exports.downvotePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      log(`Post not found with ID: ${postId}`);
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingVote = post.voters.find(v => v.user.toString() === userId);

    if (existingVote) {
      if (existingVote.vote === 'downvote') {
        log(`User ${userId} already downvoted post ${postId}`);
        return res.status(400).json({ error: 'You have already downvoted this post' });
      } else {
        // Change upvote to downvote
        existingVote.vote = 'downvote';
        post.upvotes -= 1;
        post.downvotes += 1;
        log(`User ${userId} changed vote to downvote on post ${postId}`);
      }
    } else {
      // Add new downvote
      post.voters.push({ user: userId, vote: 'downvote' });
      post.downvotes += 1;
      log(`User ${userId} downvoted post ${postId}`);
    }

    await post.save();
    res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    log(`Error downvoting post: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
