import jwt from 'jsonwebtoken';

const generateToken = (id, role, cnic, status, isApproved) => {
    return jwt.sign({ id, role, cnic, status, isApproved }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;
