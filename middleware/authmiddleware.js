const jwt = require('jsonwebtoken');
const userModel=require('../Models/UserModel')
const secret_key = process.env.JWT_SECRET;
//Protected Routes token base

const requireSignIn = (req, res, next) => {
  try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
          const token = authHeader.split(' ')[1];
          jwt.verify(token, secret_key, async (err, decoded) => {
              // console.log(decoded.iat);
              // console.log(decoded);

              if (err) {
                  res.json({ status: false, message: "Unauthorized" });
              } else {
                  const user = await userModel.findOne({ _id: decoded.id });
                  console.log(user,'dddd')
                  if (user) {
                      req.userId=user._id;
                      next();
                  } else {
                      res.status(404).json({ status: false, message: "User not exists" })
                  }
              }
          });
      } else {
          res.json({ status: false, message: 'Token not provided' })
      }
  } catch (err) {
      res.status(401).json({ message: "Not authorized" });

  }
}



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