import * as DocumentService from './documents.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js'; // Assuming a utility for handling async errors
import { AppError } from '../../utils/AppError.js'; // Assuming a custom error class

// --- Document Controllers ---

export const uploadDocument = asyncHandler(async (req, res, next) => {
    const { title, description, tags, category, accessControl, allowedUsers, allowedRoles } = req.body;
    const userId = req.user._id; // Assuming user ID is available from auth middleware

    if (!req.file) {
        return next(new AppError('No se ha proporcionado ningún archivo.', 400));
    }

    const documentData = {
        title,
        description,
        tags: tags ? JSON.parse(tags) : [], // Assuming tags are sent as a JSON string array
        category,
        accessControl,
        allowedUsers: allowedUsers ? JSON.parse(allowedUsers) : [], // Assuming allowedUsers are sent as a JSON string array of User IDs
        allowedRoles: allowedRoles ? JSON.parse(allowedRoles) : [], // Assuming allowedRoles are sent as a JSON string array of role names
    };

    const newDocument = await DocumentService.createDocument(documentData, req.file, userId);
    res.status(201).json({
        status: 'success',
        message: 'Documento cargado y creado exitosamente.',
        data: newDocument,
    });
});

export const uploadNewVersion = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    if (!req.file) {
        return next(new AppError('No se ha proporcionado ningún archivo para la nueva versión.', 400));
    }

    const updatedDocument = await DocumentService.addDocumentVersion(documentId, req.file, userId, notes);
    res.status(200).json({
        status: 'success',
        message: 'Nueva versión del documento cargada exitosamente.',
        data: updatedDocument,
    });
});

export const getDocument = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user._id; // For access control checks in service

    const document = await DocumentService.getDocumentById(documentId, userId);
    if (!document) {
        return next(new AppError('Documento no encontrado.', 404));
    }
    res.status(200).json({
        status: 'success',
        data: document,
    });
});

export const downloadDocumentVersion = asyncHandler(async (req, res, next) => {
    const { documentId, versionNumber } = req.params;
    const userId = req.user._id;

    const versionDetails = await DocumentService.getDocumentVersion(documentId, versionNumber, userId);
    if (!versionDetails) {
        return next(new AppError('Versión del documento no encontrada o acceso denegado.', 404));
    }

    // In a real scenario, you might redirect to the S3 pre-signed URL
    // or proxy the download if direct S3 access isn't desired for the client.
    // For this example, we'll just send back the details including the URL.
    res.status(200).json({
        status: 'success',
        message: 'Detalles de la versión del documento recuperados. Utilice downloadUrl para descargar.',
        data: versionDetails,
        // If proxying: res.redirect(versionDetails.downloadUrl);
    });
});

export const listDocuments = asyncHandler(async (req, res, next) => {
    const { page, limit, sort, ...filters } = req.query;
    const userId = req.user._id;
    const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 10, sort };

    // Sanitize filters if necessary, e.g., parse JSON strings for tags
    if (filters.tags) filters.tags = { $in: filters.tags.split(',') };

    const result = await DocumentService.findDocuments(filters, options, userId);
    res.status(200).json({
        status: 'success',
        results: result.documents.length,
        data: result,
    });
});

export const updateDocument = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user._id;
    const updateData = req.body; // Contains fields like title, description, tags, category, accessControl, etc.

    // Ensure sensitive fields are not updated directly if not intended
    delete updateData.owner;
    delete updateData.versions;
    delete updateData.currentVersion;
    delete updateData.originalFileName;

    const updatedDocument = await DocumentService.updateDocumentMetadata(documentId, updateData, userId);
    res.status(200).json({
        status: 'success',
        message: 'Metadatos del documento actualizados exitosamente.',
        data: updatedDocument,
    });
});

export const archiveDocumentController = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user._id;

    const result = await DocumentService.archiveDocument(documentId, userId);
    res.status(200).json({
        status: 'success',
        message: result.message,
    });
});

export const deleteDocumentController = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user._id;

    const result = await DocumentService.deleteDocument(documentId, userId);
    res.status(200).json({
        status: 'success',
        message: result.message,
    });
});

export const signDocumentController = asyncHandler(async (req, res, next) => {
    const { documentId } = req.params;
    const { signatureData, certificateInfo } = req.body; // signatureData could be a hash or other verifiable proof
    const userId = req.user._id;

    if (!signatureData) {
        return next(new AppError('Los datos de la firma son obligatorios.', 400));
    }

    const document = await DocumentService.addSignatureToDocument(documentId, userId, signatureData, certificateInfo);
    res.status(200).json({
        status: 'success',
        message: 'Documento firmado exitosamente.',
        data: document,
    });
});