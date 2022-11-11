const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)
require('dotenv').config()

mongoose.connect(process.env.MONGO_DB)

const app = express()
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
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

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    auth: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

blogSchema.pre('validate', function(next) {
    if(this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
       }
    
       if(this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked.parse(this.markdown))
       }
    
       next()
})

const Blog = mongoose.model('Article', blogSchema)

// USER
//Home page
app.get('/', async (req, res) => {
    try{
        const blogPosts = await Blog.find().sort({ createdAt: -1 })
        res.render('index', { blogPosts: blogPosts })
    } catch(err) {
        res.send(err)
    }
})

app.get('/blog/:slug', async (req, res) => {
    try {
        const blogPost = await Blog.findOne({ slug: req.params.slug })
        res.render('blogpost', { blogPost: blogPost })
    } catch (error) {
        res.send(error)
    }
})

// ADMIN
// Read blogpost
app.get('/admin', async (req, res) => {
    try{
        const blogPosts = await Blog.find().sort({ createdAt: -1 })
        res.render('dashboard', { blogPosts: blogPosts })
    } catch(err) {
        res.send(err)
    }
})

// Create blogpost
app.get('/admin/new', (req, res) => {
    res.render('new', { blogPost: new Blog({}) })
})
app.post('/admin/new', async (req, res) => {
    if (req.body.password === process.env.PASSWORD) {
        const newBlogPost = new Blog({
            title: req.body.title,
            auth: req.body.auth,
            markdown: req.body.markdown
        })
        try {
            const blogPost = await newBlogPost.save()
            res.redirect('/admin?post=success')
        } catch (error) {
            console.error(error);
        }
    } else {
        res.redirect('/?authorized=false')
    }
})

// Edit blogpost
app.get('/admin/edit/:id', async (req, res) => {
    try {
        const blogPost = await Blog.findOne({ _id: req.params.id })
        res.render('edit', { blogPost: blogPost })
    } catch (error) {
        console.error(error);
    }
})
app.post('/admin/edit/:id', async (req, res) => {
    if (req.body.password === process.env.PASSWORD) {
        try {
            const blogPost = await Blog.updateOne({ _id: req.params.id }, { $set: req.body })
            res.redirect('/admin?update=success')
        } catch (error) {
            console.error(error);
        }
    } else {
        res.redirect('/?authorized=false')
    }
})

// Delete blogpost
app.post('/admin/delete/:id', async (req, res) => {
    if (req.body.password === process.env.PASSWORD) {
        try {
            const blogPost = await Blog.deleteOne({ _id: req.params.id })
            res.redirect('/admin?delete=success')
        } catch (error) {
            res.send(error)
        }
    } else {
        res.redirect('/?authorized=false')
    }
})

// API
app.route('/api/blog')
.get((req, res) => {
    Blog.find((err, blogPosts) => {
        if(!err) {
            res.send(blogPosts)
        } else {
            res.send(err)
        }
    })
})

app.listen(port, (req, res) => {
    console.log(`App is listening on port: ${port}`);
})