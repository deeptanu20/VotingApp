const express = require('express');
const router = express.Router();
const User = require('./../models/user');

const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        const adminUser=await User.findOne({role:'admin'});

        if(data.role ==='admin' && adminUser){
            return res.status(400).json({message:'Admin already exists'});
        }

        const existUser=await User.findOne({adharCardNumber:data.adharCardNumber});

        if(existUser){

            return res.status(400).json({message:'User with same adharCard Number'})
        }

        // Create a new user document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database

        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
          
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract adhar and password from request body
        const {adharCardNumber, password} = req.body;

        // Find the user by adharcard no
        const user = await User.findOne({adharCardNumber:adharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
           
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})




router.put('/profile/password', jwtAuthMiddleware , async (req, res)=>{
    try{
        const userId = req.user.id;      // Extract the id from the token

        
        const {currentPassword, newPassword}= req.body;        // Extract the password and newpassword from body

   // Find the user by id no
      const user = await User.findById(userId);

      if(!(await user.comparePassword(currentPassword))){
        return res.status(401).json({error: 'Invalid  password'});
    }


     //update user password

       user.password=newPassword;
        
       await user.save();

        console.log('password updated');
        res.status(200).json({message:'Password Updated Successfully'});
        
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



module.exports = router;             