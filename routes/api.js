'use strict';
const mydb = require('./connection');
const ObjectID = require('mongodb').ObjectID;
module.exports = function (app) {
  app.use('/api/issues/:project', (req, res, next) => {
    if (req.params.project == '' || !req.params.project) {
      // console.log(req.params)
      res.send('Not Found');

    }
    else {
      mydb(async (client) => {
        let myDbCollection = await client.collection(req.params.project);
        req.db = myDbCollection;
        next();
      })
    }
  })
  app.route('/api/issues/:project')
    .get(async function (req, res) {
      // console.log(req.params)
      // let string = {assigned_to:,status_text:"",open:true,issue_title:"eee",issue_text:"New Issue Text",created_by:"asa",created_on:date.toISOString(),updated_on:date.toISOString()}
      let project = req.params.project;
      let collection = req.db;
      let data = [];
      let json = JSON.parse(JSON.stringify(req.query));
      if(req.query.open!=undefined){
        // console.log('open:'+(req.query.open==true));
        if(req.query.open == 'true'){
          json['open'] = true;
        }
        else if(req.query.open == 'false'){
          json['open'] = false;

        }
      }
      if(req.query._id){
        json['_id'] = new ObjectID(req.query._id);
      }
      // if(req.query.assigned_to!=undefined ){
      //   json['assigned_to'] = req.query.assigned_to;
      // }
      // if(req.query.issue_title!=undefined){
      //   json['issue_title'] = req.query.issue_title;
      // }
      // if(req.query.)
      // console.log('qry: '+JSON.stringify(req.query));
      // console.log('json: '+JSON.stringify(json))
      try {
        await collection.find(json).toArray((err, result) => {
          if (err) console.error(err);
          else {
            // console.log(result);
            if (result)
              res.json(result);
            else res.json([]);
          }
        });

      } catch (err) {
        console.error(err);
        throw new Error('Error in fetching data from collection');
      }



    })

    .post(function (req, res) {
      let project = req.params.project;
      let date = new Date();
      let collection = req.db;
      if(req.body.issue_title && req.body.issue_text && req.body.created_by){
      let json = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: date.toISOString(),
        updated_on: date.toISOString(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to ||'',
        open: true,
        status_text: req.body.status_text || ''
      }
      collection.insertOne(json, (postErr, data) => {
        if (postErr) console.error(postErr);

        else {
          // console.log(data.ops[0]);
          res.json(data.ops[0]);
        }
      })
    }
    else{
      res.json({ error: 'required field(s) missing' });
    }

    })

    .put(function (req, res) {
      let project = req.params.project;
      let collection = req.db;
      let date = new Date();
      console.log('project'+project)
      console.log(req.body)
      
      if(!req.body._id) {
        res.json({ error: 'missing _id' });
      }
      else if(req.body.issue_title || req.body.issue_text|| req.body.created_by || req.body.assigned_to || req.body.status_text || req.body.open || req.body.open ===false){
        let json = {
          issue_title: req.body.issue_title||'',
          issue_text: req.body.issue_text || '',
          updated_on: date.toISOString(),
          created_by: req.body.created_by || '',
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || ''
        }
        if(req.body.open!=undefined){
        // console.log('open:'+(req.query.open==true));
        if(req.body.open == 'true'){
          json['open'] = true;
        }
        else if(req.body.open == 'false'){
          json['open'] = false;

        }
      }
      try{
      collection.findOneAndUpdate({ _id: new ObjectID(req.body._id) }, 
      {
        $set: json },
         { new: true }, 
         (err, update) => {
          if (err){
             console.error(err);
             res.json({ error: 'could not update', '_id': req.body._id });
          }
          else {
            console.log(JSON.stringify(update))
            if(update.lastErrorObject.updatedExisting){
              
            res.json({result:"successfully updated",_id:req.body._id});
            }
            else{
            res.json({ error: 'could not update', '_id': req.body._id });
            }
          }
        })
        }catch(errors){
          console.log(errors);
          res.json({ error: 'could not update', '_id': req.body._id });
        }
      }
      else{
        res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }
        
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let collection = req.db;
      console.log(req.body._id);
      if(!req.body._id) res.json({ error: 'missing _id' });
      else{
      collection.deleteOne({ _id: new ObjectID(req.body._id) }, (removeErr, remove) => {
        if (removeErr){
           console.error(removeErr);
           res.json({ error: 'could not delete', '_id': req.body._id });
          //  console.log('hello1');
        }
        else {
          if(remove.deletedCount == 1){
          res.json({result:"successfully deleted",'_id':req.body._id});
          console.log(remove.deletedCount);
          }
          else{
          res.json({ error: 'could not delete', '_id': req.body._id })
          // console.log('hello3')
          }
        }
      })
      }
    });

};
