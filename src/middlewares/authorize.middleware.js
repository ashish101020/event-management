
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (req.user.role !== roles) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
}

module.exports = { authorize };
