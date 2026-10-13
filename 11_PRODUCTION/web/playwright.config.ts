import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',timeout:30000,retries:1,workers:1,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1365,height:768}}},
  {name:'mobile',use:{...devices['Desktop Chrome'],viewport:{width:375,height:667},isMobile:true,hasTouch:true}}
 ],
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:30000}
});
