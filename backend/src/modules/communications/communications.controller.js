import * as communicationService from './communications.service.js';
import { handleHttpError } from '../../utils/error.handler.js'; // Assuming you have an error handler

// --- Direct Message Controllers ---
export const sendDirectMessageCtrl = async (req, res) => {
    try {
        const { receiverId, content, attachments } = req.body;
        const senderId = req.user._id; // Assuming user ID is available from auth middleware
        const message = await communicationService.sendDirectMessage(senderId, receiverId, content, attachments);
        res.status(201).json(message);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getConversationCtrl = async (req, res) => {
    try {
        const { userId2 } = req.params;
        const userId1 = req.user._id;
        const { page, limit } = req.query;
        const messages = await communicationService.getConversation(userId1, userId2, parseInt(page), parseInt(limit));
        res.status(200).json(messages);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const markMessageAsReadCtrl = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;
        const message = await communicationService.markMessageAsRead(messageId, userId);
        res.status(200).json(message);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getUnreadMessagesCountCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await communicationService.getUnreadMessagesCount(userId);
        res.status(200).json({ count });
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

// --- Forum Category Controllers ---
export const createForumCategoryCtrl = async (req, res) => {
    try {
        const { name, description } = req.body;
        const createdBy = req.user._id; // Assuming admin/authorized user
        const category = await communicationService.createForumCategory(name, description, createdBy);
        res.status(201).json(category);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getAllForumCategoriesCtrl = async (req, res) => {
    try {
        const { activeOnly = 'true' } = req.query; // Default to true
        const categories = await communicationService.getAllForumCategories(activeOnly === 'true');
        res.status(200).json(categories);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getForumCategoryByIdCtrl = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await communicationService.getForumCategoryById(categoryId);
        res.status(200).json(category);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const updateForumCategoryCtrl = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;
        const userId = req.user._id; // For authorization checks in service
        const category = await communicationService.updateForumCategory(categoryId, updates, userId);
        res.status(200).json(category);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

// --- Forum Post Controllers ---
export const createForumPostCtrl = async (req, res) => {
    try {
        const { title, content, categoryId, tags } = req.body;
        const authorId = req.user._id;
        const post = await communicationService.createForumPost(title, content, authorId, categoryId, tags);
        res.status(201).json(post);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getForumPostsByCategoryCtrl = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page, limit, sortBy } = req.query;
        const posts = await communicationService.getForumPostsByCategory(categoryId, parseInt(page), parseInt(limit), sortBy);
        res.status(200).json(posts);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getForumPostByIdCtrl = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await communicationService.getForumPostById(postId);
        res.status(200).json(post);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const updateForumPostCtrl = async (req, res) => {
    try {
        const { postId } = req.params;
        const updates = req.body;
        const userId = req.user._id;
        const post = await communicationService.updateForumPost(postId, updates, userId);
        res.status(200).json(post);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const deleteForumPostCtrl = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;
        const result = await communicationService.deleteForumPost(postId, userId);
        res.status(200).json(result);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

// --- Comment Controllers (for Forum Posts) ---
export const addCommentToPostCtrl = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;
        const post = await communicationService.addCommentToPost(postId, userId, content);
        res.status(201).json(post); // Or just the new comment
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const updateCommentInPostCtrl = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;
        const post = await communicationService.updateCommentInPost(postId, commentId, userId, content);
        res.status(200).json(post); // Or just the updated comment
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const deleteCommentFromPostCtrl = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id;
        const post = await communicationService.deleteCommentFromPost(postId, commentId, userId);
        res.status(200).json(post); // Or a success message
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

// --- Announcement Controllers ---
export const createAnnouncementCtrl = async (req, res) => {
    try {
        const { title, content, targetAudience, attachments, publishDate, expiryDate } = req.body;
        const authorId = req.user._id; // Assuming authorized user
        const announcement = await communicationService.createAnnouncement(title, content, authorId, targetAudience, attachments, publishDate, expiryDate);
        res.status(201).json(announcement);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getAllAnnouncementsCtrl = async (req, res) => {
    try {
        const { page, limit, activeOnly = 'true' } = req.query;
        const announcements = await communicationService.getAllAnnouncements(parseInt(page), parseInt(limit), activeOnly === 'true');
        res.status(200).json(announcements);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const getAnnouncementByIdCtrl = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const announcement = await communicationService.getAnnouncementById(announcementId);
        res.status(200).json(announcement);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const updateAnnouncementCtrl = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const updates = req.body;
        const userId = req.user._id; // For authorization
        const announcement = await communicationService.updateAnnouncement(announcementId, updates, userId);
        res.status(200).json(announcement);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};

export const deleteAnnouncementCtrl = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const userId = req.user._id; // For authorization
        const result = await communicationService.deleteAnnouncement(announcementId, userId);
        res.status(200).json(result);
    } catch (error) {
        handleHttpError(res, error.message);
    }
};