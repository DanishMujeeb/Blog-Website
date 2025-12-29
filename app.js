const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

let username = "";
let password = "";
let searchedUser = "";

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://danishmujeeb51_db_user:4mKLoR0YKO7qLAHl@cluster0.hcih97e.mongodb.net/?appName=Cluster0");

const usersPostsSchema = {
    title: String,
    content: String
};

const userPost = mongoose.model("userPost", usersPostsSchema);

const usersSchema = {
    username: String,
    password: String,
    posts: [usersPostsSchema]
};

const User = mongoose.model("User", usersSchema);

app.get("/", function(req, res) {
    res.render("login", {error1: ""});
});

app.get("/signup", function(req, res) {
    res.render("signup", {error2: ""});
});

app.post("/signup", function(req, res) {
    res.render("signup", {error2: ""});
});

app.post("/", async function(req, res) {
    try {
        username = req.body.usrName;
        password = req.body.pass;
        const login = await User.findOne({username: username, password: password});
        if(login == null)
            res.render("login", {error1: "This is an invalid login"});
        else
            res.redirect("/home");
    } catch (err) {
        console.log(err);
    }
});

app.post("/createAccount", async function(req, res) {
    try {
        username = req.body.usrName2;
        password = req.body.pass2;
        const user = await User.findOne({username: username});
        if(user != null) 
            res.render("signup", {error2: "This username already exist"});
        else {
            const user1 = new User({
                username: username,
                password: password,
                posts: []
            });
            user1.save();
            res.redirect("/home");
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/home", async function(req, res) {
    try {
        searchedUser = "";
        const document = await User.findOne({username: username, password: password});
        res.render("home", {posts: document.posts, username: username});
    } catch (err) {
        console.log(err)
    }
});

app.get("/compose", function(req, res) {
    res.render("compose");
});

app.get("/posts/:postId", async function(req, res) {
    try {
        let document = {};
        if(searchedUser == "") 
            document = await User.findOne({username: username, password: password});
        else 
            document = await User.findOne({username: searchedUser});
        document.posts.forEach(function(post) {
            if(post._id == req.params.postId) 
                res.render("post", {post: post, searchedUser: searchedUser}); 
        });
    } catch (err) {
        console.log(err)
    }
});

app.post("/compose", async function(req, res) {
    try{
        const userPost1 = new userPost({
            title: req.body.title,
            content: req.body.content
        })
        const document = await User.findOne({username: username, password: password});
        document.posts.push(userPost1);
        document.save();
        res.redirect("/home");
    } catch (err) {
        console.log(err);
    }
});

app.post("/delete", async function(req, res) {
    try {
        const postId = req.body.id;
        await User.findOneAndUpdate({username: username}, {$pull: {posts: {_id: postId}}});
        res.redirect("/home");
    } catch (err) {
        console.log(err)
    }
});

app.post("/search", async function(req, res) {
    try {
        searchedUser = req.body.searchedUser;
        const document = await User.findOne({username: searchedUser});
        res.render("home", {posts: document.posts, username: searchedUser});
    } catch (err) {
        console.log(err)
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server has started successfully");
});