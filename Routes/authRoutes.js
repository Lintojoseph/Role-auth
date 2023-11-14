const express = require('express');
const {registerController,loginController,testController,fileupload}=require('../controllers/role-basedcontroller')
const {isAdmin, requireSignIn }=require('../middleware/authmiddleware')
const upload=require('../middleware/fileupload')   
//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);



//test routes
router.get("/test", requireSignIn, isAdmin, testController);
router.post('/upload',requireSignIn, isAdmin, upload.array('file'),fileupload)








module.exports = router;