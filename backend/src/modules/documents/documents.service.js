import Document from './documents.model.js';
import User from '../auth/user.model.js'; // Adjust path as needed
// import { s3Upload, s3GetUrl, s3Delete } from '../../services/s3.service.js'; // Assuming S3 service for storage

// --- Document Services ---

/**
 * Creates a new document with its first version.
 * This would typically involve uploading the actual file to a storage service (e.g., S3)
 * and then saving the metadata to the database.
 */
export const createDocument = async (documentData, fileDetails, userId) => {
    try {
        // Placeholder for file upload logic to S3 or other storage
        // const { s3Key, s3Bucket, fileSize, mimeType } = await s3Upload(fileDetails.path, `documents/${userId}/${fileDetails.filename}`);
        // For now, using placeholder values for s3Key, s3Bucket
        const s3Key = `documents/${userId}/${Date.now()}-${fileDetails.originalname}`;
        const s3Bucket = 'your-s3-bucket-name'; // Replace with actual bucket name

        const firstVersion = {
            versionNumber: 1,
            s3Key,
            s3Bucket,
            fileSize: fileDetails.size,
            mimeType: fileDetails.mimetype,
            uploadedBy: userId,
        };

        const newDocument = new Document({
            ...documentData,
            originalFileName: fileDetails.originalname,
            owner: userId,
            versions: [firstVersion],
            currentVersion: 1,
        });

        await newDocument.save();
        return newDocument;
    } catch (error) {
        console.error("Service Error: createDocument", error);
        // if (s3Key && s3Bucket) await s3Delete(s3Key, s3Bucket); // Rollback S3 upload if DB save fails
        throw new Error(`Error al crear el documento: ${error.message}`);
    }
};

/**
 * Adds a new version to an existing document.
 * This involves uploading the new file version and updating the document's version history.
 */
export const addDocumentVersion = async (documentId, fileDetails, userId, notes) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) throw new Error('Documento no encontrado.');

        // Authorization: Check if user is owner or has specific rights to add version
        if (document.owner.toString() !== userId /* && !userHasPermission(userId, 'addVersion', document) */) {
            throw new Error('No autorizado para agregar versiones a este documento.');
        }

        // Placeholder for file upload logic
        // const { s3Key, s3Bucket, fileSize, mimeType } = await s3Upload(fileDetails.path, `documents/${document.owner}/${fileDetails.filename}`);
        const s3Key = `documents/${document.owner}/${Date.now()}-${fileDetails.originalname}`;
        const s3Bucket = 'your-s3-bucket-name'; // Replace with actual bucket name

        const newVersionNumber = document.versions.length + 1;
        const newVersion = {
            versionNumber: newVersionNumber,
            s3Key,
            s3Bucket,
            fileSize: fileDetails.size,
            mimeType: fileDetails.mimetype,
            uploadedBy: userId,
            notes,
        };

        document.versions.push(newVersion);
        document.currentVersion = newVersionNumber;
        document.updatedAt = Date.now();

        await document.save();
        return document;
    } catch (error) {
        console.error("Service Error: addDocumentVersion", error);
        // if (s3Key && s3Bucket) await s3Delete(s3Key, s3Bucket); // Rollback S3 upload
        throw new Error(`Error al agregar la versión del documento: ${error.message}`);
    }
};

/**
 * Retrieves a document by its ID, populating owner and version details.
 * Also checks access permissions.
 */
export const getDocumentById = async (documentId, userId) => {
    try {
        const document = await Document.findById(documentId)
            .populate('owner', 'nombre correo')
            .populate('versions.uploadedBy', 'nombre correo')
            .populate('signatures.signedBy', 'nombre correo');

        if (!document) throw new Error('Documento no encontrado.');

        // Access Control Logic
        if (document.accessControl === 'privado' && document.owner._id.toString() !== userId) {
            throw new Error('Acceso denegado a este documento.');
        }
        if (document.accessControl === 'restringido') {
            const user = await User.findById(userId);
            if (!user) throw new Error('Usuario no encontrado para verificación de acceso.');
            const isAllowedUser = document.allowedUsers.some(allowedId => allowedId.toString() === userId);
            const isAllowedRole = document.allowedRoles.includes(user.tipo_usuario);
            if (!isAllowedUser && !isAllowedRole && document.owner._id.toString() !== userId) {
                throw new Error('Acceso restringido a este documento.');
            }
        }
        
        // For simplicity, this example doesn't generate pre-signed URLs for each version.
        // In a real app, you'd generate a URL for the current version or a specific version.
        return document;
    } catch (error) {
        console.error("Service Error: getDocumentById", error);
        throw error;
    }
};

/**
 * Retrieves a specific version of a document.
 * This would typically involve generating a pre-signed URL for the file in S3.
 */
