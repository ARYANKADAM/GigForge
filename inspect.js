// remove any NODE_OPTIONS set by VSCode (debugger) so script runs normally
process.env.NODE_OPTIONS = '';
const mongoose = require('mongoose');
const Contract = require('./models/Contract');

async function main(){
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance-marketplace');
  const c = await Contract.findOne().lean();
  console.log('found contract', c?._id);
  console.log('timeline', c?.timeline);
  process.exit();
}

main().catch(err=>{console.error(err);process.exit(1);});