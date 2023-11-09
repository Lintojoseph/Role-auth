const JWT = require('jsonwebtoken');
const userModel=require('../Models/UserModel')

//Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
    console.log('Request Headers:', req.headers);
    const token = req.headers.authorization;
    console.log('Authorization Header:', token);

    if (!token || !token.startsWith('Bearer ')) {
      throw new Error('Token is missing or in the incorrect format');
    }

    const decoded = JWT.verify(token.substring(7), process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
  }
};


//admin acceess
const isAdmin = async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user._id);
      if (user.role !== 1) {
        return res.status(401).send({
          success: false,
          message: "its user",
        });
      } else {
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({
        success: false,
        error,
        message: "Error in admin middelware",
      });
    }
  };

  module.exports={requireSignIn,isAdmin}