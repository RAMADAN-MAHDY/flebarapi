import express from 'express';
import connectDB from './db.js';
import Conditions from './chsma/condition.js';
import User from './chsma/createuser.js';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express()
const port = 5000;
connectDB();
app.use(express.json())
app.use(cors()); 

//log in 
app.post('/login',async (req,res)=>{
try{
const {email , password} = req.body;
const checkemail = await User.findOne({email});
if(!checkemail){
    return res.status(500).json("يرجي التاكد من الحساب واعادة المحاوله")
}
const ispasswordValid = await bcrypt.compare(password ,checkemail.password );

if(!ispasswordValid){
    return res.status(500).json("يرجي التاكد من الحساب واعادة المحاوله")
}
return res.status(200).json({ message: 'Login successful' });

}catch(err){
    return res.status(500).json("خطأ في التسجيل");
}

})


//post account 
app.post('/user',async (req,res)=>{
try{
    const {name, email, password} = req.body;
    const checkemail =await User.findOne({email})
    if(checkemail){
        return res.status(300).json("جرب حساب اخر ")
    }
    const hashedpassword = await bcrypt.hash(password , 10)
    await User.create({name, email, password:hashedpassword})
    return res.status(200).json("تم انشاء الحساب");

}catch(err){
   return res.status(500).json({message : err.message})
}


})



//post data 
app.post('/condition', async (req,res)=>{
    try{
        const conditionData = req.body;
        const orderisExists = await Conditions.findOne({order:conditionData.order});

        if(orderisExists){
            return res.status(301).json(` الامر ده موجود بالفعل  ${conditionData.order}`)
        }
        await Conditions.create(conditionData);
        return res.status(201).json('تم ارسال الطلب')

    }catch(err){
        return res.status(500).json({message : err.message})
    }
});

//put data 
app.put('/condition/:id', async (req,res)=>{
    try{
        const { id } = req.params;
        const { condition } = req.body;

        const updatedCondition = await Conditions.findByIdAndUpdate(id, { condition }, { new: true });

        if (!updatedCondition) {
          return res.status(404).json('Condition not found');
        }

        res.status(200).json(updatedCondition);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
});

app.get('/condition', async (req, res) => {
  try {
    const conditions = await Conditions.find();
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve conditions' });
  }
});


app.get('/', (req, res) => {

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})