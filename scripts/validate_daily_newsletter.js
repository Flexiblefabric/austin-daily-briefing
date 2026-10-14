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
  const report=ctx.adbValidateDailyNewsletterHtml_(html);
  const htmlUrls=Array.from(html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi),m=>m[1].replace(/&amp;/g,'&'));
  const textUrls=plain.split(/\r?\n/).map(line=>line.trim()).filter(line=>/^https?:\/\//.test(line));
  if (htmlUrls.length !== textUrls.length ||
      htmlUrls.some((url,i)=>url!==textUrls[i])) {
    throw Error('HTML/plain-text URL count or destination order mismatch');
  }
  if (!plain.includes('AUSTIN PULSE') || !plain.includes('AUSTIN AHEAD'))
    throw Error('Plain text is missing required editorial sections');
  process.stdout.write(JSON.stringify({...report,destinations:htmlUrls.length,status:'PASS'})+'\n');
} catch (error) {
  console.error('Newsletter pre-queue validation FAIL: '+String(error.message || error));
  process.exitCode=1;
}
