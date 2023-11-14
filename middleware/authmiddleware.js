const jwt = require('jsonwebtoken');
const userModel=require('../Models/UserModel')
const secret_key = process.env.JWT_SECRET;
//Protected Routes token base

const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log(authHeader, 'auuuth');

    if (authHeader) {
      const receivedToken = authHeader.split(' ')[1].trim();
      console.log('Received Token:', receivedToken);

      const decoded = jwt.verify(receivedToken, process.env.JWT_SECRET,{ algorithms: ['HS256'] });
      console.log('Decoded Token:', decoded);

      const user = await userModel.findOne({ _id: decoded.id });
      console.log('User:', user);

      if (user) {
        req.userId = decoded.id;
        next();
      } else {
        res.status(404).json({ status: false, message: "User not exists" });
      }
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(401).json({ message: "Not authorized" });
  }
};






//admin acceess
const isAdmin = async (req, res, next) => {
    try {
      const user = await userModel.findById(req.userId);
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