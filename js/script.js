document.addEventListener('DOMContentLoaded', function() {
    // ============ ELEMENTOS ============
    const capturarBtn = document.getElementById('capturarBtn');
    const locStatus = document.getElementById('locStatus');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const horaInput = document.getElementById('hora');
    const salvarBtn = document.getElementById('salvarBtn');
    const gerarRelatorioBtn = document.getElementById('gerarRelatorioBtn');
    const limparRegistrosBtn = document.getElementById('limparRegistrosBtn');

    const btnAltura = document.getElementById('btnAltura');
    const btnLargura = document.getElementById('btnLargura');
    const btnDiversos = document.getElementById('btnDiversos');
    
    const cardAlturas = document.getElementById('cardAlturas');
    const cardLarguras = document.getElementById('cardLarguras');
    const cardDiversos = document.getElementById('cardDiversos');

    const fotosInput = document.getElementById('fotosInput');
    const fotosPreview = document.getElementById('fotosPreview');
    const fotosStatus = document.getElementById('fotosStatus');
    
    // ============ VARIÁVEIS ============
    // Fotos atuais (para preview)
    let imagensPreview = [];
    // Array para armazenar todos os registros
    let registros = [];

    // ============ FUNÇÃO PARA OBTER HORA ATUAL ============
    function obterHoraAtual() {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const segundos = String(agora.getSeconds()).padStart(2, '0');
        return `${horas}:${minutos}:${segundos}`;
    }

    // ============ FUNÇÃO PARA OBTER DATA COMPLETA ============
    function obterDataHoraCompleta() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const segundos = String(agora.getSeconds()).padStart(2, '0');
        return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
    }

    // ============ FUNÇÃO PARA CAPTURAR LOCALIZAÇÃO E HORA ============
    function capturarLocalizacaoEHora() {
        horaInput.value = obterHoraAtual();

        if (!('geolocation' in navigator)) {
            locStatus.textContent = '❌ Geolocalização não é suportada neste navegador.';
            locStatus.className = 'status err';
            return;
        }

        locStatus.textContent = '⏳ Obtendo localização...';
        locStatus.className = 'status';

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                latInput.value = pos.coords.latitude.toFixed(6);
                lonInput.value = pos.coords.longitude.toFixed(6);
                horaInput.value = obterHoraAtual();
                locStatus.textContent = `✅ Localização capturada (precisão: ${Math.round(pos.coords.accuracy)} m)`;
                locStatus.className = 'status ok';
            },
            (err) => {
                locStatus.textContent = '❌ Não foi possível obter a localização: ' + err.message;
                locStatus.className = 'status err';
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // ============ 1. LOCALIZAÇÃO E HORA AUTOMÁTICA AO CARREGAR ============
    capturarLocalizacaoEHora();

    // ============ 2. BOTÃO CAPTURAR MANUAL ============
    capturarBtn.addEventListener('click', capturarLocalizacaoEHora);

    // ============ 3. ALTERNAR CARDS DE MEDIÇÃO ============
    function mostrarCard(tipo) {
        document.querySelectorAll('.btn-medicao').forEach(btn => {
            btn.classList.remove('ativo');
        });

        cardAlturas.style.display = 'none';
        cardLarguras.style.display = 'none';
        cardDiversos.style.display = 'none';

        if (tipo === 'altura') {
            cardAlturas.style.display = 'block';
            btnAltura.classList.add('ativo');
        } else if (tipo === 'largura') {
            cardLarguras.style.display = 'block';
            btnLargura.classList.add('ativo');
        } else if (tipo === 'diversos') {
            cardDiversos.style.display = 'block';
            btnDiversos.classList.add('ativo');
        }
    }

    btnAltura.addEventListener('click', () => mostrarCard('altura'));
    btnLargura.addEventListener('click', () => mostrarCard('largura'));
    btnDiversos.addEventListener('click', () => mostrarCard('diversos'));

    // ============ 4. FUNÇÕES DE UPLOAD DE FOTOS ============
    function converterImagemParaBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject('Erro ao ler a imagem');
            reader.readAsDataURL(file);
        });
    }

    function exibirPreview(imagens) {
        fotosPreview.innerHTML = '';
        
        imagens.forEach((imgData, index) => {
            const div = document.createElement('div');
            div.className = 'foto-item';
            
            const img = document.createElement('img');
            img.src = imgData;
            img.alt = `Foto ${index + 1}`;
            
            const btnRemover = document.createElement('button');
            btnRemover.className = 'foto-remover';
            btnRemover.textContent = '×';
            btnRemover.title = 'Remover foto do preview';
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                removerImagemPreview(index);
            });
            
            const numero = document.createElement('span');
            numero.className = 'foto-numero';
            numero.textContent = `#${index + 1}`;
            
            div.appendChild(img);
            div.appendChild(btnRemover);
            div.appendChild(numero);
            fotosPreview.appendChild(div);
        });

        if (imagens.length === 0) {
            fotosStatus.textContent = 'Nenhuma foto no preview';
            fotosStatus.className = 'fotos-status';
        } else {
            fotosStatus.textContent = `✅ ${imagens.length} foto(s) no preview (máx: 200)`;
            fotosStatus.className = 'fotos-status ok';
        }
    }

    // Remove do preview (mas NÃO do registro)
    function removerImagemPreview(index) {
        imagensPreview.splice(index, 1);
        exibirPreview(imagensPreview);
    }

    // Limpa o preview (mas NÃO os registros)
    function limparPreview() {
        imagensPreview = [];
        exibirPreview(imagensPreview);
    }

    // Upload de fotos
    if (fotosInput) {
        fotosInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            const maxFotos = 200;
            const maxSizeMB = 5;

            if (imagensPreview.length + files.length > maxFotos) {
                fotosStatus.textContent = `❌ Máximo de ${maxFotos} fotos no preview`;
                fotosStatus.className = 'fotos-status err';
                fotosInput.value = '';
                return;
            }

            const filesValidos = files.filter(file => {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    fotosStatus.textContent = `❌ A imagem "${file.name}" excede ${maxSizeMB}MB`;
                    fotosStatus.className = 'fotos-status err';
                    return false;
                }
                return true;
            });

            if (filesValidos.length === 0) {
                fotosInput.value = '';
                return;
            }

            try {
                fotosStatus.textContent = '⏳ Processando imagens...';
                fotosStatus.className = 'fotos-status';

                for (const file of filesValidos) {
                    const base64 = await converterImagemParaBase64(file);
                    imagensPreview.push(base64);
                }

                exibirPreview(imagensPreview);
                fotosInput.value = '';

            } catch (error) {
                fotosStatus.textContent = '❌ Erro ao processar imagens: ' + error;
                fotosStatus.className = 'fotos-status err';
            }
        });
    }

    // ============ 5. FUNÇÃO PARA COLETAR REGISTRO ATUAL ============
    function coletarRegistroAtual() {
        // Copia as imagens do preview para o registro
        const fotosDoRegistro = [...imagensPreview];
        
        return {
            dataHora: obterDataHoraCompleta(),
            hora: horaInput.value,
            latitude: latInput.value,
            longitude: lonInput.value,
            br: document.getElementById('br')?.value || '',
            km: document.getElementById('km')?.value || '',
            objeto: document.getElementById('objeto-medido')?.value || '',
            altura1: document.getElementById('altura1')?.value || '',
            altura2: document.getElementById('altura2')?.value || '',
            altura3: document.getElementById('altura3')?.value || '',
            alturaAdicional: document.getElementById('alturaAdicional')?.value || '',
            largura1: document.getElementById('largura1')?.value || '',
            largura2: document.getElementById('largura2')?.value || '',
            largura3: document.getElementById('largura3')?.value || '',
            larguraAdicional: document.getElementById('larguraAdicional')?.value || '',
            diversosLabel: document.getElementById('diversosLabel')?.value || '',
            diversosTexto: document.getElementById('diversosTexto')?.value || '',
            fotos: fotosDoRegistro,
            totalFotos: fotosDoRegistro.length
        };
    }

    // ============ 6. BOTÃO SALVAR REGISTRO ============
    if (salvarBtn) {
        salvarBtn.addEventListener('click', () => {
            const registro = coletarRegistroAtual();
            registros.push(registro);
            
            console.log(`📋 Registro #${registros.length} salvo:`, registro);
            console.log(`📊 Total de registros: ${registros.length}`);
            console.log(`📸 Fotos no registro: ${registro.totalFotos}`);
            
            alert(`✅ Registro #${registros.length} salvo com sucesso!\n🕐 Hora: ${registro.hora}\n📸 Fotos: ${registro.totalFotos}`);
            
            // Limpa o preview após salvar
            limparPreview();
        });
    }

    // ============ 7. GERAR RELATÓRIO POWERPOINT ============
    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', function() {
            if (registros.length === 0) {
                alert('❌ Nenhum registro para gerar relatório! Salve pelo menos um registro primeiro.');
                return;
            }

            try {
                if (typeof PptxGenJS === 'undefined') {
                    alert('❌ Biblioteca PptxGenJS não carregada. Verifique sua conexão com a internet.');
                    return;
                }

                const pptx = new PptxGenJS();
                pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
                pptx.layout = 'WIDE';

                // Define as dimensões das imagens (em centímetros)
                const larguraCm = 11.39;
                const alturaCm = 8.7;
                // Converte para polegadas (1 cm = 0.393701 polegadas)
                const larguraPol = larguraCm * 0.393701;
                const alturaPol = alturaCm * 0.393701;

                // Para cada registro, cria um slide
                registros.forEach((registro, index) => {
                    const slide = pptx.addSlide();

                    // Título do slide
                    slide.addText(`Registro #${index + 1} - ${registro.objeto || 'Sem objeto'}`, {
                        x: 0.5,
                        y: 0.3,
                        w: '90%',
                        h: 0.8,
                        fontSize: 24,
                        fontFace: 'Arial',
                        color: '1A237E',
                        bold: true,
                        align: 'center'
                    });

                    // Informações do registro (lado esquerdo)
                    const infoY = 1.3;
                    const infoText = `
                        📅 Data/Hora: ${registro.dataHora}
                        📍 Latitude: ${registro.latitude || 'N/A'}
                        📍 Longitude: ${registro.longitude || 'N/A'}
                        🛣️ Via: ${registro.br || 'N/A'}
                        📏 KM: ${registro.km || 'N/A'}
                        📐 Altura 1: ${registro.altura1 || 'N/A'} m
                        📐 Altura 2: ${registro.altura2 || 'N/A'} m
                        📐 Altura 3: ${registro.altura3 || 'N/A'} m
                        📐 Alturas adicionais: ${registro.alturaAdicional || 'N/A'}
                        📏 Largura 1: ${registro.largura1 || 'N/A'} m
                        📏 Largura 2: ${registro.largura2 || 'N/A'} m
                        📏 Largura 3: ${registro.largura3 || 'N/A'} m
                        📏 Larguras adicionais: ${registro.larguraAdicional || 'N/A'}
                        ${registro.diversosLabel ? `📝 ${registro.diversosLabel}: ${registro.diversosTexto || ''}` : ''}
                        📸 Fotos: ${registro.totalFotos || 0}
                    `;

                    slide.addText(infoText, {
                        x: 0.5,
                        y: infoY,
                        w: 5.5,
                        h: 5.5,
                        fontSize: 11,
                        fontFace: 'Arial',
                        color: '333333',
                        valign: 'top',
                        lineSpacing: 18
                    });

                    // Posição da imagem (lado direito)
                    const imgX = 6.5;
                    const imgY = infoY;

                    // Adiciona a primeira foto (se existir)
                    if (registro.fotos && registro.fotos.length > 0) {
                        try {
                            const fotoBase64 = registro.fotos[0];
                            
                            slide.addImage({
                                data: fotoBase64,
                                x: imgX,
                                y: imgY,
                                w: larguraPol,
                                h: alturaPol,
                            });

                            // Adiciona legenda da foto
                            slide.addText(`Foto 1 de ${registro.fotos.length}`, {
                                x: imgX,
                                y: imgY + alturaPol + 0.1,
                                w: larguraPol,
                                h: 0.4,
                                fontSize: 10,
                                fontFace: 'Arial',
                                color: '666666',
                                align: 'center',
                                italic: true
                            });

                            // Se houver mais de uma foto, adiciona miniaturas
                            if (registro.fotos.length > 1) {
                                const miniY = imgY + alturaPol + 0.6;
                                const miniW = 2.5;
                                const miniH = 1.8;
                                const maxMiniaturas = Math.min(registro.fotos.length - 1, 3);

                                for (let i = 1; i <= maxMiniaturas; i++) {
                                    try {
                                        slide.addImage({
                                            data: registro.fotos[i],
                                            x: imgX + ((i - 1) * (miniW + 0.2)),
                                            y: miniY,
                                            w: miniW,
                                            h: miniH,
                                        });
                                    } catch (e) {
                                        console.warn(`Não foi possível adicionar miniatura ${i+1}:`, e);
                                    }
                                }
                                
                                if (registro.fotos.length > 1) {
                                    slide.addText(`Miniaturas: ${Math.min(registro.fotos.length - 1, 3)} de ${registro.fotos.length - 1}`, {
                                        x: imgX,
                                        y: miniY + miniH + 0.05,
                                        w: larguraPol,
                                        h: 0.3,
                                        fontSize: 8,
                                        fontFace: 'Arial',
                                        color: '999999',
                                        align: 'center',
                                        italic: true
                                    });
                                }
                            }
                        } catch (e) {
                            console.warn('Erro ao adicionar imagem:', e);
                            slide.addText('❌ Erro ao carregar imagem', {
                                x: imgX,
                                y: imgY,
                                w: larguraPol,
                                h: alturaPol,
                                fontSize: 14,
                                fontFace: 'Arial',
                                color: 'FF0000',
                                align: 'center',
                                valign: 'middle',
                                fill: { color: 'F5F5F5' }
                            });
                        }
                    } else {
                        // Se não houver foto, mostra um placeholder
                        slide.addText('📷 Sem foto', {
                            x: imgX,
                            y: imgY,
                            w: larguraPol,
                            h: alturaPol,
                            fontSize: 18,
                            fontFace: 'Arial',
                            color: '999999',
                            align: 'center',
                            valign: 'middle',
                            fill: { color: 'F5F5F5' }
                        });
                    }

                    // Número do slide
                    slide.addText(`Slide ${index + 1} de ${registros.length}`, {
                        x: 0.5,
                        y: 7.0,
                        w: '90%',
                        h: 0.4,
                        fontSize: 10,
                        fontFace: 'Arial',
                        color: '999999',
                        align: 'center'
                    });
                });

                // Gera e baixa o arquivo
                const nomeArquivo = `Relatorio_Vistoria_${new Date().toISOString().slice(0,10)}.pptx`;
                pptx.writeFile({ fileName: nomeArquivo })
                    .then(() => {
                        alert(`✅ Relatório gerado com sucesso!\n📄 Arquivo: ${nomeArquivo}\n📊 Registros: ${registros.length}`);
                    })
                    .catch((err) => {
                        console.error('Erro ao gerar relatório:', err);
                        alert('❌ Erro ao gerar relatório: ' + err.message);
                    });

            } catch (error) {
                console.error('Erro ao gerar relatório:', error);
                alert('❌ Erro ao gerar relatório: ' + error.message);
            }
        });
    }

    // ============ 8. LIMPAR REGISTROS ============
    if (limparRegistrosBtn) {
        limparRegistrosBtn.addEventListener('click', function() {
            if (registros.length === 0) {
                alert('ℹ️ Não há registros para limpar.');
                return;
            }

            if (confirm(`⚠️ Tem certeza que deseja limpar todos os ${registros.length} registros?\n\nEsta ação não pode ser desfeita!`)) {
                registros = [];
                limparPreview();
                
                document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(campo => {
                    if (campo.id !== 'latitude' && campo.id !== 'longitude' && campo.id !== 'hora') {
                        campo.value = '';
                    }
                });
                
                fotosStatus.textContent = 'Nenhuma foto no preview';
                fotosStatus.className = 'fotos-status';
                locStatus.textContent = 'Registros limpos!';
                locStatus.className = 'status ok';
                
                alert('✅ Todos os registros foram limpos com sucesso!');
                console.log('🗑️ Registros limpos');
            }
        });
    }

    // ============ 9. ATUALIZAR HORA A CADA SEGUNDO ============
    setInterval(() => {
        if (horaInput) {
            horaInput.value = obterHoraAtual();
        }
    }, 1000);
});