const WHATSAPP_NUMBER = "5521978926365";

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


function renderGrupo(radioname, itens, containerId, checkedIndex = 0) {
    const el = document.getElementById(containerId);
    el.innerHTML = itens.map((opt, idx) => {
        const precoHtml = opt.preco > 0 ? `<span class='text-pink-700 font-semibold'>${fmt(opt.preco)}</span>` : '';
        return `
            <label class='flex items-center justify-between gap-3 border rounded-xl p-3 hover:shadow cursor-pointer'>
                <div class='flex items-center gap-3'>
                    <input type='radio' name='${radioname}' value='${opt.id}' data-price='${opt.preco || 0}' class='h-4 w-4 text-pink-600' ${idx === checkedIndex ? 'checked' : ''}>
                    <span class='font-medium'>${opt.nome}</span>
                </div>
                ${precoHtml}
            </label>
        `;
    }).join('');
}


renderGrupo('bolo1', massas, 'col-bolo-1', 0);
function getCheckedPrice(name) {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return r ? Number(r.dataset.price || 0) : 0;
}

function getCheckedLabel(name, lista) {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    if (!r) return null;
    const found = lista.find(i => i.id === r.value);
    return found ? `${found.nome} (${fmt(found.preco)})` : null;
}

function getPoteInfo() {
    const r = document.querySelector('input[name="pote"]:checked');
    if (!r) return { ml: 0, preco: 0 };
    return { ml: Number(r.value), preco: Number(r.dataset.price) };
}

function atualizarResumoETotal() {
    const pote = getPoteInfo();
    const pBolo1 = getCheckedPrice('bolo1');
    const pBolo2 = getCheckedPrice('bolo2');
    const pRch1  = getCheckedPrice('recheio1');
    const pRch2  = getCheckedPrice('recheio2');
    const pCob   = getCheckedPrice('cobertura');

    const total = pote.preco + pBolo1 + pBolo2 + pRch1 + pRch2 + pCob;

    document.getElementById('total').textContent = fmt(total);

    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = `
        <li>Pote: <strong>${pote.ml} ml</strong> – ${fmt(pote.preco)}</li>
        <li>1ª Massa: <strong>${getCheckedLabel('bolo1', massas) || '-'}</strong></li>
        <li>1º Recheio: <strong>${getCheckedLabel('recheio1', recheios) || '-'}</strong></li>
        <li>2ª Massa: <strong>${getCheckedLabel('bolo2', massas) || '-'}</strong></li>
        <li>2º Recheio: <strong>${getCheckedLabel('recheio2', recheios) || '-'}</strong></li>
        <li>Cobertura: <strong>${getCheckedLabel('cobertura', coberturas) || '-'}</strong></li>
    `;
}

function montarMensagemWhatsApp() {
    const pote = getPoteInfo();
    const obs = (document.getElementById('obs').value || '').trim();
    const total = document.getElementById('total').textContent;

    const linhas = [
        '*Pedido – Bolo de Pote*',
        `• Pote: ${pote.ml} ml (${fmt(pote.preco)})`,
        `• 1ª Massa: ${getCheckedLabel('bolo1', massas) || '-'}`,
        `• 1º Recheio: ${getCheckedLabel('recheio1', recheios) || '-'}`,
        `• 2ª Massa: ${getCheckedLabel('bolo2', massas) || '-'}`,
        `• 2º Recheio: ${getCheckedLabel('recheio2', recheios) || '-'}`,
        `• Cobertura: ${getCheckedLabel('cobertura', coberturas) || '-'}`,
        obs ? `• Observações: ${obs}` : null,
        `\nTotal: *${total}*`
    ].filter(Boolean);
    const msg = encodeURIComponent(linhas.join('\n'));
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function bindEvents() {
    document.body.addEventListener('change', (e) => {
        if (
            e.target.matches('input[name="pote"]') ||
            e.target.matches('input[name="bolo1"]') ||
            e.target.matches('input[name="recheio1"]') ||
            e.target.matches('input[name="bolo2"]') ||
            e.target.matches('input[name="recheio2"]') ||
            e.target.matches('input[name="cobertura"]')
        ) {
            if (window.innerWidth < 768) {
                const card = e.target.closest('article');
                const next = card?.nextElementSibling;
                if (next) {
                    setTimeout(() => {
                        next.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        next.classList.add('highlight-next');
                        setTimeout(() => next.classList.remove('highlight-next'), 1000);
                    }, 200);
                }
            }
            atualizarResumoETotal();
        }
    });

    document.getElementById('btn-whats').addEventListener('click', () => {
        const url = montarMensagemWhatsApp();
        window.open(url, '_blank');
    });
}

// ====== BOOT ======
(function init() {
    document.getElementById('year').textContent = new Date().getFullYear();

    // Renderiza grupos com uma opção pré-selecionada
    renderGrupo('bolo1', massas, 'col-bolo-1', 0);
    renderGrupo('recheio1', recheios, 'col-recheio-1', 0);
    renderGrupo('bolo2', massas, 'col-bolo-2', 1);
    renderGrupo('recheio2', recheios, 'col-recheio-2', 1);
    renderGrupo('cobertura', coberturas, 'col-cobertura', 0);

    bindEvents();
    atualizarResumoETotal();
})();