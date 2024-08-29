const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    { check, validationResult } = require('express-validator');


require('dotenv').config();
const app = express();

const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://myflixproject2024.netlify.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        // The below line means "if a specific origin isn't found on the list of allowed origins"
        if (allowedOrigins.indexOf(origin) === -1) { 
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));


let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');


const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Directors;

//local
// mongoose.connect('mongodb://localhost:27017/movieMongoDB', { useNewUrlParser: true, useUnifiedTopology: true });
//heroku
mongoose.connect(process.env.CONNECTION_URI).then(() => {
    console.log('Database connected successfully');
  }).catch(err => {
    console.error('Database connection error:', err);
  });

//logger middleware
app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});

// app.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
//     res.send("Welcome to my movie database.");
//   });


// Because of express.static('public), adding the full file path isn't necessary.
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});


app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        })
});

app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        })
});

// Gets the data about a genre by name of genre
app.get('/movies/genres/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genre })
        .then((movie) => {
            res.status(201).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        })
});

// Get data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.director })
        .then((movie) => {
            res.status(201).json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        })
});



// Get specific user
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(403).send('Access forbidden: You can only access your own information.');
    }
    else {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  BirthDate: Date
}*/
// Note: Do not authenticate here, obviously
// Allow new users to register
app.post('/users',
    [
        check('Username', 'Minimum username length of 5 characters').isLength({ min: 5 }),
        check('Username', 'Username must contain only alphanumeric characters').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'What you have entered does not appear to be in a valid email format').isEmail()
    ],
    async (req, res) => {

        //check the validation object for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + ' already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            BirthDate: req.body.BirthDate
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// Allow users to update their user info (by username);
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  BirthDate: Date
}*/
app.put('/users/:Username', 
    [
        check('Username', 'Minimum username length of 5 characters').isLength({ min: 5 }),
        check('Username', 'Username must contain only alphanumeric characters').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'What you have entered does not appear to be in a valid email format').isEmail()
    ], 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);

        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
        Users.findOneAndUpdate({ Username: req.params.Username },
            {
                $set:
                {
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    BirthDate: req.body.BirthDate
                }
            },
            { new: true }) // This lines makes sure the updated document is returned
            .then((updatedUser) => {
                res.status(201).json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            })
    });

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added - more on this later);
app.put('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $addToSet: { FavoriteMovies: req.params.MovieID }
        },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed - more on this later);
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID }
        },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow existing users to deregister (showing only a text that a user email has been removed - more on this later).
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
