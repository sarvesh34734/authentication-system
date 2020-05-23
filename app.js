const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const db = require("./config/mongoose");
// used for session cookie passport local strategy
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const mongoStore = require("connect-mongo")(session);
const ejs = require("ejs");
const expressLayouts = require('express-ejs-layouts');
const sassMiddleware = require('node-sass-middleware');
const flash = require("connect-flash");
const customMware = require("./config/middleware");
// const nocache = require("nocache");

// use nocache
// app.use(nocache());



// url encoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// sass middleware
app.use(sassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static('./assets'));

app.use(expressLayouts);
// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');




// setting up session
app.use(session({
    name: "authenticator",
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: new mongoStore(
        {
            mongooseConnection: db,
            autoremove: "disabled"
        },
        function (err) {
            console.log(err || "connect-mongo setup ok");
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

// use flash
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/', require('./routes'));


app.listen(process.env.PORT, function (err) {
    if (err) {
        console.log(err);
    }
    console.log(`server is running on port ${process.env.PORT}`);
})