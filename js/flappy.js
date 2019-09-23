// funcao que cria novos elementos para o game
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// funcao que cria as barreiras do jogo atraves da funcao novoElemento
function barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// funcao que cria um par barreiras do jogo atraves da funcao novoElemento
function parDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new barreira(true)
    this.inferior = new barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// funcao que anima a movimentacao do conjunto de barreiras
function barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

// funcao que cria o passaro e captura acoes dos botoes de controle
function passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

// funcao que verifica o progresso atual do game
function progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// funcao para a validacao se houve impacto que acarretara na derrota do player
function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

// funcao para a validacao se houve impacto que acarretara na derrota do player
function colidiu(passaroDoJogo, barreirasDoJogo) {
    let colidiu = false
    barreirasDoJogo.pares.forEach(parBarreiras => {
        if (!colidiu) {
            const superior = parBarreiras.superior.elemento
            const inferior = parBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaroDoJogo.elemento, superior)
                || estaoSobrepostos(passaroDoJogo.elemento, inferior)
        }
    })
    return colidiu
}

function flappyBird() {
    // variavel que armazana pontuação
    let pontos = 0

    // variavel que busca o elemento wm-flappy
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progressoDoJogo = new progresso()
    const barreirasDoJogo = new barreiras(altura, largura, 200, 400, () => progressoDoJogo.atualizarPontos(++pontos))
    const passaroDoJogo = new passaro(altura)

    areaDoJogo.appendChild(progressoDoJogo.elemento)
    areaDoJogo.appendChild(passaroDoJogo.elemento)

    barreirasDoJogo.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    // funcao que inicia o game
    this.start = () => {
        const temporizador = setInterval(() => {
            barreirasDoJogo.animar()
            passaroDoJogo.animar()

            if (colidiu(passaroDoJogo, barreirasDoJogo)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new flappyBird().start()