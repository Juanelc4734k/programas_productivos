import { DirectMessage, ForumCategory, ForumPost, Announcement, Comment } from './communications.model.js';
import User from '../user/user.model.js'; // Assuming user model path

// --- Direct Message Services ---
export const sendDirectMessage = async (senderId, receiverId, content, attachments) => {
    if (senderId === receiverId) {
        throw new Error('Sender and receiver cannot be the same.');
    }
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new Error('Receiver not found.');
    }
    const message = new DirectMessage({ sender: senderId, receiver: receiverId, content, attachments });
    await message.save();
    // TODO: Implement notifications for the receiver
    return message;
};

export const getConversation = async (userId1, userId2, page = 1, limit = 20) => {
    const messages = await DirectMessage.find({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 },
        ],
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender', 'name profilePicture') // Populate sender details
    .populate('receiver', 'name profilePicture'); // Populate receiver details
    return messages.reverse(); // Show oldest first for conversation flow
};

export const markMessageAsRead = async (messageId, userId) => {
    const message = await DirectMessage.findById(messageId);
    if (!message) throw new Error('Message not found.');
    if (message.receiver.toString() !== userId.toString()) {
        throw new Error('Unauthorized to mark this message as read.');
    }
    message.read = true;
    await message.save();
    return message;
};

export const getUnreadMessagesCount = async (userId) => {
    return DirectMessage.countDocuments({ receiver: userId, read: false });
};

// --- Forum Category Services ---
export const createForumCategory = async (name, description, createdBy) => {
    const category = new ForumCategory({ name, description, createdBy });
    await category.save();
    return category;
};

export const getAllForumCategories = async (activeOnly = true) => {
    const query = activeOnly ? { isActive: true } : {};
    return ForumCategory.find(query).populate('createdBy', 'name');
};

export const getForumCategoryById = async (categoryId) => {
    const category = await ForumCategory.findById(categoryId).populate('createdBy', 'name');
    if (!category) throw new Error('Forum category not found.');
    return category;
};

export const updateForumCategory = async (categoryId, updates, userId) => {
    // Add checks to ensure only authorized users (e.g., admin) can update
    const category = await ForumCategory.findByIdAndUpdate(categoryId, updates, { new: true });
    if (!category) throw new Error('Forum category not found.');
    return category;
};

// --- Forum Post Services ---
export const createForumPost = async (title, content, authorId, categoryId, tags) => {
    const category = await ForumCategory.findById(categoryId);
    if (!category || !category.isActive) {
        throw new Error('Forum category not found or is inactive.');
    }
    const post = new ForumPost({ title, content, author: authorId, category: categoryId, tags });
    await post.save();
    return post.populate('author', 'name profilePicture').populate('category', 'name');
};

export const getForumPostsByCategory = async (categoryId, page = 1, limit = 10, sortBy = 'lastReplyAt') => {
    const category = await ForumCategory.findById(categoryId);
    if (!category || !category.isActive) {
        throw new Error('Forum category not found or is inactive.');
    }
    return ForumPost.find({ category: categoryId })
        .sort({ [sortBy]: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name profilePicture')
        .populate('category', 'name');
};

export const getForumPostById = async (postId) => {
    const post = await ForumPost.findById(postId)
        .populate('author', 'name profilePicture')
        .populate('category', 'name')
        .populate('comments.user', 'name profilePicture'); // Populate users in comments
    if (!post) throw new Error('Forum post not found.');
    post.views = (post.views || 0) + 1;
    await post.save();
    return post;
};

export const updateForumPost = async (postId, updates, userId) => {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Forum post not found.');
    if (post.author.toString() !== userId.toString()) { // Add admin override later
        throw new Error('Unauthorized to update this post.');
    }
    Object.assign(post, updates);
    await post.save();
    return post.populate('author', 'name profilePicture').populate('category', 'name');
};

export const deleteForumPost = async (postId, userId) => {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Forum post not found.');
    // Add role-based deletion (admin or original author)
    if (post.author.toString() !== userId.toString() /* && !userIsAdmin(userId) */) {
        throw new Error('Unauthorized to delete this post.');
    }
    await ForumPost.findByIdAndDelete(postId);
    // Consider soft delete as an alternative
    return { message: 'Post deleted successfully.' };
};

// --- Comment Services (for Forum Posts) ---
export const addCommentToPost = async (postId, userId, content) => {
    const post = await ForumPost.findById(postId);
    if (!post || post.isLocked) throw new Error('Post not found or is locked.');

    const newComment = { user: userId, content, createdAt: new Date(), updatedAt: new Date() };
    post.comments.push(newComment);
    post.lastReplyAt = new Date();
    await post.save();
    // Return the newly added comment, potentially with populated user info
    // For simplicity, returning the whole post for now
    return post.populate('comments.user', 'name profilePicture');
};

export const updateCommentInPost = async (postId, commentId, userId, newContent) => {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Post not found.');

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error('Comment not found.');

    if (comment.user.toString() !== userId.toString() /* && !userIsAdmin(userId) */) {
        throw new Error('Unauthorized to update this comment.');
    }

    comment.content = newContent;
    comment.updatedAt = new Date();
    await post.save();
    return post.populate('comments.user', 'name profilePicture');
};

export const deleteCommentFromPost = async (postId, commentId, userId) => {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Post not found.');

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error('Comment not found.');

    if (comment.user.toString() !== userId.toString() /* && !userIsAdmin(userId) */) {
        throw new Error('Unauthorized to delete this comment.');
    }

    post.comments.pull(commentId); // Mongoose subdocument removal
    await post.save();
    return post;
};

// --- Announcement Services ---
export const createAnnouncement = async (title, content, authorId, targetAudience, attachments, publishDate, expiryDate) => {
    const announcement = new Announcement({
        title, content, author: authorId, targetAudience, attachments, publishDate, expiryDate
    });
    await announcement.save();
    return announcement.populate('author', 'name profilePicture');
};

export const getAllAnnouncements = async (page = 1, limit = 10, activeOnly = true) => {
    const query = {};
    if (activeOnly) {
        query.isActive = true;
        query.publishDate = { $lte: new Date() };
        query.$or = [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }];
    }
    return Announcement.find(query)
        .sort({ publishDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name profilePicture');
};

export const getAnnouncementById = async (announcementId) => {
    const announcement = await Announcement.findById(announcementId).populate('author', 'name profilePicture');
    if (!announcement) throw new Error('Announcement not found.');
    return announcement;
};

export const updateAnnouncement = async (announcementId, updates, userId) => {
    // Add authorization checks (e.g., only author or admin)
    const announcement = await Announcement.findByIdAndUpdate(announcementId, updates, { new: true });
    if (!announcement) throw new Error('Announcement not found.');
    return announcement.populate('author', 'name profilePicture');
};

export const deleteAnnouncement = async (announcementId, userId) => {
    // Add authorization checks
    const result = await Announcement.findByIdAndDelete(announcementId);
    if (!result) throw new Error('Announcement not found.');
    return { message: 'Announcement deleted successfully.' };
};

// --- Community Interaction Services (Placeholder) ---
// e.g., reporting content, user reputation, etc.
// export const reportContent = async (contentType, contentId, reporterId, reason) => { ... };