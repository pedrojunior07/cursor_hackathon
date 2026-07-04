# Categoria 2 — Rota Segura (Evacuação)

Com base no README, a vossa solução deve ajudar comunidades moçambicanas a **saber para onde ir**, **como chegar em segurança** e **se o abrigo ainda tem vaga** — tudo em **português**, **mobile-first**, **3G lento**, com **USSD** para quem não tem smartphone e **IVR** (voz) para quem não lê bem ou prefere ouvir instruções.

---

## Proposta de produto (nome sugerido)

**Rota Segura MZ** — *"Saiba onde está seguro. Chegue vivo."*

**Números de acesso:**
- Web: `rotasegura.co.mz` (PWA mobile)
- USSD: `*123#` (menu de texto no ecrã)
- IVR: `1414` (chamada gratuita, menu por voz)

---

## Personas (para guiar o UI/UX)

| Persona | Contexto | Canal principal |
|---------|----------|-----------------|
| **Ana, 34 anos** | Mãe em Beira, smartphone básico, dados limitados | Web mobile |
| **João, 58 anos** | Pescador, telefone feature phone, sabe ler pouco | IVR (voz) |
| **Carlos, 45 anos** | Comerciante, feature phone, lê bem mas sem internet | USSD |
| **Maria, voluntária** | Atualiza capacidade do abrigo | Web (modo staff) |
| **Autoridade local** | Marca zonas inundadas | Web admin (opcional no hackathon) |

---

## Funcionalidades core (MVP — ponta a ponta)

### 1. Mapa interativo de evacuação (Web mobile)

**O ecrã principal da app.**

- Mapa com camadas:
  - 🔴 **Zonas inundáveis / em risco** (polígonos coloridos)
  - 🟢 **Abrigos / centros de evacuação** (pins)
  - 🟡 **Rotas seguras** (linhas entre ponto A → abrigo)
  - 📍 **Localização do utilizador** (GPS, com fallback manual)
- Filtros simples: *"Mostrar só abrigos com vaga"*
- Modo **offline leve**: mapa + abrigos em cache após primeira visita
- Indicador de **qualidade da ligação** (*"Modo económico activo"*)
- Botão **"Ouvir instruções"** — reproduz rota em áudio (TTS), para quem não consegue ler enquanto caminha

**UX:** botão flutuante grande — **"Encontrar abrigo mais próximo"**

---

### 2. Detalhe do abrigo

Ao tocar num pin:

- Nome, morada, distância a pé / tempo estimado
- **Capacidade em tempo real:** `42/80 lugares` + barra visual
- Estado: 🟢 Com vaga | 🟡 Quase cheio | 🔴 Cheio
- Serviços: água, WC, medicamentos, espaço para famílias
- Botão **"Como chegar"** → abre rota segura no mapa
- Botão **"Ouvir rota"** → áudio passo a passo (TTS em português)
- Botão **"Partilhar localização"** (WhatsApp/SMS com link)

---

### 3. Calculador de rota segura

- Origem: GPS automático ou *"Estou no bairro X"*
- Destino: abrigo escolhido ou *"Abrigo mais próximo com vaga"*
- Rota **evita zonas vermelhas**
- Instruções passo a passo em português simples:
  - *"Siga pela Av. Eduardo Mondlane por 800 m"*
  - *"⚠️ Evite a Rua 24 de Julho — zona inundada"*
- Modo **lista** (sem mapa) para 3G muito lento — poupa dados
- Modo **áudio contínuo**: botão play/pause; avança automaticamente entre passos

---

### 4. Alertas de evacuação (integrado, não app separada)

- Banner no topo: *"Alerta: Bairro Munhava em risco elevado. Evacue agora."*
- Notificação push (se PWA) ou SMS (se backend permitir)
- Código de cor por nível: Verde / Amarelo / Vermelho
- Botão **"Ouvir alerta"** — TTS lê o alerta em voz alta

---

### 5. Acompanhamento de capacidade em tempo real (bónus do README)

**Modo voluntário / staff** (login simples por PIN):

- Ecrã: lista de abrigos atribuídos
- Botões grandes: **+5 pessoas** / **-5 pessoas** / **Marcar cheio**
- Timestamp: *"Actualizado há 3 min"*
- Histórico simples (últimas 24 h) — opcional

**UX pública:** barra de progresso + texto claro, sem números confusos.

---

### 6. Canal USSD (feature phones — menu de texto)

Menu USSD, ex.: `*123#`

