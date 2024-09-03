import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { sign, verify } = jwt;

const KEY = 'supersecret';

export function createJSONToken(identifier) {
  return sign({ identifier }, KEY, { expiresIn: '24h' });
}

export function validateJSONToken(token) {
  return verify(token, KEY);
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization header is missing' }); 
  }

  try {
    const decodedToken = validateJSONToken(token);
    req.identifier = decodedToken; // Attach user information to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Function to hash a password
export const hashPassword = async (password) => {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Could not hash password');
  }
};

// Function to compare passwords
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Could not compare passwords');
  }
};