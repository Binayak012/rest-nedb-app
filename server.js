const express = require('express');
const path = require('path');
const nedb = require('nedb-promises');

const app = express();
const PORT = 3000;
const db = nedb.create('mydb.jsonl');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/data',(req,res)=>{       // POST new doc, return its _id
    db.insert(req.body)          //   insert new doc into db
    .then(doc=>res.send({_id:doc._id})) // respond with its _id
    .catch(error=>res.send({error}));
});


app.get('/data',(req,res)=>{      // GET docs for given query
    const query = req.query;         //   find docs matching something
    db.find(query)
    .then(docs=>res.send(docs))   //   respond with docs
    .catch(error=>res.send({error}));
});


app.patch('/data/:id',(req,res)=>{  // PATCH (edit) doc by :id
    db.update(
        {_id: req.params.id},       // find doc with given :id
        { $set: req.body }          // update it with new data
    ).then(result=>res.send({result}))
    .catch(error=>res.send({error}));
});

app.delete('/data/:id',(req,res)=>{  // DELETE doc for given :id
    db.remove({_id: req.params.id})  //   remove matching doc
    .then(result=>res.send({result}))
    .catch(error=>res.send({error}));
});

app.put('/data/:id',(req,res)=>{    // PUT (replace) doc by :id
    db.update(
        {_id:req.params.id},        // find doc with given :id
        req.body                    // replace it with new data
    ).then(result=>res.send({result}))
    .catch(error=>res.send({error}));
});

