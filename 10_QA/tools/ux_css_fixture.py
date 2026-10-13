from pathlib import Path
from playwright.sync_api import sync_playwright
css=(Path(__file__).resolve().parents[2]/'11_PRODUCTION/web/src/styles/app.css').read_text()
html='''<main class="app-root"><main class="home-shell clean-home">
<header class="home-header"><span class="brand-mark">PA<span>✦</span></span><span class="eyebrow">PALABRA ARENA</span><span class="version">0.2.2 · DEV</span></header>
<section class="hero"><p class="eyebrow">PARTIDAS ILIMITADAS</p><h1>Cada palabra cuenta.</h1><p>Elegí cómo querés jugar.</p></section>
<div class="home-panel panel"><button class="text-back">← Volver</button><div class="online-browser">
<div class="panel-heading"><h2>Salas disponibles</h2><p class="field-note">Todas las salas son visibles; las privadas necesitan contraseña.</p></div>
<div class="privacy-tabs"><button>Públicas</button><button class="active">Privadas · contraseña</button></div>
<div class="browser-actions"><button class="primary">+ Crear sala</button><button class="secondary">↻ Actualizar</button></div>
<label class="browser-filter">Modo<select><option>Todos los modos</option></select></label>
<div class="room-list">
<button class="room-card browse-room"><span class="room-card-main"><strong>Amigos de Buenos Aires 2026</strong><small>Cultura general · ES / EN · 8 letras</small></span><span class="room-card-end"><span class="room-count">2/8</span><b>🔒 →</b></span></button>
<button class="room-card browse-room"><span class="room-card-main"><strong>Los torneos más intensos</strong><small>Duelo · Español · Azar</small></span><span class="room-card-end"><span class="room-count">4/8</span><b>🔒 →</b></span></button>
</div><div class="join-code"><label>¿Tenés un código?<input placeholder="ABCDE"/></label><button class="secondary">Entrar</button></div>
</div></div><footer class="home-footer">Sin límite diario · PC y móvil</footer></main></main>'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(320,700),(375,812),(768,1024),(1440,900)]:
  page=browser.new_page(viewport={'width':width,'height':height}, device_scale_factor=1)
  page.set_content('<style>'+css+'</style>'+html)
  # Screenshots are optional; the layout assertions are the regression gate.
  result=page.evaluate('''() => ({scrollW:document.documentElement.scrollWidth, viewport:innerWidth,
   controls:[...document.querySelectorAll('button,input,select')].map(e=>({text:(e.innerText||e.placeholder||e.getAttribute('aria-label')||'').slice(0,40),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)})),
   panel:document.querySelector('.home-panel').getBoundingClientRect().toJSON()})''')
  minimum=min([x['h'] for x in result['controls'] if x['text'] not in ['← Volver']]); overflow=result['scrollW']>width
  print(width, 'horizontalOverflow', overflow, 'minTouchHeight',minimum,'panelWidth',round(result['panel']['width']))
  assert not overflow, f'horizontal overflow at {width}'
  assert minimum>=44, f'touch target under 44px at {width}'
  page.close()
 browser.close()
