// Authentication middleware for POST requests only
export const authenticateUser = async (req, res, next) => {
    try {
        const { signedMessage, publicAddress, signData } = req.body;

        if (!signedMessage || !publicAddress || !signData) {
            return res.status(401).json({
                message: "Missing authentication data: signedMessage, publicAddress, and signData required"
            });
        }

        // Verify StarkNet signature
        const isValidSignature = await verifySignature(publicAddress, signData, signedMessage);
        if (!isValidSignature) {
            return res.status(401).json({ message: "Invalid signature" });
        }

        // Find user by public address
        const user = await User.findOne({ publicAddress });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Authentication failed", error: error.message });
    }
};

// General role-based access control using public address from headers
export const requireRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const publicAddress = req.headers['x-public-address'];

            if (!publicAddress) {
                return res.status(401).json({ message: "Public address required in headers (x-public-address)" });
            }

            const user = await User.findOne({ publicAddress });
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Handle multiple roles (for auditor or admin case)
            const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

            if (!allowedRoles.includes(user.role)) {
                const roleText = allowedRoles.join(' or ');
                return res.status(403).json({ message: `Access denied. ${roleText} role required` });
            }

            req.user = user; // Set user for downstream use
            next();
        } catch (error) {
            return res.status(500).json({ message: "Authentication failed", error: error.message });
        }
    };
};