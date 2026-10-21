"""Teste funcional do protótipo com dados fictícios e microfone simulado."""
import json
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('EJN_TEST_URL', 'http://127.0.0.1:5173')

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
        args=['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    )
    for width in [1440, 390]:
        context = browser.new_context(viewport={'width': width, 'height': 900}, permissions=['microphone'], accept_downloads=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE)
        page.get_by_role('button', name='Seus dados, suas escolhas').click()
        assert page.get_by_role('dialog').is_visible()
        page.get_by_role('button', name='Entendi').click()
        page.get_by_role('button', name='Começar minha jornada').click()
        page.get_by_role('button', name='Continuar').click()
        assert page.locator('[aria-invalid=true]').count() == 4
        page.locator('#name').fill('Pessoa de Teste')
        page.locator('#email').fill('teste@example.com')
        page.locator('#phone').fill('(11) 99999-9999')
        page.locator('#city').fill('São Paulo / SP')
        page.get_by_role('button', name='Continuar').click()
        page.locator('#moment').select_option(label='Tenho meu próprio negócio')
        page.locator('#occupation').fill('Educação')
        page.get_by_role('button', name='De 3 a 5 anos', exact=True).click()
        page.get_by_role('button', name='Gravar áudio').click()
        page.get_by_role('button', name='Parar').wait_for()
        page.wait_for_timeout(1200)
        page.get_by_role('button', name='Parar').click()
        page.locator('audio').wait_for()
        assert page.locator('audio').count() == 1
        assert page.evaluate('navigator.mediaDevices !== undefined')
        page.locator('#context-upload').set_input_files({'name':'teste.pdf', 'mimeType':'application/pdf', 'buffer':b'%PDF-1.4\nTEST'})
        assert page.locator('#context-files .file-row').count() == 2
        page.get_by_role('button', name='Continuar').click()
        page.locator('#goals').fill('Desenvolver minha liderança e criar novas conexões.')
        page.locator('#interest').select_option(label='Liderança e pessoas')
        page.locator('#discovery').select_option(label='Indicação de alguém')
        page.locator('#goals-upload').set_input_files({'name':'nao-permitido.exe', 'mimeType':'application/octet-stream', 'buffer':b'test'})
        assert 'formato não suportado' in page.locator('#goals-error').inner_text()
        page.get_by_role('button', name='Continuar').click()
        assert page.get_by_role('heading', name='01 · Sobre você').is_visible()
        assert page.locator('audio').count() == 1
        page.locator('[data-edit="0"]').click()
        assert page.locator('#name').input_value() == 'Pessoa de Teste'
        page.locator('#name').fill('Pessoa Teste Editada')
        page.get_by_role('button', name='Continuar').click()
        page.get_by_role('button', name='Continuar').click()
        page.get_by_role('button', name='Continuar').click()
        page.get_by_role('button', name='Preparar minha cópia').click()
        assert 'Confirme' in page.locator('#confirm-error').inner_text()
        page.locator('#confirm').check()
        page.get_by_role('button', name='Preparar minha cópia').click()
        assert 'não enviou uma inscrição' in page.locator('main').inner_text()
        with page.expect_download() as download:
            page.get_by_role('button', name='Baixar minhas respostas').click()
        data = json.load(open(download.value.path()))
        assert data['status'] == 'prototipo_nao_enviado'
        assert data['respostas']['name'] == 'Pessoa Teste Editada'
        assert len(data['anexos']['context']) == 2
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        page.get_by_role('button', name='Apagar meus dados e recomeçar').click()
        page.get_by_role('button', name='Começar minha jornada').click()
        assert page.locator('#name').input_value() == ''
        assert not errors, errors
        print(f'PASS {width}px: validação, áudio, anexo, formato inválido, revisão, edição, exportação e limpeza')
        context.close()
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    page.goto(BASE)
    assert page.locator('.orb').evaluate('el => getComputedStyle(el).animationName') == 'none'
    page.screenshot(path='/tmp/ejn-desktop.png', full_page=True)
    page.set_viewport_size({'width':390, 'height':844})
    page.screenshot(path='/tmp/ejn-mobile.png', full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    print('PASS: movimento reduzido e largura da abertura no celular')
    browser.close()
