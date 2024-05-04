//const may not be allowed
const express = require('express'),
    morgan = require('morgan');

const app = express();
app.use(morgan('common'));

let topMovies = [
    {
        title: 'Adaptation',
        director: 'Spike Jonze'
    },
    {
        title: 'Eternal Sunshine of the Spotless Mind',
        director: 'Michel Gondry'
    },
    {
        title: 'Kiki\'s Delivery Service',
        director: 'Hayao Miyazaki'
    },
    {
        title: 'Scott Pilgrim vs. the World',
        director: 'Edgar Wright'
    },
    {
        title: 'Hot Fuzz',
        director: 'Edgar Wright'
    },
    {
        title: 'Spirited Away',
        director: 'Hayao Miyazaki'
    },
    {
        title: 'The Departed',
        director: 'Martin Scorcese'
    },
    {
        title: 'I Heart Huckabees',
        director: 'David O. Russell'
    },
    {
        title: 'Memories of Murder',
        director: 'Bong Joon-ho'
    },
    {
        title: 'Redline',
        director: 'Takeshi Koike'
    }
];

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});

// Because of express.static('public), adding the full file path isn't necessary.
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Gets the list of data about all movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Gets the data about a single movie (by title)
app.get('/movies/:title', (req, res) => {
    res.json(topMovies.find((movie) => {
        return movie.title === req.params.title
    }));
});

// Gets the data about a genre by name of genre
app.get('/movies/genres/:genre', (req, res) => {
    // res.json(genres.find((genre) => {
    //     //tbd
    // }));
    res.send('Data about genre goes here');
});

// Get data about a director (bio, birth year, death year) by name;
app.get('/movies/directors/:director', (req, res) => {
    // res.json(directors.find((director) => {
    //     // to be expanded upon
    // }));
    res.send('Data about director goes here');
});

// Allow new users to register
app.post('/users', (req, res) => {
    let newUser = req.body;

    if (!newUser)
        {
            const message = 'Missing info in request body';
            res.status(400).send(message);
        } else {
            newUser.id = uuid.v4();
            users.push(newUser);
            res.status(201).send(newUser);
        }
});

// Allow users to update their user info (username);
app.put('/users/:user/:username', (req, res) => {
    res.send('Username updated.');
    // to be expanded upon
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added - more on this later);
app.put('/movies/favorites/:title', (req, res) => {
    res.send('Movie added to favorites.');
    // to be expanded upon
});

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed - more on this later);
app.delete('/movies/favorites/:title', (req, res) => {
    res.send('Movie removed from favorites.');
    // to be expanded upon
});

// Allow existing users to deregister (showing only a text that a user email has been removed - more on this later).
app.delete('/users/:id', (req, res) => {
    res.send('User email removed.');
    // to be expanded upon
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
