export const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[a-zA-Z]/.test(pass)) return "Password must contain at least one letter";
    if (!/\d/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one symbol";
    return null;
};

export const validateCnic = (cnic) => {
    const cnicPattern = /^\d{5}-\d{7}-\d$/;
    if (!cnic) return "CNIC is required";
    if (!cnicPattern.test(cnic)) return "CNIC must be in format: XXXXX-XXXXXXX-X";
    return null;
};

export const formatCnic = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Apply formatting: XXXXX-XXXXXXX-X
    let formatted = cleaned;
    if (cleaned.length > 5) {
        formatted = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
    }
    if (cleaned.length > 12) {
        formatted = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 12) + '-' + cleaned.slice(12, 13);
    }
    
    return formatted;
};
