const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
   let id ;
  suite('POST /api/issues/{project}', function () {

    test('Every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/another')
        .send({
          issue_title: "Fix error in posting data",
          issue_text: "When we post data it has an error.",
          created_by: "Joe",
          assigned_to: "Joe",
          status_text: "In QA"
        })
        .end((err, res) => {
          id = res.body._id;
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json')
          assert.equal(res.body.issue_title, "Fix error in posting data");
          assert.equal(res.body.created_by, 'Joe');
          done();
        })
    })
    test('Only required field', function (done) {
      chai
        .request(server)
        .post('/api/issues/another')
        .send({
          issue_title: "Fix error in posting data",
          issue_text: "When we post data it has an error.",
          created_by: "Joe"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json')
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, '');
          done();
        })
    })
    test('Missing required field', function (done) {
      chai
        .request(server)
        .post('/api/issues/another')
        .send({
          assigned_to: "Joe",
          status_text: "In QA"
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json')
          assert.equal(res.body.error, "required field(s) missing");
          done();
        })
    })
  })
  suite('GET /api/issues/{project} view issu on a project', function () {
    test('No filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/project')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        })
    })

    test('One filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/project?open=true')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        })
    })

    test('Multiple filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/project?open=true&assigned_to=Joe')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        })
    })
  })
 
  suite('PUT /api/issues/{project} Update an issue', function () {
    
    test('Update one field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/another')
        .send({_id:id,open:false})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.equal(res.body.result,'successfully updated');
          done();
        })
    })

    test('Update multiple field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/another')
        .send({_id:id,issue_text:'hello',open:false})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.equal(res.body.result,'successfully updated');
          done();
        })
    })
    test('Update one field with missing id on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/another')
        .send({issue_text:'false',open:false})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.equal(res.body.error,'missing _id');
          done();
        })
    })
    test('Update one field on an without any field issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/another')
        .send({_id:id})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.equal(res.body.error,'no update field(s) sent');
          done();
        })
    })
    test('Update one field with invalid id on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/another')
        .send({_id:'v344394389',open:false})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.equal(res.body.error,'could not update');
        done();
        })
    })
    
    })

    suite('DELETE /api/issues/{project}',function(){
      test('Delete an issue',function(done){
        chai
          .request(server)
          .delete('/api/issues/another')
          .send({_id:id})
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.body.result,'successfully deleted');
          })
        done();
      })

      test('Delete an issue with invalid id',function(done){
        chai
          .request(server)
          .delete('/api/issues/another')
          .send({_id:id})
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.body.error,'could not delete');
          })
        done();
      })

      test('Delete an issue with missing id',function(done){
        chai
          .request(server)
          .delete('/api/issues/another')
          .send({})
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.body.error,'missing _id');
          })
        done();
      })
    })
});

// Update multiple fields on an issue: PUT request to /api/issues/{project}
// Update an issue with missing _id: PUT request to /api/issues/{project}
// Update an issue with no fields to update: PUT request to /api/issues/{project}
// Update an issue with an invalid _id: PUT request to /api/issues/{project}
// Delete an issue: DELETE request to /api/issues/{project}
// Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
// Delete an issue with missing _id: DELETE request to /api/issues/{project}
