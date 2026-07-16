const capturarBtn = document.getElementById('capturarBtn');
const locStatus = document.getElementById('locStatus');
const latInput = document.getElementById('latitude');
const lonInput = document.getElementById('longitude');

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

document.getElementById('salvarBtn').addEventListener('click', () => {
  const registro = {
    latitude: latInput.value,
    longitude: lonInput.value,
    br: document.getElementById('br').value,
    km: document.getElementById('km').value,
    altura1: document.getElementById('altura1').value,
    altura2: document.getElementById('altura2').value,
    altura3: document.getElementById('altura3').value,
    alturaAdicional: document.getElementById('alturaAdicional').value,
  };
  console.log('Registro:', registro);
  alert('Registro salvo (por enquanto só no console — próximo passo é persistir isso de verdade).');
});