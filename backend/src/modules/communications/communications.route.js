import express from 'express';
import {
    sendDirectMessageCtrl,
    getConversationCtrl,
    markMessageAsReadCtrl,
    getUnreadMessagesCountCtrl,
    createForumCategoryCtrl,
    getAllForumCategoriesCtrl,
    getForumCategoryByIdCtrl,
    updateForumCategoryCtrl,
    createForumPostCtrl,
    getForumPostsByCategoryCtrl,
    getForumPostByIdCtrl,
    updateForumPostCtrl,
    deleteForumPostCtrl,
    addCommentToPostCtrl,
    updateCommentInPostCtrl,
    deleteCommentFromPostCtrl,
    createAnnouncementCtrl,
    getAllAnnouncementsCtrl,
    getAnnouncementByIdCtrl,
    updateAnnouncementCtrl,
    deleteAnnouncementCtrl
} from './communications.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js'; // Assuming auth middleware path
import { roleAuth } from '../../middlewares/roleAuth.middleware.js'; // Assuming role auth middleware

const router = express.Router();

// --- Direct Message Routes ---
// All direct message routes require authentication
router.use('/messages', authMiddleware); // Apply auth to all /messages routes

router.post('/messages', sendDirectMessageCtrl);
router.get('/messages/conversation/:userId2', getConversationCtrl);
router.patch('/messages/:messageId/read', markMessageAsReadCtrl);
router.get('/messages/unread-count', getUnreadMessagesCountCtrl);

// --- Forum Category Routes ---
// Creating and updating categories might be restricted to admins/funcionarios
router.post('/forum/categories', authMiddleware, roleAuth(['admin', 'funcionario']), createForumCategoryCtrl);
router.get('/forum/categories', getAllForumCategoriesCtrl); // Publicly viewable or authMiddleware if needed
router.get('/forum/categories/:categoryId', getForumCategoryByIdCtrl); // Publicly viewable or authMiddleware
router.put('/forum/categories/:categoryId', authMiddleware, roleAuth(['admin', 'funcionario']), updateForumCategoryCtrl);
// Deleting categories might also be an admin/funcionario task (not implemented in controller yet)

// --- Forum Post Routes ---
router.post('/forum/posts', authMiddleware, createForumPostCtrl);
router.get('/forum/posts/category/:categoryId', getForumPostsByCategoryCtrl); // Publicly viewable or authMiddleware
router.get('/forum/posts/:postId', getForumPostByIdCtrl); // Publicly viewable or authMiddleware
router.put('/forum/posts/:postId', authMiddleware, updateForumPostCtrl); // Author or admin
router.delete('/forum/posts/:postId', authMiddleware, deleteForumPostCtrl); // Author or admin

// --- Comment Routes (for Forum Posts) ---
router.post('/forum/posts/:postId/comments', authMiddleware, addCommentToPostCtrl);
router.put('/forum/posts/:postId/comments/:commentId', authMiddleware, updateCommentInPostCtrl); // Comment author or admin
router.delete('/forum/posts/:postId/comments/:commentId', authMiddleware, deleteCommentFromPostCtrl); // Comment author or admin

// --- Announcement Routes ---
// Creating, updating, deleting announcements typically for admins/funcionarios
router.post('/announcements', authMiddleware, roleAuth(['admin', 'funcionario']), createAnnouncementCtrl);
router.get('/announcements', getAllAnnouncementsCtrl); // Publicly viewable or authMiddleware
router.get('/announcements/:announcementId', getAnnouncementByIdCtrl); // Publicly viewable or authMiddleware
router.put('/announcements/:announcementId', authMiddleware, roleAuth(['admin', 'funcionario']), updateAnnouncementCtrl);
router.delete('/announcements/:announcementId', authMiddleware, roleAuth(['admin', 'funcionario']), deleteAnnouncementCtrl);

export default router;