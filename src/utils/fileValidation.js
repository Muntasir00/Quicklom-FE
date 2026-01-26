/**
 * File Validation Utility
 * Provides client-side validation for file uploads before sending to server.
 *
 * SECURITY: This is a first line of defense. Backend validation is still critical.
 */

// Allowed file extensions by category
export const ALLOWED_EXTENSIONS = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    all: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ],
    all: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ],
};

// Dangerous extensions that should NEVER be allowed
export const DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.php', '.py', '.js', '.jar', '.msi',
    '.vbs', '.ps1', '.dll', '.so', '.bin', '.app', '.dmg', '.iso',
    '.html', '.htm', '.asp', '.aspx', '.jsp', '.cgi', '.pl',
];

// Maximum file size in bytes (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string} Extension in lowercase with dot
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot).toLowerCase();
};

/**
 * Validate a file before upload
 * @param {File} file - File object to validate
 * @param {Object} options - Validation options
 * @param {string} options.category - 'images', 'documents', or 'all'
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateFile = (file, options = {}) => {
    const { category = 'all', maxSize = MAX_FILE_SIZE } = options;

    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check file extension
    const extension = getFileExtension(file.name);

    // Block dangerous extensions first
    if (DANGEROUS_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `File type "${extension}" is not allowed for security reasons`,
        };
    }

    // Check against allowed extensions
    const allowedExts = ALLOWED_EXTENSIONS[category] || ALLOWED_EXTENSIONS.all;
    if (!allowedExts.includes(extension)) {
        return {
            valid: false,
            error: `File type "${extension}" is not allowed. Allowed types: ${allowedExts.join(', ')}`,
        };
    }

    // Check MIME type
    const allowedMimes = ALLOWED_MIME_TYPES[category] || ALLOWED_MIME_TYPES.all;
    if (file.type && !allowedMimes.includes(file.type)) {
        // Allow if it's generic binary (some browsers report this)
        if (file.type !== 'application/octet-stream') {
            console.warn(`Suspicious MIME type ${file.type} for file ${file.name}`);
        }
    }

    // Check file size
    if (file.size > maxSize) {
        const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${sizeMB} MB`,
        };
    }

    return { valid: true, error: null };
};

/**
 * Validate multiple files
 * @param {FileList|File[]} files - Files to validate
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateFiles = (files, options = {}) => {
    const errors = [];

    for (let i = 0; i < files.length; i++) {
        const result = validateFile(files[i], options);
        if (!result.valid) {
            errors.push(`${files[i].name}: ${result.error}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Create an onChange handler for file inputs with validation
 * @param {Function} onValid - Callback when file is valid
 * @param {Function} onInvalid - Callback when file is invalid (receives error message)
 * @param {Object} options - Validation options
 * @returns {Function} onChange handler
 */
export const createFileInputHandler = (onValid, onInvalid, options = {}) => {
    return (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const result = validateFile(file, options);
        if (result.valid) {
            onValid(file);
        } else {
            onInvalid(result.error);
            // Clear the input
            event.target.value = '';
        }
    };
};

export default {
    validateFile,
    validateFiles,
    createFileInputHandler,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    DANGEROUS_EXTENSIONS,
    MAX_FILE_SIZE,
};
