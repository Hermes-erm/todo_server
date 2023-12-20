require('dotenv').config();
const connection = require('./connection');
const https = require('https')
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

function queryDB(query, callback) {
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error querying database:', error);
            return;
        }
        callback(results)
    })
}

app.get('/read', (req, res) => {
    queryDB('SELECT * FROM todo_items', (data) => {
        res.send(data);
    })
});

app.post('/write', (req, res) => {
    let data = req.body.val
    queryDB(`INSERT INTO todo_items (ttext,pending) VALUES ('${data}',true)`, () => {
        queryDB('SELECT LAST_INSERT_ID()', (ID) => {
            let id = ID[0]['LAST_INSERT_ID()']
            res.send({
                id,
                ttext: data,
                pending: 1
            })
        })
    })
});

app.delete('/delete/:id', (req, res) => {
    let id = req.params.id;
    queryDB(`delete from todo_items where id = ${id}`, (data) => {
        res.sendStatus(200);
    });
})

app.delete('/update/:id', (req, res) => {
    let id = req.params.id;
    queryDB(`update todo_items set pending = 0 where id = ${id};`, (data) => {
        res.sendStatus(201);
    })
})

app.listen(process.env.PORT, () => console.log('Everything alright!'));