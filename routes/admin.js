const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    const {db} = require('../app');
    /* Retrieve users list */
    db.any('SELECT * FROM posts;')
        .then(data =>
            res.render('admin', {title: 'Dashboard', data: data}),
        )
        .catch(err => (
            console.error(err),
                res.render('error', {message: 'DB error occurred on server side', error: err})
        ));
});

router.post('/', function (req, res) {
    const {db} = require('../app');
    const {author, title, text} = req.body;
    db.one('INSERT INTO posts (title, body, author) VALUES ($1, $2, $3) RETURNING id;', [title, text, author])
        .then(data => (
            console.log('New post was created' + data.id),
                res.redirect('/admin')
        ))
        .catch(err => (
            console.error(err),
                res.redirect('/admin')
        ));
});

module.exports = router;
