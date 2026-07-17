// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    const capturarBtn = document.getElementById('capturarBtn');
    const locStatus = document.getElementById('locStatus');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const salvarBtn = document.getElementById('salvarBtn');

    // Verifica se os elementos essenciais existem
    if (!capturarBtn || !locStatus || !latInput || !lonInput) {
        console.error('Elementos de localização não encontrados!');
        return;
    }

    capturarBtn.addEventListener('click', () => {
        if (!('geolocation' in navigator)) {
            locStatus.textContent = 'Geolocalização não é suportada neste navegador.';
            locStatus.className = 'status err';
            return;
        }

        locStatus.textContent = 'Obtendo localização...';
        locStatus.className = 'status';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                latInput.value = pos.coords.latitude.toFixed(6);
                lonInput.value = pos.coords.longitude.toFixed(6);
                locStatus.textContent = `Localização capturada (precisão: ${Math.round(pos.coords.accuracy)} m)`;
                locStatus.className = 'status ok';
            },
            (err) => {
                locStatus.textContent = 'Não foi possível obter a localização: ' + err.message;
                locStatus.className = 'status err';
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    // Verifica se o botão salvar existe antes de adicionar o evento
    if (salvarBtn) {
        salvarBtn.addEventListener('click', () => {
            const registro = {
                latitude: latInput.value,
                longitude: lonInput.value,
                objeto: document.getElementById('objeto-medido')?.value || '',
                br: document.getElementById('br')?.value || '',
                km: document.getElementById('km')?.value || '',
                altura1: document.getElementById('altura1')?.value || '',
                altura2: document.getElementById('altura2')?.value || '',
                altura3: document.getElementById('altura3')?.value || '',
                alturaAdicional: document.getElementById('alturaAdicional')?.value || '',
                largura1: document.getElementById('largura1')?.value || '',
                largura2: document.getElementById('largura2')?.value || '',
                largura3: document.getElementById('largura3')?.value || '',
                larguraAdicional: document.getElementById('larguraAdicional')?.value || ''
            };
            console.log('Registro:', registro);
            alert('Registro salvo (por enquanto só no console — próximo passo é persistir isso de verdade).');
        });
    } else {
        console.error('Botão "salvarBtn" não encontrado!');
    }
});