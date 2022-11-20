const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGO_DB)

const app = express()
let port = process.env.PORT;
if (port == null || port == "") {
  port = 9000;
}

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/public`))
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

const blogRouter = require('./routes/blogRouter')

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

app.listen(port, (req, res) => {
    console.log(`App is listening on port: ${port}`);
})