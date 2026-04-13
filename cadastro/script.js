function validarSenha() {
    const senha = document.getElementById('password').value;
    const barra = document.getElementById('forca-senha');
    const texto = document.getElementById('texto-forca');
    let forca = 0;

    if (senha.length === 0) {
        barra.style.width = '0%';
        texto.innerText = '';
        return;
    }

    // Critérios
    if (senha.length >= 8) forca += 25;
    if (senha.match(/[a-z]/) && senha.match(/[A-Z]/)) forca += 25;
    if (senha.match(/[0-9]/)) forca += 25;
    if (senha.match(/[^a-zA-Z0-9]/)) forca += 25;

    barra.style.width = forca + '%';

    // Cores e Mensagens
    if (forca <= 25) {
        barra.style.backgroundColor = '#ff4d4d';
        texto.innerText = 'Senha Fraca 🔴';
        texto.style.color = '#ff4d4d';
    } else if (forca === 50) {
        barra.style.backgroundColor = '#ffd11a';
        texto.innerText = 'Senha Média 🟡';
        texto.style.color = '#ffd11a';
    } else if (forca === 75) {
        barra.style.backgroundColor = '#4CAF50';
        texto.innerText = 'Senha Forte 🟢';
        texto.style.color = '#4CAF50';
    } else if (forca === 100) {
        barra.style.backgroundColor = '#2d5a27';
        texto.innerText = 'Senha Super Forte! 💪';
        texto.style.color = '#2d5a27';
    }
}

//Função visibilidade senha

function setupPasswordToggle(toggleId, inputId) {
    const toggleBtn = document.getElementById(toggleId);
    const inputField = document.getElementById(inputId);

    if (toggleBtn && inputField){
        toggleBtn.addEventListener('click', function(){
            const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
            inputField.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

setupPasswordToggle('togglePassword', 'password');
setupPasswordToggle('toggleConfirmPassword', 'confirm-password');