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
        director: 'David O. Russel'
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

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
