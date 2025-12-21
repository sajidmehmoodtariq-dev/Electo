import jwt from 'jsonwebtoken';

const generateToken = (id, role, cnic, status, isApproved, name, email, avatar) => {
    return jwt.sign({ id, role, cnic, status, isApproved, name, email, avatar }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;
