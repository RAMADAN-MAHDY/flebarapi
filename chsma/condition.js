import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema({
   
    order : {
    type: Number,
    required: true, unique: true
  },
  modelnumber : {
    type: Number,
    required: true
  },
    name : {
    type: String,
    required: true
  },

 quantity : {
    type: Number,
    required: true
  },
  condition : {
    type: String,
    required: true
  },
});

 const conditions = mongoose.model('condition', conditionSchema);

 export default conditions