```
Bem-vindo à Rota Segura MZ
1. Abrigo mais próximo
2. Verificar capacidade de abrigo
3. Alertas na minha zona
4. Instruções de evacuação
5. Receber instruções por SMS
0. Sair
```

**Fluxo 1 — Abrigo mais próximo:**
```
Introduza o código do bairro:
[1] Munhava  [2] Matacuane  [3] Ponta-Gêa
→ Abrigo: Escola Primária X
→ Distância: ~1.2 km
→ Vagas: 12/80
→ Siga pela Av. X, evite Rua Y
```

**Fluxo 2 — Capacidade:**
```
Código do abrigo: ___
→ Escola X: 42/80 (COM VAGA)
```

**Fluxo 3 — Alertas:**
```
A sua zona: MUNHAVA
Estado: VERMELHO - Evacue imediatamente
Abrigo recomendado: Escola X (1.2 km)
```

**Fluxo 4 — Instruções por SMS:**
```
Enviaremos a rota por SMS.
Confirme o bairro: [1] Munhava [2] Matacuane
→ SMS enviado com instruções passo a passo.
```

**Limitações realistas USSD:** sem mapa visual; texto curto (máx. ~182 caracteres por ecrã); números e códigos de bairro; sessão termina ao fechar.

---

### 7. Canal IVR — Resposta de Voz Interactiva (telefone sem internet)

**Tecnologia:** IVR (*Interactive Voice Response*) com entrada **DTMF** (teclas 0–9 durante a chamada) + **TTS** (*Text-to-Speech*) para ler instruções em português.

**Número:** `1414` (chamada gratuita, curta e fácil de memorizar)

**Menu principal (voz):**
```
"Bem-vindo à Rota Segura Moçambique.
 Para encontrar o abrigo mais próximo, prima 1.
 Para saber se um abrigo tem vaga, prima 2.
 Para alertas na sua zona, prima 3.
 Para ouvir instruções de evacuação, prima 4.
 Para falar com um voluntário, prima 9.
 Para repetir, prima 0."
```

**Fluxo 1 — Abrigo mais próximo (DTMF):**
```
"Prima 1 para Munhava, 2 para Matacuane, 3 para Ponta-Gêa."
[Utilizador prima 1]
"O abrigo mais próximo é a Escola Primária 24 de Julho.
 Distância: um virgula dois quilómetros.
 Vagas disponíveis: doze de oitenta.
 Siga pela Avenida Eduardo Mondlane.
 Evite a Rua 24 de Julho, zona inundada.
 Para repetir as instruções, prima 0.
 Para receber por SMS, prima 5."
```

**Fluxo 2 — Capacidade:**
```
"Introduza o código do abrigo seguido da tecla cardinal."
[Utilizador prima 1-0-0-#]
"Escola Primária 24 de Julho: quarenta e duas vagas de oitenta. Abrigo com vaga."
```

**Fluxo 3 — Alertas:**
```
"Prima 1 para Munhava, 2 para Matacuane, 3 para Ponta-Gêa."
[Utilizador prima 1]
"Alerta vermelho para Munhava. Evacue imediatamente.
 Dirija-se à Escola Primária 24 de Julho, a um virgula dois quilómetros."
```

**Fluxo 4 — Instruções passo a passo (modo navegação por voz):**
```
"Vamos guiá-lo até ao abrigo. Prima 1 quando estiver pronto."
[Utilizador prima 1]
"Passo 1 de 4: Siga em frente pela Avenida Eduardo Mondlane durante 800 metros.
 Prima 1 quando chegar, ou 0 para repetir."
[Utilizador prima 1]
"Passo 2 de 4: Vire à direita na Rua Samora Machel..."
```

**Fluxo 9 — Voluntário (opcional):**
```
"Aguarde enquanto o ligamos a um voluntário."
[Transferência para fila / callback]
```

**Requisitos IVR para demo:**
- Voz em português de Moçambique (ou PT genérico no protótipo)
- Frases curtas (≤ 8 segundos cada)
- Sempre opção de repetir (tecla 0)
- Timeout: *"Não detectámos nenhuma tecla. Adeus."*
- Mesmos dados de abrigos/capacidade que web e USSD (fonte única)

**Diferença USSD vs IVR:**

| | USSD (`*123#`) | IVR (`1414`) |
|---|---|---|
| Interface | Texto no ecrã | Voz + teclas |
| Precisa ler? | Sim | Não |
| Precisa internet? | Não | Não |
| Ideal para | Quem lê, feature phone | Analfabetos, idosos, stress alto |
| Instruções | Texto curto | Áudio passo a passo |

