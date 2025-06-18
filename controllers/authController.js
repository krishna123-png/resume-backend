const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Joi = require('joi');

function validateUser(req) {
    const registerSchema = Joi.object({
        fullName: Joi.string().required().trim(),
        email: Joi.string().required().email().lowercase().trim(),
        password: Joi.string().required().trim()
    })

    const loginSchema = Joi.object({
       email: Joi.string().required().email().lowercase().trim(),
       password: Joi.string().required().trim()
    })

    const updateSchema = Joi.object({
        fullName: Joi.string().required().trim(),
        password: Joi.string().trim().allow('')
    })

    if (!req.email) {
        return updateSchema.validate(req);
    }

    if (req.fullName) {
        return registerSchema.validate(req);
    }

    else {
        return loginSchema.validate(req);
    }
}

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if ( !fullName || !email || !password ) {
            return res.status(400).json({message: 'All fields are required'});
        }

        console.log(fullName);
        console.log(email);
        console.log(password);

        const { error, value } = validateUser( { fullName, email, password } );
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
 
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({ message: error.details[0].message });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.status(201).json({
            message: 'User registered successfuly',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email
            }
        });
    }

    catch (error) {
        console.error('Registered Error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const { error, value } = validateUser({ email, password });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                message: 'User with the given email does not exists'
            }); 
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

        const token = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        );

        res.status(200).json({
            message: 'User Logged In successfuly',
            token,
            user: {
                id: existingUser._id,
                fullName: existingUser.fullName,
                email: existingUser.email
            }
        });
    }
    catch (error) {
        console.error('Registered error: ', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
}

const getUser = async (req, res) => {
    try {
        const { fullName, email } = await User.findById(req.user.id);
        console.log(fullName, email);
        res.status(200).json({
            message: 'Fetched User Details Successfully',
            data: { fullName, email }
        });
    }
    catch (error) {
        console.error('Error fetching user details:', err);
        res.status(500).json({
            message: 'Server error while fetching users'
        }); 
    }
}

const updateUser = async (req, res) => {
    try {
        const { fullName, password } = req.body;

        if (!fullName) {
            return res.status(400).json({message: 'fullName is required'});
        }

        const { error, value } = validateUser({ fullName, password });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findById(req.user.id);
        console.log(user)

        if (password.length === '') {
            user.set({
                fullName: fullName
            })

            await user.save()
            res.status(201).json({
                message: 'user updated successfully',
                data: {
                    id: user._id,
                    fullName: user.fullName
                }
            });
        }

        else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.set({
                fullName: fullName,
                password: hashedPassword
            });
            await user.save();
            res.status(201).json({
                message: 'user updated successfully',
                data: {
                    id: user._id,
                    fullName: user.fullName
                }
            });
        }
    }
    catch (error) {
        console.error(error);
    }
}



module.exports.register = register;
module.exports.login = login;
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
