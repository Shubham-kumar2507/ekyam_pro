const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password, fullName, userType, location } = req.body;

        // Sanitize inputs
        const cleanUsername = (username || '').trim();
        const cleanEmail = (email || '').trim();
        const cleanFullName = (fullName || '').trim();

        if (!cleanUsername || !cleanEmail || !password || !cleanFullName) {
            return res.status(400).json({ message: 'Please provide all required fields: username, email, password, fullName' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = await User.findOne({ $or: [{ email: cleanEmail.toLowerCase() }, { username: cleanUsername }] });
        if (exists) return res.status(400).json({ message: 'User already exists with that email or username' });

        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail.toLowerCase(),
            password,
            fullName: cleanFullName,
            userType: userType || 'individual',
            location: (location || '').trim()
        });

        return res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            userType: user.userType,
            location: user.location,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            token: generateToken(user._id)
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }
        return res.status(500).json({ message: err.message });
    }
};

// @route POST /api/auth/login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const cleanUsername = (username || '').trim();
        if (!cleanUsername || !password) {
            return res.status(400).json({ message: 'Please provide username/email and password' });
        }

        const user = await User.findOne({ $or: [{ email: cleanUsername.toLowerCase() }, { username: cleanUsername }] });
        if (user && (await user.matchPassword(password))) {
            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                communityId: user.communityId,
                profileImage: user.profileImage,
                location: user.location,
                bio: user.bio,
                createdAt: user.createdAt,
                token: generateToken(user._id)
            });
        } else {
            return res.status(401).json({ message: 'Invalid username/email or password' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
    return res.json(req.user);
};

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide your email' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'No account found with that email' });

        // Generate a reset token valid for 15 minutes
        const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"EKYAM" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🔑 Reset Your EKYAM Password',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                    <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 2rem; text-align: center; color: #fff;">
                        <h1 style="margin: 0; font-size: 1.5rem;">EKYAM</h1>
                        <p style="opacity: 0.85; margin-top: 0.25rem;">Password Reset Request</p>
                    </div>
                    <div style="padding: 2rem;">
                        <p style="color: #374151;">Hi <strong>${user.fullName || user.username}</strong>,</p>
                        <p style="color: #6b7280;">We received a request to reset your password. Click the button below to set a new password:</p>
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <a href="${resetLink}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
                        </div>
                        <p style="color: #9ca3af; font-size: 0.85rem;">This link will expire in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                    </div>
                </div>
            `,
        });

        return res.json({ message: 'Password reset link has been sent to your email' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
        }

        if (decoded.purpose !== 'reset') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        return res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
