const authConfig = require('../config/auth');

// Register user
exports.register = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validate password
    const passwordValidation = authConfig.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ errors: passwordValidation.errors });
    }
    
    // Hash password
    const hashedPassword = await authConfig.hashPassword(password);
    
    // Create user...
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });
    
    // Generate tokens
    const tokens = authConfig.generateTokenPair(user);
    
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};