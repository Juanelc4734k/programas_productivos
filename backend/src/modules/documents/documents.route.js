import express from 'express';
import * as DocumentController from './documents.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js'; // Assuming auth middleware
import { upload } from '../../middleware/multer.middleware.js'; // Assuming multer middleware for file uploads

const router = express.Router();

// --- Document Routes ---

// POST /api/documents - Upload a new document
router.post('/',
    protect, // User must be logged in
    upload.single('documentFile'), // 'documentFile' is the field name in the form-data
    DocumentController.uploadDocument
);

// GET /api/documents - List all accessible documents (with filters and pagination)
router.get('/',
    protect,
    DocumentController.listDocuments
);

// GET /api/documents/:documentId - Get a specific document's details
router.get('/:documentId',
    protect,
    DocumentController.getDocument
);

// PUT /api/documents/:documentId - Update document metadata
router.put('/:documentId',
    protect,
    // authorize(['admin', 'editor']), // Example: Only admin or editor can update metadata, or owner (checked in service)
    DocumentController.updateDocument
);

// POST /api/documents/:documentId/versions - Upload a new version of a document
router.post('/:documentId/versions',
    protect,
    upload.single('documentFileVersion'), // Field name for the new version file
    DocumentController.uploadNewVersion
);

// GET /api/documents/:documentId/versions/:versionNumber - Get/download a specific version of a document
router.get('/:documentId/versions/:versionNumber',
    protect,
    DocumentController.downloadDocumentVersion
);

// POST /api/documents/:documentId/sign - Add a digital signature to a document
router.post('/:documentId/sign',
    protect,
    // Potentially authorize specific roles or users who can sign
    DocumentController.signDocumentController
);

// PATCH /api/documents/:documentId/archive - Archive a document (soft delete)
router.patch('/:documentId/archive',
    protect,
    // authorize(['admin', 'owner']), // Example: Only admin or owner can archive
    DocumentController.archiveDocumentController
);

// DELETE /api/documents/:documentId - Delete a document (hard delete)
router.delete('/:documentId',
    protect,
    authorize(['admin']), // Example: Only admin can permanently delete documents
    DocumentController.deleteDocumentController
);

export default router;