import express from 'express';
import connectDB from './db.js';
import Conditions from './chsma/condition.js';
import User from './chsma/createuser.js';
import DetailSchema from './chsma/details.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';
// import bodyParser from 'body-parser';
// import multer from 'multer';

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

const app = express()
const port = 5000;
app.use((req, res, next) => {
    const contentLength = parseInt(req.get('content-length'), 10);
    console.log(`حجم البيانات: ${contentLength} bytes`);
    next();
  });
  // زيادة الحد الأقصى لحجم البيانات المسموح به
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
connectDB();
// app.use(express.json())
const corsOptions = {
    origin: 'https://elmahdy.vercel.app',
    optionsSuccessStatus: 200
  }
  
app.use(cors(corsOptions));
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

app.post('/condition', async (req, res) => {
    try {
        const { order, modelnumber, name, quantity, condition , imagePath } = req.body;
        const orderisExists = await Conditions.findOne({ order });

        if (orderisExists) {
            return res.status(301).json(`الامر ده موجود بالفعل ${order}`);
        }
        // const images = req.files.map(file => file.buffer.toString('base64'));
        const conditionData = { order, modelnumber, name, quantity, condition, imagePath };

        await Conditions.create(conditionData);
        return res.status(201).json('تم ارسال الطلب');
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
//put condition data 
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
//post conditon to conditions array
app.post('/condition/details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stateDetail } = req.body;
        
    
        if (!id || !stateDetail) {
            return res.status(400).json({ error: 'الحقول المطلوبة مفقودة' });
        }

        // إضافة الوقت الحالي إلى stateDetail
        stateDetail.timestamp = new Date();
        // Check if there is a condition with the specified idOrder
        let existingCondition = await DetailSchema.findOne({ idOrder: id });

        if (!existingCondition) {
            // If no condition with this idOrder exists, create a new one
            existingCondition = await DetailSchema.create({ idOrder: id,conditions: [stateDetail] });
        } else {
            // If a condition with this idOrder already exists, check if the stateDetail exists
            const index = existingCondition.conditions.findIndex(detail => detail.condition === stateDetail.condition);
            if (index !== -1) {
                // If the stateDetail exists, update its values
                existingCondition.conditions[index].email = stateDetail.email ;
                existingCondition.conditions[index].number = stateDetail.number;
                existingCondition.conditions[index].note = stateDetail.note;
                existingCondition.conditions[index].timestamp = new Date();
            } else {
                // If the stateDetail doesn't exist, push it to the conditions array
                stateDetail.timestamp = new Date();
                existingCondition.conditions.email = stateDetail.email ;
                existingCondition.conditions.push(stateDetail);
            }
            // Save the changes to the existing condition
            await existingCondition.save();
        }

        res.status(200).json({ message: 'تمت إضافة تفاصيل الحالة بنجاح' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get datails condition
app.get("/condition/details/:id" , async(req,res)=>{
   
   try{
    const { id }= req.params ; 

    const finddetails = await DetailSchema.findOne({idOrder: id});

  if(!finddetails){
    return  res.status(500).json("حدث خطا");
  }

  return res.status(200).json(finddetails);


   }catch(error){
    res.status(500).json({ error: error.message });
   }
})




app.get('/condition', async (req, res) => {
  try {
    const conditions = await Conditions.find();
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve conditions' });
  }
});
//get by id
app.get('/condition/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const conditions = await Conditions.findById(id);
      
      if (!conditions) {
        return res.status(404).json({ error: 'Condition not found' });
      }
  
      res.json(conditions);
    } catch (error) {
      console.error('Error retrieving condition:', error);
      res.status(500).json({ error: 'Failed to retrieve conditions' });
    }
  });

app.get('/', (req, res) => {

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})