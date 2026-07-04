---
name: Segurança e Resiliência
colors:
  surface: '#fff8f7'
  surface-dim: '#f1d3d0'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e7'
  surface-container-high: '#ffe2de'
  surface-container-highest: '#f9dcd9'
  on-surface: '#271816'
  on-surface-variant: '#5b403d'
  inverse-surface: '#3e2c2a'
  inverse-on-surface: '#ffedeb'
  outline: '#8f6f6c'
  outline-variant: '#e4beba'
  surface-tint: '#ba1a20'
  primary: '#af101a'
  on-primary: '#ffffff'
  primary-container: '#d32f2f'
  on-primary-container: '#fff2f0'
  inverse-primary: '#ffb3ac'
  secondary: '#005faf'
  on-secondary: '#ffffff'
  secondary-container: '#54a0fe'
  on-secondary-container: '#003567'
  tertiary: '#715300'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f6a00'
  on-tertiary-container: '#fff3e3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#930010'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#004786'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#f8bd2a'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#fff8f7'
  on-background: '#271816'
  surface-variant: '#f9dcd9'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  touch-target-min: 48px
  gutter-mobile: 16px
  gutter-desktop: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
O foco central do design system é a **utilidade crítica em cenários de emergência**. A identidade visual prioriza a redução da carga cognitiva, garantindo que usuários sob estresse possam localizar informações vitais instantaneamente. 

A estética adota um **Minimalismo Utilitário com Alto Contraste**, eliminando qualquer elemento puramente decorativo. O design é otimizado para condições de baixa visibilidade e conectividade limitada, utilizando uma linguagem visual baseada em cores semânticas e ícones universais. O objetivo é evocar uma sensação de confiabilidade, clareza e ação imediata.

## Colors
O sistema de cores é estritamente funcional e baseado em convenções internacionais de segurança (ISO 3864).
- **Vermelho (#D32F2F):** Uso exclusivo para situações de perigo imediato, zonas de inundação e abrigos sem capacidade disponível.
- **Amarelo (#FBC02D):** Alertas de atenção e abrigos próximos da capacidade máxima. Deve ser usado com texto escuro para garantir legibilidade.
- **Verde (#388E3C):** Indica zonas seguras, rotas liberadas e abrigos com vagas.
- **Azul (#1976D2):** Identificação de rotas de evacuação, pontos de distribuição de água e serviços de assistência.
- **Neutros:** O fundo principal é branco puro para maximizar o contraste com o texto Cinza Escuro (#212121).

## Typography
Utilizamos a fonte **Inter** por sua excelente legibilidade em telas pequenas e clareza em caracteres numéricos.
- **Hierarquia:** Títulos em negrito (Bold) para facilitar o escaneamento visual rápido.
- **Legibilidade:** O corpo do texto nunca deve ser inferior a 16px para garantir acessibilidade universal.
- **Contraste:** Todo texto sobre fundos coloridos deve passar nos testes de contraste WCAG AA (4.5:1).

## Layout & Spacing
O sistema adota uma abordagem **Mobile-First** absoluta. 
- **Grid:** Layout de coluna única para mobile, expandindo para no máximo 12 colunas em desktop com largura máxima de 1200px.
- **Alvos de Toque:** Todo elemento interativo deve ter uma área mínima de clique de **48x48px** para evitar erros de navegação em situações de pressa ou mãos trêmulas.
- **Ritmo Vertical:** Espaçamento generoso entre blocos de informação (mínimo 16px) para evitar confusão visual.

## Elevation & Depth
O design evita sombras complexas para manter a performance em dispositivos antigos e garantir clareza sob luz solar direta.
- **Bordas Estruturais:** Em vez de sombras, utilizamos bordas sólidas de 1px ou 2px (High-Contrast Outlines) para separar elementos de interface.
- **Camadas Tonais:** Superfícies de alerta (como banners) utilizam cores de fundo sólidas e saturadas para se destacarem da superfície branca base.
- **Cards:** Devem ter bordas nítidas para delimitar claramente onde termina uma informação e começa outra.

## Shapes
As formas neste sistema de design são predominantemente **angulares ou levemente arredondadas**.
- **Raio de Canto:** 4px (Soft) para botões e cards, proporcionando uma aparência moderna mas mantendo o rigor institucional.
- **Ícones:** Devem seguir um estilo "outline" com traços de 2px de espessura para máxima visibilidade.

## Components
- **Botões de Ação:** Altura mínima de 48px. Botões de "Emergência" ou "SOS" devem ocupar toda a largura da tela (full-width) e usar o Vermelho (#D32F2F).
- **Banners de Alerta:** Fixados no topo da tela (sticky), usando cores semânticas de acordo com a gravidade. Devem conter um ícone e um título curto.
- **Cards de Abrigo:** Devem exibir o nome do local, distância e uma **Barra de Progresso de Capacidade**. A barra muda de cor dinamicamente: Verde (<70%), Amarelo (70-90%), Vermelho (>90%).
- **Inputs de Dados:** Campos de formulário com rótulos (labels) sempre visíveis e bordas de 2px quando em foco.
- **Indicadores de Status:** Ícones simples (Check, X, Exclamação) acompanhados de texto descritivo, nunca dependendo apenas da cor para transmitir significado (Acessibilidade para Daltonismo).