import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const conditionSchema = new Schema({
   
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
  imagePath: [String] ,
 
});

 const conditions = mongoose.model('condition', conditionSchema);

 export default conditions