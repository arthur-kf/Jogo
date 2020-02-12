//variáriaveis do jogo

//canvas = para desenhar o jogo
//ctx = contexto que esta liga com "canvas"
//altura e largura = para definir a area da janela
//frames = para atualizar as taxas de quadro do jogo

var canvas, ctx, ALTURA, LARGURA, maxPulos = 3, velocidade = 6, estadoAtual, record, img,

pontosparanovafase = [5,10,15,20]
fase_atual = 0,

//FUNÇÕES PARA FAZER A TROCA DE FASES NA TELA//
labelNovaFase = {
    texto: ``,
    opacidade:0.0,

    fadeIn: function(dt){
       var fadeInId = setInterval(function(){
            if(labelNovaFase.opacidade < 1.0){
                labelNovaFase.opacidade += 0.01
            }else{
                clearInterval(fadeInId)
            }
        }, 10 * dt)
    },

    fadeOut: function(dt){
        var fadeOutId = setInterval(function(){
            if(labelNovaFase.opacidade > 0.0){
                labelNovaFase.opacidade -= 0.01
            }else{
                clearInterval(fadeOutId)

            }
        }, 10 * dt)
    }
},
//FUNÇÕES PARA FAZER A TROCA DE FASES NA TELA//


//SPRITES
fundo = new Sprite(0, 0, 600, 600,),
personagem = new Sprite(628, 0 , 87, 87),
perdeu = new Sprite(1523, 923, 395, 357),
jogar = new Sprite(1521, 0, 397, 347),
novo = new Sprite(0, 862, 287, 93),
recordmode = new Sprite(0, 1185, 440, 95),
chaomode = new Sprite(0, 600, 600, 54),

obstaculo_amarelo = new Sprite(1020, 1160, 50, 120),
obstaculo_rosa = new Sprite(1087, 1160, 50, 120),
obstaculo_azul = new Sprite(1155, 1160, 50, 120),
obstaculo_verde = new Sprite(1220, 1160, 50, 120),
obstaculo_vermelho = new Sprite(1281, 1160, 50, 120),

//SPRITES

estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2,
},


//desenhando o chão e a posição dele
chao = {
    y: 550,
    x: 0,
    altura: 50,

    //Para o chão fica em movimento
    atualiza: function(){
        this.x -= velocidade;
        if(this.x <= -30){
            this.x += 30 

        }
    },

    desenha: function(){
        chaomode.desenha(this.x, this.y);
        chaomode.desenha(this.x + chaomode.largura, this.y)
        
   }

},


//Demarcando o lugar do bloco vermelho e desenhando o bloco vermelho//
bloco ={
    x: 50,
    y: 0,
    altura: personagem.altura,
    largura: personagem.largura,
    gravidade: 1.6,
    velocidade: 0,
    forçaDoPulo: 23.6,
    qntPulos: 0,
    score: 0,
    rotaçao: 0,

    vidas: 3,
    colidindo: false,

    atualiza: function(){
        this.velocidade += this.gravidade
        this.y += this.velocidade
        this.rotaçao += Math.PI / 180 * velocidade

        if(this.y >  chao.y - this.altura && estadoAtual != estados.perdeu){
            this.y = chao.y - this.altura
            this.qntPulos = 0
            this.velocidade = 0
        }
    },

    pula: function(){
        if(this.qntPulos < maxPulos){
        this.velocidade = -this.forçaDoPulo
        this.qntPulos ++
        }
    },

    resetar: function(){
        this.velocidade = 0
        this.y = 0
        

        if(this.score > record){
            localStorage.setItem("record", this.score)
            record = this.score
        }

        this.vidas = 3
        this.score = 0

        velocidade = 6
        fase_atual = 0
        this.gravidade = 1.6
    },

    desenha: function(){
        //Operações para rotacionar
        ctx.save()
        ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2)
        ctx.rotate(this.rotaçao)
        personagem.desenha(-this.largura / 2, -this.altura / 2)
        ctx.restore()

    }
},

