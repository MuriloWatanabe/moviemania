document.addEventListener('DOMContentLoaded', () => {
    const addReviewButton = document.querySelector('.add-review-button');
    const addDiaryEntryModal = document.getElementById('addDiaryEntryModal');
    const closeButton = addDiaryEntryModal.querySelector('.close-button');

    if (addReviewButton) {
        addReviewButton.addEventListener('click', () => {
            addDiaryEntryModal.style.display = 'block';
            const modalTitle = addDiaryEntryModal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = 'Adicionar Avaliação';
            }
            const form = addDiaryEntryModal.querySelector('form');
            if (form) {
                form.reset();
                document.getElementById('selectedMovieId').value = '';
                document.getElementById('movieSearchResults').innerHTML = '';
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            addDiaryEntryModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == addDiaryEntryModal) {
            addDiaryEntryModal.style.display = 'none';
        }
    });

    const movieSearchInput = document.getElementById('movieSearch');
    const movieSearchResults = document.getElementById('movieSearchResults');
    const selectedMovieIdInput = document.getElementById('selectedMovieId');

    if (movieSearchInput) {
        let searchTimeout;
        movieSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = movieSearchInput.value;
            if (query.length < 3) {
                movieSearchResults.innerHTML = '';
                return;
            }
            searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/search-movies?q=${encodeURIComponent(query)}`);
                    const movies = await response.json();
                    movieSearchResults.innerHTML = '';
                    if (movies.length > 0) {
                        movies.forEach(movie => {
                            const li = document.createElement('li');
                            li.textContent = `${movie.titulo} (${movie.ano_lancamento})`;
                            li.dataset.movieId = movie.id_filme;
                            li.addEventListener('click', () => {
                                movieSearchInput.value = movie.titulo;
                                selectedMovieIdInput.value = movie.id_filme;
                                movieSearchResults.innerHTML = '';
                            });
                            movieSearchResults.appendChild(li);
                        });
                    } else {
                        const li = document.createElement('li');
                        li.textContent = 'Nenhum filme encontrado.';
                        movieSearchResults.appendChild(li);
                    }
                } catch (error) {
                    console.error('Erro ao pesquisar filmes:', error);
                    movieSearchResults.innerHTML = '<li>Erro ao buscar filmes.</li>';
                }
            }, 300);
        });
    }

    const addDiaryEntryForm = document.getElementById('addDiaryEntryForm');
    if (addDiaryEntryForm) {
        addDiaryEntryForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const movieId = selectedMovieIdInput.value;
            const diaryDate = document.getElementById('diaryDate').value;
            const diaryRating = document.getElementById('diaryRating').value;
            const diaryNotes = document.getElementById('diaryNotes').value;

            if (!movieId || !diaryDate) {
                alert('Por favor, selecione um filme e a data.');
                return;
            }

            try {
                const response = await fetch('/user/add-diary-entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ movieId, diaryDate, diaryRating, diaryNotes })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    addDiaryEntryModal.style.display = 'none';
                    location.reload();
                } else {
                    alert(`Erro: ${result.message}`);
                }
            } catch (error) {
                console.error('Erro ao adicionar registro/review:', error);
                alert('Ocorreu um erro ao salvar a avaliação.');
            }
        });
    }
});