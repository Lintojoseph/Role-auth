const JWT = require('jsonwebtoken');
const userModel=require('../Models/UserModel')
const {comparePassword , hashPassword }=require('../Helpers/authHelp')
const fs = require('fs').promises;
const Filemodel = require('../Models/Filemodel');

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
const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      console.log(user,'klll')
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      };

      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
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
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
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
      const filePath = path.join(__dirname, 'uploads', fileName);
      await fs.writeFile(filePath, file.buffer);

      // Save file metadata in MongoDB
      const fileMetadata = {
        userId: req.user._id,
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