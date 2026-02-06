const authorizeAll = (roles = ['Admin', 'Organizer']) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
}
const authorize = (roles = 'Admin') => {
    return (req, res, next) => {
        if (req.user.role !== roles) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
}

module.exports = { authorize, authorizeAll };
