const mongoose = require('mongoose');
mongoose
  .connect(process.env.MONGODB_URI)
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error(err));
module.exports = mongoose;