---

## Instruções de geração de UI (para wireframes / mockups)

> **Regra geral:** cada fluxo deve ser representado como **sequência de ecrãs**, ecrã a ecrã, mostrando o estado **antes** e **depois** de cada acção do utilizador (toque, digitação, tecla DTMF).

### A) Fluxo Web Mobile — sequência de ecrãs

Gerar mockups mobile (375×812 px) na seguinte ordem:

**Fluxo A1 — Evacuação com mapa (Ana)**
```
Ecrã A1.1  Splash + pedido de localização
    ↓ [Permitir localização]
Ecrã A1.2  Mapa principal (pins verdes, zona vermelha, banner alerta amarelo)
    ↓ [Botão FAB "Encontrar abrigo mais próximo"]
Ecrã A1.3  Bottom sheet: "Escola Primária 24 de Julho — 1.2 km — 12 vagas"
    ↓ [Como chegar]
Ecrã A1.4  Mapa com rota amarela traçada + barra inferior "Passo 1 de 4"
    ↓ [Ícone altifalante "Ouvir rota"]
Ecrã A1.5  Mesmo ecrã com player áudio (play/pause, barra progresso)
    ↓ [Passo seguinte]
Ecrã A1.6  Instrução passo 2 em lista + mapa parcial
```

**Fluxo A2 — Sem GPS (modo lista)**
```
Ecrã A2.1  Mapa com aviso "Localização indisponível"
    ↓ [Seleccionar bairro manualmente]
Ecrã A2.2  Lista de bairros (Munhava, Matacuane, Ponta-Gêa)
    ↓ [Munhava]
Ecrã A2.3  Lista de abrigos com badges (Com vaga / Quase cheio / Cheio)
    ↓ [Escola Primária 24 de Julho]
Ecrã A2.4  Detalhe abrigo + botões "Como chegar" / "Ouvir rota"
    ↓ [Como chegar — modo lista]
Ecrã A2.5  Lista numerada de instruções (sem mapa, modo 3G lento)
```

**Fluxo A3 — Staff (Maria)**
```
Ecrã A3.1  Login PIN (4 dígitos, teclado numérico grande)
    ↓ [Confirmar]
Ecrã A3.2  Lista de abrigos atribuídos
    ↓ [Escola Primária 24 de Julho]
Ecrã A3.3  Painel capacidade: 42/80 + botões +5 / -5 / Marcar cheio
    ↓ [+5 pessoas]
Ecrã A3.4  Confirmação "Actualizado — 47/80 — há 0 min"
```

---

### B) Fluxo USSD — sequência de ecrãs de telemóvel

> Representar como **ecrã de telemóvel genérico** (feature phone ou smartphone em modo USSD): barra de estado no topo, campo de marcação ou caixa de diálogo USSD cinzenta/branca, texto monospace, botões Cancelar / Enviar quando aplicável.

**Fluxo B1 — Abrigo mais próximo (Carlos)**
```
Ecrã B1.1  Teclado telefónico — utilizador a digitar *123#
           [Visível: *123# no campo de marcação]
    ↓ [Tecla verde "Chamar" / "OK"]
Ecrã B1.2  Popup USSD:
           "Bem-vindo à Rota Segura MZ
            1.Abrigo mais próximo
            2.Capacidade abrigo
            3.Alertas na minha zona
            4.Instruções evacuação
            5.Receber por SMS
            0.Sair
            [campo resposta: _]"
    ↓ [Utilizador digita 1 e Enviar]
Ecrã B1.3  Popup USSD:
           "Escolha o bairro:
            1.Munhava 2.Matacuane 3.Ponta-Gêa
            [_]"
    ↓ [Utilizador digita 1]
Ecrã B1.4  Popup USSD — resultado:
           "Abrigo: Escola Prim. 24 Julho
            Dist: 1.2km | Vagas: 12/80
            Siga Av. E.Mondlane
            Evite Rua 24 Julho
            0.Repetir 5.SMS"
    ↓ [Utilizador digita 0 ou fecha]
Ecrã B1.5  Regresso ao ecrã inicial do telemóvel
```

**Fluxo B2 — Verificar capacidade**
```
Ecrã B2.1  *123# → Menu principal
    ↓ [2]
Ecrã B2.2  "Introduza cod. abrigo: [_]"
    ↓ [101]
Ecrã B2.3  "Escola 24 Julho: 42/80 COM VAGA"
```

