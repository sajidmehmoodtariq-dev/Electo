export const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[a-zA-Z]/.test(pass)) return "Password must contain at least one letter";
    if (!/\d/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one symbol";
    return null;
};
