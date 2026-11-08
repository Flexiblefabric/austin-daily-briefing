/** Standalone read-only timing probe. Install with the companion manifest. */
function runAdbNativeCapacityProbeV1() {
  const token = ScriptApp.getOAuthToken();
  const report = adbMeasureNativeCapacity_({
    now: Date.now,
    sleep: ms => Utilities.sleep(ms),
    jitter: () => Math.floor(Math.random() * 500),
    digest: value => Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)),
    get: url => {
      const response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: {Authorization: 'Bearer ' + token},
        followRedirects: false,
        muteHttpExceptions: true
      });
      return {status: response.getResponseCode(), body: response.getContentText()};
    }
  });
  console.log(JSON.stringify(report));
  return report;
}

function adbMeasureNativeCapacity_(io) {
  const database = '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0';
  const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets/' + database;
  const historyName = 'Briefing History';
  const tableNames = ['Subscribers', 'Profiles', 'Preferences', 'Message Templates', 'Outbound Messages'];
  const start = io.now();
  // Reserve 180 seconds for a Sheets request and 60 more for overhead.
  // This guard controls when calls start. It cannot cancel an in-flight call.
  const cutoff = start + 120000;
  const requestLimit = 50;
  const chunkRows = 600;
  const report = {
    probe: 'ADB-NATIVE-CAPACITY-1',
    result: 'BLOCKED',
    quotaScope: 'executing user and standalone inspection project',
    requestLimit,
    requests: 0,
    retries: 0,
    sheetsReadMs: 0,
    passes: []
  };

  class ProbeStop extends Error {}

  function get(path) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (io.now() >= cutoff) throw new ProbeStop('DEADLINE');
      if (report.requests >= requestLimit) throw new ProbeStop('REQUEST_BUDGET');
      report.requests++;
      const callStart = io.now();
      let response;
      try {
        response = io.get(baseUrl + path);
      } catch (error) {
        throw new ProbeStop('FETCH_ERROR');
      } finally {
        report.sheetsReadMs += io.now() - callStart;
      }
      if (io.now() >= cutoff) throw new ProbeStop('DEADLINE');
      if (response.status === 200) return JSON.parse(response.body);

      let reasons = [];
      if (response.status === 403) {
        reasons = (JSON.parse(response.body).error?.errors || []).map(entry => entry.reason);
      }
      const retryable = [429, 500, 502, 503, 504].includes(response.status) ||
        reasons.some(reason => ['rateLimitExceeded', 'userRateLimitExceeded'].includes(reason));
      if (!retryable || attempt === 2) throw new ProbeStop('HTTP_' + response.status);
      const delay = 1000 * 2 ** attempt + io.jitter();
      if (io.now() + delay >= cutoff) throw new ProbeStop('DEADLINE');
      if (report.requests >= requestLimit) throw new ProbeStop('REQUEST_BUDGET');
      report.retries++;
      io.sleep(delay);
    }
  }

  function values(ranges) {
    const query = ranges.map(range => 'ranges=' + encodeURIComponent(range)).join('&');
    const response = get('/values:batchGet?valueRenderOption=FORMATTED_VALUE&' + query);
    if (response.valueRanges?.length !== ranges.length) throw new ProbeStop('RANGE_COUNT');
    return response.valueRanges.map(range => range.values || []);
  }

  function columns(rows, required) {
    const headers = rows[0] || [];
    return required.map(name => {
      const index = headers.indexOf(name);
      if (index < 0 || index !== headers.lastIndexOf(name)) throw new ProbeStop('SCHEMA');
      return index;
    });
  }

  function snapshot() {
    const passStart = io.now();
    const metadata = get('?fields=spreadsheetId,sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))');
    if (metadata.spreadsheetId !== database) throw new ProbeStop('WORKBOOK_ID');
    const sheets = new Map(metadata.sheets.map(sheet => [sheet.properties.title, sheet.properties]));
    const selected = [...tableNames, historyName].map(name => {
      const sheet = sheets.get(name);
      if (!sheet?.gridProperties) throw new ProbeStop('MISSING_TABLE');
      return sheet;
    });
    const historyGrid = sheets.get(historyName).gridProperties;
    if (historyGrid.columnCount < 12) throw new ProbeStop('SCHEMA');
    const lastRow = historyGrid.rowCount;
    const historyChunks = Math.ceil((lastRow - 1) / chunkRows);
    if (lastRow < 2 || 2 * (historyChunks + 3) > requestLimit) {
      throw new ProbeStop('HISTORY_GRID_BUDGET');
    }
    const ranges = tableNames.map(name => {
      const grid = sheets.get(name).gridProperties;
      if (name === 'Outbound Messages') {
        if (grid.columnCount < 13) throw new ProbeStop('SCHEMA');
        return "'Outbound Messages'!A1:M1";
      }
      if (grid.rowCount > 5000) throw new ProbeStop('INPUT_GRID_BUDGET');
      const column = String.fromCharCode(64 + Math.min(26, grid.columnCount));
      return "'" + name + "'!A1:" + column + grid.rowCount;
    });
    const tables = values(ranges);
    const [subscribers, profiles] = tables;
    const [id, status, admin] = columns(subscribers, ['Profile ID', 'Status', 'Admin Status']);
    const [profileId, profileStatus] = columns(profiles, ['Profile ID', 'Status']);
    const eligible = subscribers.slice(1).filter(row => row[status] === 'Active' && row[admin] === 'OK');
    const eligibleIds = new Set(eligible.map(row => row[id]));
    if (eligibleIds.has(undefined) || eligibleIds.has('') || eligibleIds.size !== eligible.length ||
        eligible.some(row => {
          const matches = profiles.slice(1).filter(profile => profile[profileId] === row[id]);
          return matches.length !== 1 || matches[0][profileStatus] !== 'Active';
        })) throw new ProbeStop('AUDIENCE_IDENTITY');

    const [header] = values(["'Briefing History'!A1:L1"]);
    const [deliveryStatus] = columns(header, ['Delivery Status']);
    const digests = [io.digest(JSON.stringify([selected, tables, header]))];
    let historyRows = 0;
    let sentRows = 0;
    for (let first = 2; first <= lastRow; first += chunkRows) {
      const last = Math.min(first + chunkRows - 1, lastRow);
      const [rows] = values(["'Briefing History'!A" + first + ':L' + last]);
      historyRows += rows.filter(row => row.some(value => value !== '')).length;
      sentRows += rows.filter(row => row[deliveryStatus] === 'Sent').length;
      digests.push(io.digest(JSON.stringify(rows)));
    }
    if (io.now() >= cutoff) throw new ProbeStop('DEADLINE');
    report.passes.push({
      eligibleProfiles: eligible.length,
      historyRows,
      sentRows,
      historyChunks,
      elapsedMs: io.now() - passStart
    });
    return digests;
  }

  try {
    const first = snapshot();
    const second = snapshot();
    if (JSON.stringify(first) !== JSON.stringify(second)) throw new ProbeStop('INPUT_CHANGED');
    report.result = 'PASS';
  } catch (error) {
    report.reason = error instanceof ProbeStop ? error.message : 'UNEXPECTED_RESPONSE';
  }
  report.elapsedMs = io.now() - start;
  return report;
}
