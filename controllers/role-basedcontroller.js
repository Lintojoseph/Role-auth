const jwt = require('jsonwebtoken');
const userModel=require('../Models/UserModel')
const {comparePassword , hashPassword }=require('../Helpers/authHelp')
const fs = require('fs').promises;
const Filemodel = require('../Models/Filemodel');
const bcrypt = require("bcrypt");
const maxAge = 3 * 24 * 60 * 60;
const path = require('path');



const createToken = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,algorithm: 'HS256'
    });
    console.log(token,'tooooooooo')
    
    return token;
  } catch (error) {
    console.error("Error while creating the JWT token:", error);
    throw error;
  }
};
console.log(createToken,'fdfdfdfd')



const registerController = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      //validations
      if (!name) {
        return res.send({ error: "Name is Required" });
      }
      if (!email) {
        return res.send({ message: "Email is Required" });
      }
      if (!password) {
        return res.send({ message: "Password is Required" });
      }
     
      //check user
      const exisitingUser = await userModel.findOne({ email });
      //exisiting user
      if (exisitingUser) {
        return res.status(200).send({
          success: false,
          message: "Already Register please login",
        });
      }
      //register user
      const hashedPassword = await hashPassword(password);
      //save
      const user = await new userModel({
        name,
        email,
        password: hashedPassword
      }).save();
  
      res.status(201).send({
        success: true,
        message: "User Register Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in Registeration",
        error,
      });
    }
  };

  // LOGIN
const loginController = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body, 'loginnnn')
    // throwing error if values are not provided
    if (!email || !password) throw Error("All Fields required");
    // finding the user
    const user= await userModel.findOne({ email: email });
   
    console.log(user, 'userrr')

    if (user) {
        //checking user status
        if (user.status) {
            //checking user password

            const validPassword = await bcrypt.compare(password, user.password);
            console.log(password, 'currentpass')
            console.log(user.password, 'installed pass')
            console.log(validPassword, 'pass')
            if (validPassword) {
                //creating twt token using user id
                const token = createToken(user._id);
                console.log(token, 'token')
                console.log(user.status, "status")
                res.status(200).send({
                  success: true,
                  message: "login successfully",
                  user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  },
                  token,
                });
            } else {
                res.json({ login: false, message: "Incorrect username or password" });
            }
        } else {
            res.json({ status: "Blocked", message: "Account suspended" })
        }
    } else {
        res.json({ message: "Email not exists", login: false })
    }
} catch (error) {
    next(error)
}
  };
  
//test controller
const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

const fileupload = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files;

    const uploadedFiles = await Promise.all(files.map(async (file) => {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;

      // Save file to local file system
      const filePath = path.join(__dirname, '..', 'upload', fileName);
      await fs.writeFile(filePath, file.buffer);

      // Save file metadata in MongoDB
      const fileMetadata = {
        userId: req.userId,
        filename: fileName,
        fileType: file.mimetype,
        fileSize: file.size,
      };

      const uploadedFile = await Filemodel.create(fileMetadata);

      return uploadedFile;
    }));

    res.json({ files: uploadedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports ={registerController,loginController,testController,fileupload}