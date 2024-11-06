const bcrypt = require('bcrypt');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const dontenv = require('dotenv');
const errorHandler = require('../middleware/errorHandler');

const verbose = false;

dontenv.config();



    // @route   POST /v1/api/users/register
    // @desc    Register a new user
    // @access  Public

module.exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Registration: All fields (username, email and password) are required.'
        });
    }


    try {

        const existingUser = await User.findOne( {email: email} );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Registration: User with this email or username already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);

        hashedPassword = await bcrypt.hash(password, salt );

        user = new User({ username, email, password: hashedPassword });

        await user.save();

        const payload = {
            userId: user._id,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token: token,
            success: true, 
            error: 'Registration: User successfully registered'
        });


    } catch (err) {
        console.log('Error-- in /register :', err);
        return res.status(500).json({ 
            success: false, 
            error: 'Registration: Server Error' 
        });
        
    }
    
},

// @route   POST /v1/api/users/login
// @desc    Authenticate user & get token
// @access  Public


module.exports.loginUser = async (req, res) => {

    try{
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    
    if (!user) {
        return res.status(404).json({ 
            success: false,
            error: 'Login: User not found' 
        });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ 
            success: false,
            error: 'Login: Invalid credentials' 
        });
    }

    const payload = {
        userId: user._id,
        // username: user.username,
        // email: user.email,
        // isAdmin: user.isAdmin
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'})

    res.status(200).json({
        token : token, 
        success: true, 
        error: 'Login: User successfully logged in.'
    });
    } catch (error) {
        console.log('Error in /login: ' + error);
        res.status(500).json({ 
            success: false, 
            error: 'Login: Server Error' 
        });
       
    }
}

// @route   GET /v1/api/users/profile
// @desc    Get authenticated user's profile
// @access  Private

module.exports.getProfile = async (req, res) => {

    const { userId} = req.user


    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Profile: User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (err) {
        console.error('Error in /profile: ', err);
        return res.status(500).json({
            success: false,
            message: 'Profile: Server Error'
        });
    }

}