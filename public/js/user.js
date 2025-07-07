document.getElementById('openAddListModal').onclick = function(e) {
  e.preventDefault();
  document.getElementById('addListModal').style.display = 'block';
};
document.getElementById('closeAddListModal').onclick = function() {
  document.getElementById('addListModal').style.display = 'none';
};
document.getElementById('addListForm').onsubmit = async function(e) {
  e.preventDefault();
  const nomeLista = document.getElementById('nomeLista').value;
  const res = await fetch('/user/listas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome_lista: nomeLista })
  });
  const data = await res.json();
  if (res.ok) {
    alert('Lista criada com sucesso!');
    location.reload();
  } else {
    alert(data.message || 'Erro ao criar lista.');
  }
};