**Fluxo B3 — Alertas**
```
Ecrã B3.1  *123# → Menu → [3]
Ecrã B3.2  "Bairro: 1.Munhava 2.Matacuane [_]"
    ↓ [1]
Ecrã B3.3  "MUNHAVA: VERMELHO
            Evacue ja!
            Abrigo: Escola 24 Julho (1.2km)"
```

---

### C) Fluxo IVR — sequência de ecrãs de chamada

> Representar como **ecrã de chamada activa**: avatar/ícone telefone, timer, teclado DTMF expansível, e **transcrição da voz** (legendas) do que o sistema diz em cada passo.

**Fluxo C1 — Abrigo por voz (João)**
```
Ecrã C1.1  Teclado — utilizador a marcar 1414
           [Visível: 1414 no campo]
    ↓ [Chamar]
Ecrã C1.2  Chamada activa (00:05)
           🔊 Legendas: "Bem-vindo à Rota Segura Moçambique.
           Prima 1 para abrigo mais próximo..."
           [Teclado DTMF visível na parte inferior]
    ↓ [Utilizador prima 1]
Ecrã C1.3  Chamada activa (00:18)
           🔊 "Prima 1 para Munhava, 2 para Matacuane, 3 para Ponta-Gêa."
           [Destaque visual na tecla 1]
    ↓ [Utilizador prima 1]
Ecrã C1.4  Chamada activa (00:35)
           🔊 "O abrigo mais próximo é a Escola Primária 24 de Julho.
           Distância: 1.2 km. Vagas: 12 de 80.
           Siga pela Avenida Eduardo Mondlane.
           Evite a Rua 24 de Julho."
           [Botões na legenda: 0 Repetir | 5 Enviar SMS]
    ↓ [Utilizador prima 5]
Ecrã C1.5  Chamada activa (00:42)
           🔊 "Enviámos as instruções por SMS para o seu número."
    ↓ [Desligar]
Ecrã C1.6  Ecrã inicial telemóvel + notificação SMS recebida
```

**Fluxo C2 — Navegação passo a passo por voz**
```
Ecrã C2.1  1414 → Menu → [4 Instruções evacuação]
Ecrã C2.2  🔊 "Prima 1 para Munhava..." → [1]
Ecrã C2.3  🔊 "Passo 1 de 4: Siga pela Av. Eduardo Mondlane, 800 metros.
           Prima 1 quando chegar, 0 para repetir."
           [Barra progresso: ████░░░░ 1/4]
    ↓ [Utilizador prima 1]
Ecrã C2.4  🔊 "Passo 2 de 4: Vire à direita na Rua Samora Machel..."
           [Barra progresso: ████████░░ 2/4]
```

**Fluxo C3 — Alerta urgente**
```
Ecrã C3.1  1414 → [3 Alertas] → [1 Munhava]
Ecrã C3.2  🔊 "ALERTA VERMELHO. Munhava em risco elevado.
           Evacue imediatamente para a Escola Primária 24 de Julho."
           [Fundo do ecrã de chamada com barra vermelha pulsante]
```

---

## Estrutura de ecrãs (Web mobile)

| # | Ecrã | Prioridade |
|---|------|------------|
| 1 | **Splash / Onboarding** (1 slide: "Permitir localização") | P2 |
| 2 | **Mapa principal** (hub) | P0 |
| 3 | **Lista de abrigos** (alternativa ao mapa) | P0 |
| 4 | **Detalhe do abrigo** | P0 |
| 5 | **Navegação / rota passo a passo** | P0 |
| 6 | **Player áudio / Ouvir rota** | P1 |
| 7 | **Alertas activos** | P1 |
| 8 | **Seleccionar bairro** (manual, sem GPS) | P1 |
| 9 | **Modo staff** (actualizar capacidade) | P1 |
| 10 | **Sobre / Ajuda** (*"Sem internet? Marque *123# ou ligue 1414"*) | P2 |

**Total MVP:** 5–6 ecrãs web bem feitos + 2 fluxos USSD + 1 fluxo IVR completos.

---

## Fluxos de utilizador principais

```
[Alerta recebido — Ana]
  → Abrir app → Ver mapa com zona vermelha
  → "Encontrar abrigo" → Rota segura → "Ouvir rota" → Chegar

[Sem GPS — Ana]
  → Escolher bairro → Lista abrigos com vaga → Ver rota em lista

[Feature phone, lê bem — Carlos]
  → *123# → 1 → 1 (Munhava) → Ler instruções no ecrã USSD

[Não lê / idoso — João]
  → Ligar 1414 → 1 → 1 (Munhava) → Ouvir instruções por voz
  → Opcional: 5 → Receber SMS com rota

[Voluntária — Maria]
  → Login PIN → +5 pessoas → Capacidade actualizada (web + USSD + IVR)
```

