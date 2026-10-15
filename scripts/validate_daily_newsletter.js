#!/usr/bin/env node
/* Pre-queue validator: executes the exact Apps Script production HTML contract in Node. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const [htmlPath,textPath] = process.argv.slice(2);
if (!htmlPath || !textPath) {
  console.error('Usage: node scripts/validate_daily_newsletter.js <html-file> <plain-text-file>');
  process.exit(2);
}
try {
  const html=fs.readFileSync(htmlPath,'utf8');
  const plain=fs.readFileSync(textPath,'utf8');
  const code=fs.readFileSync(path.join(__dirname,'../apps-script/DailyNewsletterContract.gs'),'utf8');
  const ctx=vm.createContext({});
  vm.runInContext(code,ctx,{timeout:1000});
  const report=ctx.adbValidateDailyNewsletterPayload_(html,plain);
  process.stdout.write(JSON.stringify({...report,status:'PASS'})+'\n');
} catch (error) {
  console.error('Newsletter pre-queue validation FAIL: '+String(error.message || error));
  process.exitCode=1;
}
