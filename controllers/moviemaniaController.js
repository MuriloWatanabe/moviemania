exports.getHome = (req, res) => {
  res.render('index', { title: 'Bem-vindo ao MovieMania!' });
};

exports.getMovies = (req, res) => {
  const movies = [
    { id: 1, title: 'Inception', year: 2010 },
    { id: 2, title: 'The Matrix', year: 1999 },
    { id: 3, title: 'Interstellar', year: 2014 }
  ];
  res.json(movies);
};

exports.getMovieDetails = (req, res) => {
  const movieId = req.params.id;
  const movie = { id: movieId, title: 'Inception', year: 2010, director: 'Christopher Nolan' };
  res.json(movie);
};