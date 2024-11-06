// Define the Post Schema with Upvote, Downvote, and Timestamps
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Comment Schema with Upvote, Downvote, and Timestamps
const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId, // Reference to a User model
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voters: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }); // Enables createdAt and updatedAt


const PostSchema = new Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Technology', 'Health', 'Finance', 'Education', 'Entertainment', 'Other'], // Example categories
      default: 'Other',
      required: true
    },
    tags: [{
      type: String,
      trim: true,
      required: true
    }],
    author: {
      type: Schema.Types.ObjectId, // Reference to a User model
      ref: 'User',
      required: true
    },
    comments: [CommentSchema], // Array of comments
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // default: 0
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['upvote', 'downvote']
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  }, { timestamps: true }); // Enables createdAt and updatedAt
  
  // Create and export the Post model
  const Post = mongoose.model('Post', PostSchema);
  module.exports = Post;
  