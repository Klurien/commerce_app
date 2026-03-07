const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('../config/firebase');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user exists (by email OR phone)
        const userExists = await User.findOne({
            $or: [{ email }, { phone }]
        });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'buyer',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Check for user (by email OR phone)
        const user = await User.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, avatar, bio } = req.body;
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            token: generateToken(updatedUser._id, updatedUser.role),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePushToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        user.expoPushToken = token;
        await user.save();

        res.json({ message: 'Push token updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decodedToken;

        let user = await User.findOne({ email });

        if (user) {
            // User exists, just log them in
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || picture,
                authProvider: user.authProvider,
                token: generateToken(user._id, user.role),
            });
        }

        // User does not exist, create a new one
        user = await User.create({
            name: name || 'Google User',
            email,
            password: '',
            role: role || 'buyer',
            avatar: picture || '',
            authProvider: 'google',
            firebaseUid: uid
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
};
