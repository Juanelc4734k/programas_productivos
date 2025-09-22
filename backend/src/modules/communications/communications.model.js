import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }]
}, { timestamps: true });

directMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    // For nested comments/replies
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const forumCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin or Funcionario
        required: true,
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

forumCategorySchema.index({ name: 'text' });

const forumPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumCategory',
        required: true,
    },
    comments: [commentSchema], // Embedded comments
    tags: [String],
    views: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false }, // No new comments allowed
    lastReplyAt: { type: Date, default: Date.now }
}, { timestamps: true });

forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
forumPostSchema.index({ category: 1, lastReplyAt: -1 });

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: { // Funcionario or Admin
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetAudience: {
        type: String,
        enum: ['all', 'campesinos', 'funcionarios', 'specific_group'], // Add more if needed
        default: 'all',
    },
    // For 'specific_group', you might link to a Group model or list User IDs
    // specificGroupRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }],
    publishDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

AnnouncementSchema.index({ title: 'text', targetAudience: 1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
export const Comment = mongoose.model('Comment', commentSchema); // Export if used independently
export const ForumCategory = mongoose.model('ForumCategory', forumCategorySchema);
export const ForumPost = mongoose.model('ForumPost', forumPostSchema);
export const Announcement = mongoose.model('Announcement', AnnouncementSchema);