const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

//
require('dotenv').config()

mongoose.connect(process.env.MONGO_DB)

const app = express()
let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}

/* MIDDLEWARE */
// Set the view engine using EJS
app.set('view engine', 'ejs')
// Parse JSON
app.use(bodyParser.urlencoded({ extended: true }))
// Load CSS for EJS pages
app.use(express.static(`${__dirname}/public`))
// Include headers 
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

// Calls the router
const blogRouter = require('./routes/blogRouter');
const noteRouter = require ('./routes/noteRouter');

// USER
//Home page
app.get('/', blogRouter)

app.get('/blog/:slug', blogRouter)

// ADMIN
// Read blogpost
app.get('/admin', blogRouter)

// Create blogpost
app.get('/admin/new', blogRouter)
app.post('/admin/new', blogRouter)

// Edit blogpost
app.get('/admin/edit/:id', blogRouter)
app.post('/admin/edit/:id', blogRouter)

// Delete blogpost
app.post('/admin/delete/:id', blogRouter)

// API
app.get('/api/blog', blogRouter)
app.get('/api/blog/latest', blogRouter)
app.get('/api/note', noteRouter)
app.post('/api/note', noteRouter)

// Start the app
app.listen(port, (req, res) => {
    console.log(`App is listening on port: ${port}`);
})