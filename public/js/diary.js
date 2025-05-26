document.addEventListener('DOMContentLoaded', () => {
    const addMovieButton = document.querySelector('.add-movie-button');
    const modal = document.getElementById('addDiaryEntryModal');
    const closeButton = modal.querySelector('.close-button');
    const movieSearchInput = document.getElementById('movieSearch');
    const movieSearchResults = document.getElementById('movieSearchResults');
    const selectedMovieIdInput = document.getElementById('selectedMovieId');
    const addDiaryEntryForm = document.getElementById('addDiaryEntryForm');

    // Abre o modal
    if (addMovieButton) {
        addMovieButton.addEventListener('click', () => {
            modal.style.display = 'flex'; // Use flex para centralizar
            // Preenche a data atual por padrão
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexed
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('diaryDate').value = `${year}-${month}-${day}`;
        });
    }

    // Fecha o modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        resetModalForm();
    });

    // Fecha o modal ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            resetModalForm();
        }
    });

    // Função para resetar o formulário do modal
    function resetModalForm() {
        addDiaryEntryForm.reset();
        selectedMovieIdInput.value = '';
        movieSearchResults.innerHTML = ''; // Limpa os resultados da pesquisa
    }

    // Lógica de pesquisa de filmes (autocompletar)
    let searchTimeout;
    movieSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = movieSearchInput.value.trim();

        if (query.length < 3) { // Começa a pesquisar após 3 caracteres
            movieSearchResults.innerHTML = '';
            selectedMovieIdInput.value = '';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search-movies?q=${encodeURIComponent(query)}`);

                if (!response.ok) {
                    // Adiciona um log mais detalhado para depuração se a resposta não for OK
                    console.error('Erro na resposta da API de busca de filmes:', response.status, response.statusText);
                    const errorData = await response.json();
                    console.error('Detalhes do erro da API:', errorData);
                    movieSearchResults.innerHTML = `<li style="color: red;">Erro ao carregar filmes: ${errorData.message || response.statusText}</li>`;
                    return;
                }

                const movies = await response.json();
                
                // Log para verificar os dados recebidos da API
                console.log('Filmes recebidos da API:', movies);

                movieSearchResults.innerHTML = ''; // Limpa resultados anteriores

                if (movies.length > 0) {
                    movies.forEach(movie => {
                        const li = document.createElement('li');
                        li.textContent = `${movie.titulo} (${movie.ano_lancamento})`;
                        li.dataset.movieId = movie.id_filme;
                        li.dataset.movieTitle = movie.titulo;
                        li.addEventListener('click', () => {
                            movieSearchInput.value = movie.titulo; // Preenche o input
                            selectedMovieIdInput.value = movie.id_filme; // Armazena o ID
                            movieSearchResults.innerHTML = ''; // Esconde os resultados
                        });
                        movieSearchResults.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'Nenhum filme encontrado.';
                    movieSearchResults.appendChild(li);
                }

            } catch (error) {
                console.error('Erro ao pesquisar filmes (frontend):', error);
                movieSearchResults.innerHTML = '<li style="color: red;">Ocorreu um erro na pesquisa.</li>';
            }
        }, 300); // Debounce de 300ms
    });

    // Envio do formulário
    addDiaryEntryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const movieId = selectedMovieIdInput.value;
        const diaryDate = document.getElementById('diaryDate').value;
        const diaryRating = document.getElementById('diaryRating').value;
        const diaryNotes = document.getElementById('diaryNotes').value;

        if (!movieId) {
            alert('Por favor, selecione um filme da lista de pesquisa.');
            return;
        }
        if (!diaryDate) {
            alert('Por favor, selecione a data em que você assistiu o filme.');
            return;
        }

        try {
            const response = await fetch('/user/add-diary-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    movieId,
                    diaryDate,
                    diaryRating: diaryRating || null, // Envia null se não houver avaliação
                    diaryNotes
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                modal.style.display = 'none';
                resetModalForm();
                // Opcional: recarregar a página ou atualizar a lista do diário
                window.location.reload(); 
            } else {
                alert(result.message || 'Erro ao adicionar registro ao diário.');
            }
        } catch (error) {
            console.error('Erro ao enviar registro do diário:', error);
            alert('Ocorreu um erro ao adicionar o registro. Tente novamente.');
        }
    });
});