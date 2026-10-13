import {test,expect} from '@playwright/test';

async function chooseProfile(page:any,name='Nico'){
 await expect(page.getByRole('heading',{name:/Cómo te llamamos|What should we call you/})).toBeVisible();
 await page.locator('#profile-name').fill(name);
 await page.getByRole('button',{name:/Continuar|Continue/}).click();
}
test('nickname is mandatory, editable and persists on refresh',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:/Jugar local/})).toHaveCount(0);
 await chooseProfile(page);
 await expect(page.getByRole('button',{name:/Editar nombre/})).toContainText('Nico');
 await page.reload();
 await expect(page.getByRole('button',{name:/Jugar local/})).toBeVisible();
 await page.getByRole('button',{name:/Editar nombre/}).click();
 await page.locator('#profile-name').fill('Luz Ñ');
 await page.getByRole('button',{name:/Continuar/}).click();
 await expect(page.getByRole('button',{name:/Editar nombre/})).toContainText('Luz Ñ');
 await page.reload();
 await expect(page.getByRole('button',{name:/Editar nombre/})).toContainText('Luz Ñ');
});
test('local board stays compact and playable; PNG retains colored guesses',async({page},testInfo)=>{
 await page.goto('/');
 await chooseProfile(page);
 await page.getByRole('button',{name:/Jugar local/}).click();
 await page.getByRole('button',{name:'4',exact:true}).click();
 await page.getByRole('button',{name:/JUGAR/}).click();
 await expect(page.locator('.board-row')).toHaveCount(6);
 const measurements=await page.evaluate(()=>{
  const qs=(s:string)=>document.querySelector(s)!.getBoundingClientRect();
  return {tile:qs('.board-row .tile').width,keyBottom:qs('.keyboard').bottom,viewportHeight:window.innerHeight,viewportWidth:window.innerWidth,scrollWidth:document.documentElement.scrollWidth};
 });
 expect(measurements.tile).toBeLessThanOrEqual(60);
 expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.viewportWidth+1);
 expect(measurements.keyBottom).toBeLessThanOrEqual(measurements.viewportHeight+8);
 await page.waitForTimeout(1400);
 await page.screenshot({path:`test-results/${testInfo.project.name}-local-board.png`,fullPage:true});
 await page.keyboard.type('tuyo');
 await page.keyboard.press('Enter');
 await expect(page.locator('.board-row').first().locator('.tile.correct,.tile.present,.tile.absent')).toHaveCount(4);
 page.once('dialog',d=>d.accept());
 await page.getByRole('button',{name:/Rendirme/}).click();
 await expect(page.locator('.result-card')).toBeVisible({timeout:7000});
 await expect(page.locator('.result-attempt-row')).toHaveCount(1);
 await page.screenshot({path:`test-results/${testInfo.project.name}-result.png`,fullPage:true});
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:/GUARDAR CAPTURA PNG/}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/palabra-arena-ronda-1\.png$/);
});
test('online backend failure is clear without obsolete provider text',async({page})=>{
 await page.route('**/api/rooms',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'BACKEND_NOT_CONFIGURED'})}));
 await page.goto('/');
 await chooseProfile(page);
 await page.getByRole('button',{name:/Jugar online/}).click();
 await expect(page.getByRole('alert')).toContainText('Salas online temporalmente no disponibles');
 await expect(page.getByRole('alert')).not.toContainText('Netlify');
});

test('entry UI has brand as heading, clean copy and visible four-mode cards',async({page})=>{
 await page.goto('/');await chooseProfile(page);
 await expect(page.getByRole('heading',{name:'PALABRA ARENA'})).toBeVisible();
 await expect(page.getByText('PARTIDAS ILIMITADAS')).toHaveCount(0);
 await expect(page.getByText('0.2.4 · DEV')).toHaveCount(0);
 await page.getByRole('button',{name:/Jugar local/}).click();
 const modes=page.locator('.mode-picks button');
 await expect(modes).toHaveCount(4);
 await expect(page.locator('.language-choices button')).toHaveCount(3);
 await page.getByRole('button',{name:/Cultura general/}).click();
 await expect(page.locator('.mode-picks .selected')).toContainText('Cultura general');
});
