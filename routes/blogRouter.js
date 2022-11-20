const express = require('express')
const router = express.Router()

const Blog = require('../models/blogSchema')

// USER
//Home page
router.get('/', async (req, res) => {
    try{
        const blogPosts = await Blog.find().sort({ createdAt: -1 })
        res.render('index', { blogPosts: blogPosts })
    } catch(err) {
        res.send(err)
    }
})

router.get('/blog/:slug', async (req, res) => {
    try {
        const blogPost = await Blog.findOne({ slug: req.params.slug })
        res.render('blogpost', { blogPost: blogPost })
    } catch (error) {
        res.send(error)
    }
})

// ADMIN
// Read blogpost
router.get('/admin', async (req, res) => {
    try{
        const blogPosts = await Blog.find().sort({ createdAt: -1 })
        res.render('dashboard', { blogPosts: blogPosts })
    } catch(err) {
        res.send(err)
    }
})

// Create blogpost
router.get('/admin/new', (req, res) => {
    res.render('new', { blogPost: new Blog({}) })
})
router.post('/admin/new', async (req, res) => {
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
router.get('/admin/edit/:id', async (req, res) => {
    try {
        const blogPost = await Blog.findOne({ _id: req.params.id })
        res.render('edit', { blogPost: blogPost })
    } catch (error) {
        console.error(error);
    }
})
router.post('/admin/edit/:id', async (req, res) => {
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
router.post('/admin/delete/:id', async (req, res) => {
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
router.route('/api/blog')
.get((req, res) => {
    Blog.find((err, blogPosts) => {
        if(!err) {
            res.send(blogPosts)
        } else {
            res.send(err)
        }
    })
})

module.exports = router