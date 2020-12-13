require('dotenv').config();
const {MongoClient} = require('mongodb');


async function main(callback){
const URI = process.env.URI;
const client = new MongoClient(URI,{useNewUrlParser:true, useUnifiedTopology:true});
try{
  await client.connect()
  let db = await client.db('issues');
  await callback(db);
}catch(err){
  console.error(err)
  throw new Error('Connection failed');
}
}

module.exports = main;