//As funções dos obstaculos dentro do jogo//
obstaculos = {
    _obs: [],
    _scored: false,
    _sprites: [obstaculo_amarelo, obstaculo_rosa, obstaculo_azul, obstaculo_verde, obstaculo_vermelho],
    tempoInsere:0,

    insere: function() {
        this._obs.push({
            x: LARGURA,
            //largura: 30 + Math.floor(21 * Math.random()),
            largura: 50,
            y: chao.y - Math.floor(20 + Math.random() * 100),
            sprite: this._sprites[Math.floor(this._sprites.length * Math.random())]
        })

        this.tempoInsere = 40 + Math.floor(21 * Math.random()) //Espaço entre cada obstaculo
    },

    atualiza: function(){
        if (this.tempoInsere == 0)
            this.insere()
        else{
            this.tempoInsere--
        }

        for (var i = 0, tam = this._obs.length; i < tam; i++){
            var obs = this._obs[i];

            obs.x -= velocidade
            
            if(!bloco.colidindo && bloco.x < obs.x + obs.largura && bloco.x + bloco.largura >= obs.x && bloco.y + bloco.altura >= obs.y){

                bloco.colidindo = true

                setTimeout(function(){
                    bloco.colidindo = false
                }, 500)

                if(bloco.vidas > 0){
                    bloco.vidas --
                }else{
                estadoAtual = estados.perdeu
                }
            }

            else if(obs.x <= 0 && !obs._scored){
                bloco.score++
                obs._scored = true

                if(fase_atual < pontosparanovafase.length && bloco.score == pontosparanovafase[fase_atual]){
                    passarDeFase()
                }
            }

           else if (obs.x <= -obs.largura){
                this._obs.splice(i, 1)
                tam--
                i--
            }
        }
    },

    limpa: function(){

        this._obs = []
    },

    desenha: function(){
        for(var i = 0, tam = this._obs.length; i < tam; i++){
            var obs = this._obs[i]
            
            obs.sprite.desenha(obs.x, obs.y)
        }
    }

}


//Função de Clique
function clique(event){
    if(estadoAtual == estados.jogando){
        bloco.pula()
    }
    else if(estadoAtual == estados.jogar){
        estadoAtual = estados.jogando
    }
    else if(estadoAtual == estados.perdeu && bloco.y >= 2* ALTURA){
        estadoAtual = estados.jogar
        bloco.resetar()
        obstaculos.limpa()
    }
}

function passarDeFase(){

    velocidade++
    fase_atual++
    bloco.vidas++

    if(fase_atual == 4){
        bloco.gravidade *= 0.6
    }
    
    //CHAMAR A MUDANÇA DE FASE
    labelNovaFase.texto = `Level ${fase_atual}`
    labelNovaFase.fadeIn(0.4)

    setTimeout(function() {
        labelNovaFase.fadeOut(0.4)
    }, 800)
    //CHAMAR A MUDANÇA DE FASE
}

//função principal//
function main(){
    ALTURA = window.innerHeight
    LARGURA  = window.innerWidth
    
    if (LARGURA >= 500) {
        LARGURA = 600
        ALTURA = 600
    }

    canvas = document.createElement("canvas")
    canvas.width = LARGURA
    canvas.height = ALTURA
    canvas.style.border = "1px solid #000"


    ctx = canvas.getContext("2d")
    document.body.appendChild(canvas)
    document.addEventListener("mousedown", clique)
    
    estadoAtual = estados.jogar
    record = localStorage.getItem("record")

    if(record == null){
        record = 0
    }

    img = new Image()
    img.src = "sheet.png"
    
    roda()
}
function roda(){
    atualiza()
    desenha()

    window.requestAnimationFrame(roda)
}

function atualiza(){
    
    bloco.atualiza();

    chao.atualiza();

    if(estadoAtual == estados.jogando){
        obstaculos.atualiza()
    }    
}

//Função que desenha as formas na tela//
function desenha(){
    fundo.desenha(0, 0);

    ctx.fillStyle = "#fff"
    ctx.font = "50px Arial"
    ctx.fillText(bloco.score, 30, 68)
    ctx.fillText(bloco.vidas, 540, 68)

    //VAI DESENHAR A MUDANÇA DE NIVEL
    ctx.fillStyle = `rgba(0,0,0, ${labelNovaFase.opacidade})`
    ctx.fillText(labelNovaFase.texto, canvas.width / 2 - ctx.measureText(labelNovaFase.texto).width / 2, canvas.height / 3)
    //VAI DESENHAR A MUDANÇA DE NIVEL

    if (estadoAtual == estados.jogando)
        obstaculos.desenha()//desenha os obstaculos
    
        chao.desenha()//desenha o chão
        bloco.desenha()//desenha o bloco
    
        if(estadoAtual == estados.jogar)
        jogar.desenha(LARGURA / 2 - jogar.largura / 2, ALTURA / 2 - jogar.altura / 2)

        if(estadoAtual == estados.perdeu){
            perdeu.desenha(LARGURA / 2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - recordmode.altura / 2)

            recordmode.desenha(LARGURA / 2 - recordmode.largura / 2, ALTURA / 2 + perdeu.altura / 2 - recordmode.altura / 2 - 25)

            ctx.fillStyle = "#fff"
            ctx.fillText(bloco.score, 325, 400)
        
            if(bloco.score > record){
                novo.desenha(LARGURA / 2 - 180, ALTURA / 2 + 30)
                ctx.fillText(bloco.score, 370, 470)

            }
        
            else{
                ctx.fillText(record, 370, 470)
            }
        
        }

    
}   


//inicializa
main()