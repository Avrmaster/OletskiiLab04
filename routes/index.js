const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    const {db} = require('../app');
    db.any('SELECT * FROM posts;')
        .then(data => (
            res.send({success: true, data: data})
        ))
        .catch(err => (
            console.error(err),
                res.send({success: false, error: err})
        ));
});

router.post('/updates', function (req, res) {
    const {lastId: lastPostId} = req.body;
    const {db} = require('../app');
    db.any('SELECT * FROM posts WHERE id > $1;', [lastPostId])
        .then(data => (
            data.length > 0
                ? (
                    console.log('Returning updates since id', lastPostId),
                        res.send({success: true, data: data})
                )
                : res.send({success: false})
        ))
        .catch(console.error);
});

module.exports = router;
