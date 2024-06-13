const asyncHandler = require('express-async-handler')

//@desc Get goals
//@route GET/api/goals
//@access private
const getGoals = asyncHandler(async(req,res) =>{
    res.status(200).json({message :'Get goals'})
})

//@desc set goal
//@route POST/api/goals
//@access private
const setGoal = asyncHandler(async(req,res) =>{
   if(!req.body.text){
        res.status(400)
        throw new Error('please add a text field')
   }

    res.status(200).json({message:'set Goals'})
})

//@desc update goal
//@route PUT/api/goals/:id
//@access private
const updateGoal =asyncHandler(async (req,res) =>{
    res.status(200).json({message:`update Goals ${req.params.id}`})
})

//@desc Delete goal
//@route DELETE/api/goals/:id
//@access private
const deleteGoal = asyncHandler(async(req,res) =>{
    res.status(200).json({message:`Delete Goals ${req.params.id}`})
})


module.exports={
    getGoals,
    setGoal,
    updateGoal,
    deleteGoal
}