/** @OnlyCurrentDoc */
const ADB_RECOVERY_QA_NAME = 'ADB Recovery QA Disposable';
const ADB_RECOVERY_QA_KEY = 'ADB_RECOVERY_QA_RECEIPT';
const ADB_RECOVERY_QA_QUEUE = ['Status', 'Sent At / Gmail ID', 'Notes'];
const ADB_RECOVERY_QA_HISTORY = ['Delivery Status', 'Provider Message ID', 'Notes'];

function injectAdbRecoveryQaWriteFailure() {
  const book = adbRecoveryQaBook_();
  const props = PropertiesService.getScriptProperties();
  const sheets = book.getSheets();
  if (props.getProperty(ADB_RECOVERY_QA_KEY) || sheets.length !== 1 || sheets[0].getLastRow() !== 0) {
    throw new Error('Start with a fresh, empty disposable workbook.');
  }
  const queue = book.insertSheet('QA Queue');
  const history = book.insertSheet('QA History');
  queue.getRange(1, 1, 2, 3).setValues([ADB_RECOVERY_QA_QUEUE, ['Queued', '', '']]);
  history.getRange(1, 1, 2, 3).setValues([ADB_RECOVERY_QA_HISTORY, ['Pending', '', 'Synthetic']]);
  SpreadsheetApp.flush();

  const receipt = {bookId: book.getId(), providerId: 'qa-simulated-receipt', acceptedAt: new Date().toISOString()};
  props.setProperty(ADB_RECOVERY_QA_KEY, JSON.stringify(receipt));
  const injected = new Error('Injected queue status write failure');
  const faultingQueue = {
    getRange(row, column) {
      if (row === 2 && column === 1) throw injected;
      return queue.getRange(row, column);
    }
  };
  try {
    adbRecoveryQaApply_(queue, history, receipt, faultingQueue);
    throw new Error('Expected the injected failure.');
  } catch (error) {
    if (error !== injected) throw error;
  }
  SpreadsheetApp.flush();
  adbRecoveryQaVerify_(queue, history, receipt, 'Queued');
  console.log(JSON.stringify({result: 'PASS', phase: 'INTERRUPTED', queueStatus: 'Queued',
    historyStatus: 'Sent', savedReceipt: true, provider: 'simulated'}));
}

function reconcileAdbRecoveryQaReceipt() {
  const book = adbRecoveryQaBook_();
  const props = PropertiesService.getScriptProperties();
  const receipt = JSON.parse(props.getProperty(ADB_RECOVERY_QA_KEY) || 'null');
  if (!receipt || receipt.bookId !== book.getId() || receipt.providerId !== 'qa-simulated-receipt') {
    throw new Error('Run the injection phase in this disposable workbook first.');
  }
  const queue = book.getSheetByName('QA Queue');
  const history = book.getSheetByName('QA History');
  adbRecoveryQaApply_(queue, history, receipt, queue);
  adbRecoveryQaVerify_(queue, history, receipt, 'Sent');
  props.deleteProperty(ADB_RECOVERY_QA_KEY);
  console.log(JSON.stringify({result: 'PASS', phase: 'RECONCILED', queueStatus: 'Sent',
    historyStatus: 'Sent', savedReceipt: false, provider: 'simulated'}));
}

function adbRecoveryQaBook_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book || book.getName() !== ADB_RECOVERY_QA_NAME) {
    throw new Error('Use the bound project in a workbook named ' + ADB_RECOVERY_QA_NAME + '.');
  }
  return book;
}

function adbRecoveryQaApply_(queue, history, receipt, writableQueue) {
  function read(sheet, expected) {
    if (!sheet || sheet.getLastRow() !== 2 || sheet.getLastColumn() !== 3) {
      throw new Error('Unexpected disposable fixture dimensions.');
    }
    const [headers, values] = sheet.getRange(1, 1, 2, 3).getDisplayValues();
    if (JSON.stringify(headers) !== JSON.stringify(expected)) throw new Error('Unexpected fixture headers.');
    return {
      entry: {sheetRow: 2, values: Object.fromEntries(headers.map((header, i) => [header, values[i]]))},
      columns: Object.fromEntries(headers.map((header, i) => [header, i + 1]))
    };
  }
  const q = read(queue, ADB_RECOVERY_QA_QUEUE);
  const h = read(history, ADB_RECOVERY_QA_HISTORY);
  adbDailyRecordReceipt_(q.entry, [h.entry], receipt, writableQueue, q.columns, history, h.columns);
}

function adbRecoveryQaVerify_(queue, history, receipt, queueStatus) {
  const [status, evidence] = queue.getRange(2, 1, 1, 3).getDisplayValues()[0];
  const [historyStatus, provider, notes] = history.getRange(2, 1, 1, 3).getDisplayValues()[0];
  if (status !== queueStatus || evidence !== receipt.acceptedAt + ' | Resend ID ' + receipt.providerId ||
      historyStatus !== 'Sent' || provider !== receipt.providerId ||
      notes !== 'Synthetic | Resend accepted ' + receipt.acceptedAt + '.') {
    throw new Error('Unexpected queue or history readback.');
  }
}

// Exact copy of the receipt writer at PR #122 commit c77559d.
function adbDailyRecordReceipt_(entry, matches, receipt, queueSheet, queueColumns, historySheet, historyColumns) {
  const acceptedAt = receipt.acceptedAt;
  const providerId = receipt.providerId;
  const queueEvidence = acceptedAt + ' | Resend ID ' + providerId;
  const oldQueueEvidence = String(entry.values['Sent At / Gmail ID'] || '').trim();
  if (!matches.length || (oldQueueEvidence && oldQueueEvidence !== queueEvidence) ||
      matches.some(function(item) {
        const state = String(item.values['Delivery Status'] || '').trim().toUpperCase();
        const id = String(item.values['Provider Message ID'] || '').trim();
        return !['PENDING', 'SENT'].includes(state) || (id && id !== providerId);
      })) {
    throw new Error('Daily receipt conflicts with Sheets evidence at queue row ' + entry.sheetRow + '.');
  }
  const acceptanceNote = 'Resend accepted ' + acceptedAt + '.';
  matches.forEach(function(item) {
    const prior = String(item.values.Notes || '').trim();
    const parts = prior ? prior.split(' | ') : [];
    if (!parts.includes(acceptanceNote)) parts.push(acceptanceNote);
    historySheet.getRange(item.sheetRow, historyColumns['Provider Message ID']).setValue(providerId);
    historySheet.getRange(item.sheetRow, historyColumns.Notes).setValue(parts.join(' | '));
    historySheet.getRange(item.sheetRow, historyColumns['Delivery Status']).setValue('Sent');
    item.values['Provider Message ID'] = providerId;
    item.values['Delivery Status'] = 'Sent';
  });
  queueSheet.getRange(entry.sheetRow, queueColumns['Sent At / Gmail ID']).setValue(queueEvidence);
  queueSheet.getRange(entry.sheetRow, queueColumns.Notes)
    .setValue('Resend accepted; subscriber eligibility rechecked immediately before delivery.');
  queueSheet.getRange(entry.sheetRow, queueColumns.Status).setValue('Sent');
  SpreadsheetApp.flush();
  entry.values.Status = 'Sent';
}
