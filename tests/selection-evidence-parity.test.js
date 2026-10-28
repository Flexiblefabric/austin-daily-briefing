'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const ctx=vm.createContext({Intl});vm.runInContext(fs.readFileSync('apps-script/SelectionEvidenceContract.gs','utf8'),ctx);
const vectors=JSON.parse(cp.execFileSync('python',['tests/selection-parity-vectors.py'],{encoding:'utf8'}));
test('JS selection gate agrees with established Python evidence vectors',()=>{
 assert(vectors.length>=40);
 vectors.forEach((v,i)=>{let valid=true;try{ctx.adbValidateSelectionEvidence(v.bundle);}catch(e){valid=false;}assert.equal(valid,v.valid,'vector '+i);});
 console.log('Compared '+vectors.length+' JSON-only selection vectors.');
});
