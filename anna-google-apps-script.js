/**
 * ============================================================
 *  ANNA — Google Sheets Lead Capture Script
 *  
 *  HOW TO SET UP (takes about 5 minutes):
 *
 *  1. Go to https://sheets.google.com and create a new spreadsheet
 *  2. Name it "Anna Leads"
 *  3. Add these headers in row 1 (one per column):
 *     Timestamp | Name | Email | Phone | Area | First Time Buyer | Source
 *
 *  4. Go to Extensions → Apps Script
 *  5. Delete any existing code in the editor
 *  6. Paste ALL of this code into the editor
 *  7. Click Save (💾 icon)
 *  8. Click Deploy → New Deployment
 *  9. Click the gear icon next to "Type" → select "Web App"
 * 10. Set "Execute as" → Me
 * 11. Set "Who has access" → Anyone
 * 12. Click Deploy
 * 13. Copy the Web App URL shown — it looks like:
 *     https://script.google.com/macros/s/XXXXX/exec
 * 14. Paste that URL into anna-mortgage-advisor.html on this line:
 *     const SHEETS_WEBHOOK = 'PASTE_YOUR_URL_HERE';
 * 15. Upload the updated anna-mortgage-advisor.html to Hostinger
 *
 *  That's it — every lead Anna captures will appear in your sheet!
 * ============================================================
 */

function doPost(e) {
  try {
    // Parse the incoming lead data
    const data = JSON.parse(e.postData.contents);
    
    // Open the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name', 
        'Email',
        'Phone',
        'Area in Scotland',
        'First Time Buyer',
        'Source'
      ]);
      
      // Style the header row
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setBackground('#2d6a4f');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Append the lead as a new row
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('en-GB'),
      data.name      || '—',
      data.email     || '—',
      data.phone     || '—',
      data.area      || '—',
      data.ftb       || '—',
      data.source    || 'anna.dodavahgroup.com'
    ]);
    
    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 7);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Lead saved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error (won't break Anna — she logs to console as backup)
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this in the Apps Script editor to verify it works
function testLead() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toLocaleString('en-GB'),
        name: 'Test User',
        email: 'test@example.com',
        phone: '07700 900000',
        area: 'Glasgow',
        ftb: 'Yes',
        source: 'anna.dodavahgroup.com'
      })
    }
  };
  const result = doPost(testData);
  Logger.log(result.getContent());
}
