const express = require('express');
const router = express.Router();
const User = require('../models/user');

const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');


// POST route to add a Candidate

const checkAdmin=async(userID)=>{
    try {
        const user=await User.findById(userID);
        if(user.role==='admin'){
            return true;
        }

    } catch (error) {
        return false;
    }
}

 

router.post('/',jwtAuthMiddleware, async (req, res) =>{
    try{
         if(!checkAdmin(req.user.id))

            return res.status(403).json({message:'user does not have admin role'})
     
        const data = req.body // Assuming the request body contains the person data

        // Create a new user document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database

        const response = await newCandidate.save();
        console.log('data saved');

        

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



// Login Route


// Profile route





router.put('/:candidateID' ,jwtAuthMiddleware, async (req, res)=>{
    try{
        if(! await checkAdmin(req.user.id))

        return res.status(403).json({message:'user does not have admin role'})

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Person.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
        
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateID' ,jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdmin(req.user.id))

        return res.status(403).json({message:'user does not have admin role'})

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        

        const response = await Person.findByIdAndDelete(candidateID, updatedCandidateData)

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate Deleted');
        res.status(200).json(response);
        
    }catch(err){
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
//let start voting

router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin vote
    //user vote only once
    candidateID=req.params.candidateID;
    userId=req.user.id;

  

    try {
        
        const candidate= await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:'Candidate not found'})
        }


        const user=await User.findById(userId);

        if(!user){
            console.log("Error");
            return res.status(404).json({message:'User not found'});
            
        }

        if(user.isVoted){
            return res.status(400).json({message:'User have already Voted'});
        }
        if(user.role =='admin'){

            return res.status(403).json({message:'Admin is not allowed'});

        }

        //update the candidate document to record the vote

        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save()

        //update the user document

        user.isVoted =true;
         await user.save();

        return res.status(200).json({message:"Vote record successfully"});

    } catch (error) {
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

//vote count

router.get('/vote/count',async(req,res)=>{

    try {

        const candidate=await Candidate.find().sort({voteCount: 'descending'}) //find all candidates and sort them 
        

        //map the candidates to only return their name and votecount

        const voteRecord=  candidate.map((data)=>{

            return{

                party:data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json({voteRecord});




    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/',async(req,res)=>{
try {

    const candidates=await Candidate.find({},'name party -_id');
      
  

    res.status(200).json(candidates);

    
} catch (err) {
      
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
    
}


});

module.exports = router;             