---

## Requisitos UI/UX (hackathon)

| Requisito | Implementação |
|-----------|---------------|
| Mobile-first | Botões ≥ 48px, uma acção principal por ecrã |
| 3G lento | Mapa simplificado, modo lista, lazy load, skeleton loaders |
| Português | Linguagem simples, sem jargão técnico |
| Acessibilidade | Alto contraste, ícones + texto, áudio TTS, IVR |
| Pressão / stress | Cores de alerta claras, CTAs grandes, poucos passos |
| Offline | Cache de abrigos + rotas pré-calculadas por bairro |
| Inclusão | Três canais: web (vê), USSD (lê), IVR (ouve) |

---

## Paleta e linguagem visual (sugestão)

- 🔴 Vermelho — perigo / inundado / cheio
- 🟡 Amarelo — atenção / quase cheio
- 🟢 Verde — seguro / com vaga
- 🔵 Azul — água / rotas
- ⚫ Cinza escuro — ecrãs USSD / popups sistema
- Tipografia web: sans-serif legível (Inter, system-ui)
- Tipografia USSD: monospace (Roboto Mono, Courier)
- Ecrã IVR: fundo escuro, legendas brancas grandes, teclas DTMF destacadas

---

## Dados mock realistas (para protótipo)

| Abrigo | Cód. | Bairro | Capacidade | Estado |
|--------|------|--------|------------|--------|
| Escola Primária 24 de Julho | 101 | Munhava | 42/80 | 🟢 |
| Centro Comunitário Matacuane | 102 | Matacuane | 78/80 | 🟡 |
| Ginásio Municipal | 103 | Ponta-Gêa | 80/80 | 🔴 |
| Igreja São Francisco | 104 | Chipangara | 15/60 | 🟢 |

Códigos de bairro USSD/IVR: 1=Munhava, 2=Matacuane, 3=Ponta-Gêa, 4=Chipangara

Zonas inundáveis: polígonos em torno de rios/costas (Beira).

---

## O que cortar se o tempo apertar

| Cortar | Manter |
|--------|--------|
| Login completo | PIN simples para staff |
| Admin de zonas | Zonas hardcoded / JSON |
| Push notifications | Banner in-app + USSD + IVR |
| Histórico de capacidade | Capacidade actual |
| Múltiplas cidades | 1 cidade (Beira) |
| Transferência para voluntário (IVR 9) | Menu IVR 1–4 |
| SMS automático | USSD + IVR com voz |

---

## Pitch UI/UX (3 min)

1. **Problema:** *"Quando a água sobe, as pessoas não sabem para onde ir — e muitos não têm smartphone."*
2. **Solução:** Mapa + rotas + vagas em tempo real + USSD para quem lê + IVR para quem ouve.
3. **Demo:** Ana abre o mapa e ouve a rota → Carlos usa `*123#` → João liga `1414` → Maria actualiza vagas.
4. **Diferencial:** Três canais, mesma informação, funciona offline, em português, inclusivo.

---

## Próximos passos UI/UX

1. **Wireframes** dos 5 ecrãs web P0 + player áudio
2. **Fluxo USSD** ecrã a ecrã (mínimo 2 fluxos completos: abrigo + alerta)
3. **Fluxo IVR** ecrã a ecrã com legendas de voz (mínimo 1 fluxo completo)
4. **Design system** mínimo: cores, botões, cards abrigo, popup USSD, ecrã chamada IVR
5. **Protótipo clicável** (Figma) — web + simulação USSD/IVR
6. **User journey** Ana + Carlos + João numa folha A4 para o pitch

---

## Notas para quem gera mockups (IA / Figma)

- Cada fluxo USSD = **5–6 ecrãs de telemóvel** em sequência vertical (storyboard)
- Cada fluxo IVR = **4–6 ecrãs de chamada activa** com legendas 🔊 do áudio
- Cada fluxo web = **4–6 ecrãs mobile** com setas de navegação
- Manter **consistência de dados** entre canais (mesmo abrigo, mesmas vagas, mesma rota)
- Mostrar sempre a **acção do utilizador** entre ecrãs: `[Prima 1]`, `[Digita *123#]`, `[Ouvir rota]`
- Incluir ecrã de **ajuda** na web com: *"Sem internet? Marque *123#. Não lê bem? Ligue 1414."*