export const getDocumentVersion = async (documentId, versionNumber, userId) => {
    try {
        const document = await getDocumentById(documentId, userId); // Leverages existing access control
        const version = document.versions.find(v => v.versionNumber === parseInt(versionNumber));

        if (!version) throw new Error('Versión del documento no encontrada.');

        // Placeholder for generating a pre-signed URL from S3
        // const downloadUrl = await s3GetUrl(version.s3Key, version.s3Bucket);
        const downloadUrl = `https://${version.s3Bucket}.s3.amazonaws.com/${version.s3Key}`; // Example URL structure

        return {
            ...version.toObject(),
            originalFileName: document.originalFileName,
            downloadUrl,
        };
    } catch (error) {
        console.error("Service Error: getDocumentVersion", error);
        throw error;
    }
};

/**
 * Finds documents based on filters, with pagination and sorting.
 */
export const findDocuments = async (filters, options, userId) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = options;
        const query = { ...filters, isArchived: false };

        // Modify query to respect access controls
        // This is a simplified version. Real-world scenarios might be more complex.
        const user = await User.findById(userId);
        if (!user) throw new Error('Usuario no encontrado para la búsqueda.');

        const accessQuery = [
            { accessControl: 'publico' },
            { owner: userId }, 
            { accessControl: 'restringido', allowedUsers: userId },
        ];
        if (user.tipo_usuario) {
            accessQuery.push({ accessControl: 'restringido', allowedRoles: user.tipo_usuario });
        }
        query.$or = accessQuery;

        const documents = await Document.find(query)
            .populate('owner', 'nombre correo')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        
        const totalDocuments = await Document.countDocuments(query);

        return {
            totalPages: Math.ceil(totalDocuments / limit),
            currentPage: page,
            totalDocuments,
            documents,
        };
    } catch (error) {
        console.error("Service Error: findDocuments", error);
        throw new Error(`Error al buscar documentos: ${error.message}`);
    }
};

/**
 * Updates document metadata (not file content).
 */
export const updateDocumentMetadata = async (documentId, updateData, userId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) throw new Error('Documento no encontrado.');

        // Authorization: Check if user is owner or has specific rights
        if (document.owner.toString() !== userId /* && !userHasPermission(userId, 'updateMetadata', document) */) {
            throw new Error('No autorizado para actualizar este documento.');
        }

        // Prevent updating certain fields directly (e.g., versions, owner)
        delete updateData.versions;
        delete updateData.owner;
        delete updateData.currentVersion;
        delete updateData.originalFileName;

        Object.assign(document, updateData);
        document.updatedAt = Date.now();

        await document.save();
        return document;
    } catch (error) {
        console.error("Service Error: updateDocumentMetadata", error);
        throw new Error(`Error al actualizar metadatos del documento: ${error.message}`);
    }
};

/**
 * Archives a document (soft delete).
 */
export const archiveDocument = async (documentId, userId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) throw new Error('Documento no encontrado.');

        if (document.owner.toString() !== userId /* && !userHasPermission(userId, 'archive', document) */) {
            throw new Error('No autorizado para archivar este documento.');
        }

        document.isArchived = true;
        document.archivedAt = Date.now();
        await document.save();
        return { message: 'Documento archivado correctamente.' };
    } catch (error) {
        console.error("Service Error: archiveDocument", error);
        throw new Error(`Error al archivar el documento: ${error.message}`);
    }
};

/**
 * Deletes a document and its associated files from storage.
 * USE WITH CAUTION. This is a hard delete.
 */
export const deleteDocument = async (documentId, userId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) throw new Error('Documento no encontrado.');

        if (document.owner.toString() !== userId /* && !userHasPermission(userId, 'delete', document) */) {
            throw new Error('No autorizado para eliminar este documento.');
        }

        // Placeholder for deleting all versions from S3
        // for (const version of document.versions) {
        //     await s3Delete(version.s3Key, version.s3Bucket);
        // }

        await Document.findByIdAndDelete(documentId);
        return { message: 'Documento y todos sus archivos eliminados correctamente.' };
    } catch (error) {
        console.error("Service Error: deleteDocument", error);
        throw new Error(`Error al eliminar el documento: ${error.message}`);
    }
};

/**
 * Adds a digital signature to a document.
 */
export const addSignatureToDocument = async (documentId, signedByUserId, signatureData, certificateInfo) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) throw new Error('Documento no encontrado.');

        // TODO: Add logic to verify if this user is supposed to sign this document
        // e.g., based on a workflow, or if they are part of an approval chain.

        const signature = {
            signedBy: signedByUserId,
            signatureData, // This could be a hash of the document version being signed, or a reference to a signature file
            certificateInfo,
            status: 'firmado',
            signedAt: Date.now()
        };

        document.signatures.push(signature);
        await document.save();
        return document;
    } catch (error) {
        console.error("Service Error: addSignatureToDocument", error);
        throw new Error(`Error al agregar la firma al documento: ${error.message}`);
    }
};

// Helper function for permissions (placeholder)
// const userHasPermission = (userId, action, document) => {
//     // Implement actual permission logic here based on roles, document properties, etc.
//     return false;
// };