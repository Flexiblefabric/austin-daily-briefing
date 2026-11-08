'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {loadCapture,projectArchiveContent,wireRequest}=require('../scripts/measure_publisher_capacity');
const C={BUILD:'TEST',SUFFIX:' Awaiting Resend dispatcher delivery.',MAX_BYTES:1800000,
 QUEUE:['Message ID','Profile ID','Email','HTML','Plain Text','Status','Run ID','Notes','Sent At / Gmail ID'],
 HISTORY:['Profile ID','Notes','Delivery Status','Provider Message ID','Run ID'],
 LEDGER:['Edition Key','Package SHA-256','Run ID','Profile Count','History Count','Committed At']};
function content(){return {queue:[{'Profile ID':'PRIVATE-ID',Email:'private@example.invalid',HTML:'x'.repeat(600000),'Plain Text':'body',Status:'Sent','Sent At / Gmail ID':'PRIVATE-PROVIDER'}],
 history:[{'Profile ID':'PRIVATE-ID',Notes:'ADB-SELECTION-NOTE-1 '+JSON.stringify({schema:'ADB-SELECTION-NOTE-1',candidate:{fact:'PRIVATE-FACT'}})+' Delivered.', 'Delivery Status':'Sent','Provider Message ID':'PRIVATE-PROVIDER'}]};}
test('realistic payload headroom fails closed without splitting the atomic transaction',()=>{
 const x=content(),before=JSON.stringify(x),one=projectArchiveContent(C,x.queue,x.history,2,'2026-11-06'),two=projectArchiveContent(C,x.queue,x.history,4,'2026-11-06');
 assert.equal(one.withinApplicationLimit,true);assert.equal(two.withinApplicationLimit,false);assert.ok(two.headroomBytes<0);
 assert.equal(one.withinDevCellGuard,false);assert.equal(JSON.stringify(x),before);
 assert.doesNotMatch(JSON.stringify([one,two]),/PRIVATE|private@example/);
});
test('typed wire request keeps all three appends and numeric ledger counts',()=>{
 const request=wireRequest(C,[],[],{'Profile Count':12,'History Count':193});
 assert.equal(request.requests.length,3);assert.equal(request.requests[2].appendCells.rows[0].values[3].userEnteredValue.numberValue,12);
 assert.equal(request.requests[2].appendCells.rows[0].values[4].userEnteredValue.numberValue,193);
 assert.throws(()=>wireRequest(C,[{HTML:{formula:'bad'}}],[],{}),/non-literal cell/);
});
test('projection refuses missing or unstructured matching history',()=>{
 const x=content();assert.throws(()=>projectArchiveContent(C,x.queue,[],1,'2026-11-06'),/pairing missing/);
 x.history[0].Notes='legacy';assert.throws(()=>projectArchiveContent(C,x.queue,x.history,1,'2026-11-06'),/unstructured evidence/);
});
function fixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'capacity-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const manifest={historyGridRows:4,historyChunks:[{file:'history-00.json',start:2,end:3},{file:'history-01.json',start:4,end:4}],queueFile:'current-queue.json'};
 const write=(file,value)=>fs.writeFileSync(path.join(dir,file),JSON.stringify(value));
 write('manifest.json',manifest);write('input-tables.json',{});write('history-00.json',[[1],[2]]);write('history-01.json',[[3]]);write('current-queue.json',[]);
 return {dir,manifest,write};
}
test('complete bounded archive capture loads every physical row',t=>{const x=fixture(t);assert.deepEqual(loadCapture(x.dir).history,[[1],[2],[3]]);});
test('gapped, truncated and missing final history ranges are rejected',t=>{
 const x=fixture(t);x.manifest.historyChunks[1].start=5;x.write('manifest.json',x.manifest);assert.throws(()=>loadCapture(x.dir),/gapped/);
 x.manifest.historyChunks[1].start=4;x.write('manifest.json',x.manifest);x.write('history-01.json',[]);assert.throws(()=>loadCapture(x.dir),/short/);
 x.manifest.historyChunks.pop();x.write('manifest.json',x.manifest);assert.throws(()=>loadCapture(x.dir),/incomplete/);
});
