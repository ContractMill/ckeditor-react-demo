/* global Utilities, ContentService, Logger, DocumentApp, DriveApp, Drive, UrlFetchApp, ScriptApp */

function doGet(){
  textOutput = ContentService.createTextOutput("Hello World! Welcome to the web app.")
  return textOutput
}

function doPost(e) {
  console.log(e.parameter)
  var blob = Utilities.newBlob('', {mimeType:"text/html"}).setDataFromString(e.parameter.document,'UTF-8').setContentType("text/html").setName("Document")
  var file = {
    title: 'Document title',
    mimeType: 'application/vnd.google-apps.document'
  }
  Logger.log('file %s', JSON.stringify(file))
  
  var newfile
  try {
    newfile = Drive.Files.insert(file, blob, {"convert":"true"})
  } catch(e) {
    Logger.log(e)
  }
  console.log('File information: %s', JSON.stringify(newfile))
  var doc = DocumentApp.openById(newfile.id)
  console.log('File: %s', JSON.stringify(doc.getBody().getParagraphs()))
  var pars = doc.getBody().getParagraphs()
  pars.map(function (par) { console.log(par.getText()) })
  if (e.parameter.header || e.parameter.footer) {
    doc = appendColontituls(doc, e.parameter.header, e.parameter.footer)
  } else if (e.parameter.header && typeof e.parameter.header === 1) {
    doc = appendHeaderToDoc(doc)
  }
  doc = appendPageBreaks(doc)
  setMargins(e.parameter.document, doc.getBody())
  
  if (e.parameter.pageNumbers) {
    appendPageNumber(doc)
  }
//  appendTOC(doc)

  doc.saveAndClose()
  var blobForDocx = getBlob(doc.getId())
  var docxFile = saveFileAsDocx(blobForDocx)
//  console.info(docxFile.getId())
  docxFile = DriveApp.getFileById(docxFile.getId())
  docxFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT)
//  console.log('Permissions')
//  console.log(docxFile.getSharingAccess())
//  console.log(docxFile.getSharingPermission())
  var downloadLink = 'https://drive.google.com/uc?export=download&id=' + docxFile.getId()
  var textOutput = ContentService.createTextOutput(downloadLink)
  console.info(downloadLink)
  return textOutput
}

function appendTOC (doc) {
  var body = getTOCelement()
  doc.getBody() = body
//  pars = toc
}

function getTOCelement() {
  var tocDoc = '1FzUyKQ5S0DMBapJHjjRB2zWVwGihDusfSB16gYbdus8'
  var doc = DocumentApp.openById(tocDoc)
  var body = doc.getBody()
  var num = body.getNumChildren()
  var toc = body.getChild(1)
  body.getChild(3).removeFromParent()
  body.getChild(2).removeFromParent()
  body.getChild(0).removeFromParent()
  return body.copy()
}

function appendPageNumber(doc) {
  var footer = doc.getFooter()
  var par = getPageNumberElement()
  footer.appendParagraph(par)
}

function getPageNumberElement() {
  var pageNumberDocId = '1v60j6dquEb8Z7YeB7-WujrSIOMAEU2CLflIrBjI0obk'
  var doc = DocumentApp.openById(pageNumberDocId)
  var footer = doc.getFooter()
  var pars = footer.getParagraphs()
  var p = pars[0].copy()
  return p
}

function appendHeaderToDoc(doc) {
  var header = doc.addHeader()
  var style = {}
  style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.RIGHT
  style[DocumentApp.Attribute.FONT_FAMILY] = 'Times New Roman'
  style[DocumentApp.Attribute.FONT_SIZE] = 11
  var par = header.appendParagraph('DRAFT\nCONFIDENTIAL')
  par.setAttributes(style)
  return doc 
}

function appendCustomHeader(doc, header) {
  console.info('doc: ' + doc, ' header: ' + header)
  var body = doc.getBody()
  var blob = Utilities.newBlob('', {mimeType:"text/html"}).setDataFromString(header,'UTF-8').setContentType("text/html").setName("Header")
  var file = {
    title: 'Document header',
    mimeType: 'application/vnd.google-apps.document'
  }
  var headerfile = Drive.Files.insert(file, blob, {"convert":"true"})
  var headerDoc = DocumentApp.openById(headerfile.id)
  var headerPars = headerDoc.getBody().getParagraphs()
  
  var docHeader = doc.addHeader()
//  docHeader.appendParagraph(headerPars.copy())
  headerPars.map(function (par) {docHeader.appendParagraph(par.copy())})
  DriveApp.getFolderById(headerDoc.getId()).setTrashed(true)
  return doc
}


function appendColontituls(doc, header, footer) {
  console.info('doc: ' + doc, ' header: ' + header, 'footer: ' + footer)
  var body = doc.getBody()
  var blob1 = Utilities.newBlob('', {mimeType:"text/html"}).setDataFromString(header,'UTF-8').setContentType("text/html").setName("Header")
  var file1 = {
    title: 'Document header',
    mimeType: 'application/vnd.google-apps.document'
  }
  var headerfile = Drive.Files.insert(file1, blob1, {"convert":"true"})
  var headerDoc = DocumentApp.openById(headerfile.id)
  var headerPars = headerDoc.getBody().getParagraphs()
  
  var docHeader = doc.addHeader()
//  docHeader.appendParagraph(headerPars.copy())
  headerPars.map(function (par) {docHeader.appendParagraph(par.copy())})
//  docHeader = headerDoc.getBody().copy()
  
  //footer
  var blob2 = Utilities.newBlob('', {mimeType:"text/html"}).setDataFromString(footer,'UTF-8').setContentType("text/html").setName("Footer")
  var file2 = {
    title: 'Document footer',
    mimeType: 'application/vnd.google-apps.document'
  }
  var footerfile = Drive.Files.insert(file2, blob2, {"convert":"true"})
  var footerDoc = DocumentApp.openById(footerfile.id)
  var footerPars = footerDoc.getBody().getParagraphs()
  var docFooter = doc.addFooter()
  footerPars.map(function (par) {docFooter.appendParagraph(par.copy())})
  DriveApp.getFolderById(footerDoc.getId()).setTrashed(true)
  DriveApp.getFolderById(headerDoc.getId()).setTrashed(true)
  return doc
}

function setMargins(html, docBody) {
  var regexP = /margin-(top|left|right|bottom): ?(\d+)px;?/
  var regexG = /margin-(top|left|right|bottom): ?(\d+)px;?/g
  var regexD = /margin: ?(\d*)px ?(\d*)px ?(\d*)px ?(\d*)px;?/
  var bodyStyleMatch = html.match(/<(?:body|div).*?style=\\?"(.*?)\\?"/)
  if (bodyStyleMatch) {
    var style = bodyStyleMatch[1]
    var margins = style.match(regexG)
    if (margins) {
      margins.map(function (margin) {
        var m = margin.match(regexP)
        switch (m[1]) {
          case ('top'):
            docBody.setMarginTop(Math.round(m[2] * 3/4))
            break
          case ('bottom'):
            docBody.setMarginBottom(Math.round(m[2] * 3/4))
            break
          case ('left'):
            docBody.setMarginLeft(Math.round(m[2] * 3/4))
            break
          case ('right'):
            docBody.setMarginRight(Math.round(m[2] * 3/4))
            break
        }
      })
    } else {
      margins = style.match(regexD)
      if (margins) {
        docBody.setMarginTop(Math.round(margins[1] * 3/4))
        docBody.setMarginBottom(Math.round(margins[2] * 3/4))
        docBody.setMarginLeft(Math.round(margins[3] * 3/4))
        docBody.setMarginRight(Math.round(margins[4] * 3/4))
      }
    }
  }
}

function appendPageNumbers() {
}

function getBlob(documentId) {
 var file = Drive.Files.get(documentId);
 var url = file.exportLinks['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
 var oauthToken = ScriptApp.getOAuthToken();
 var response = UrlFetchApp.fetch(url, {
   headers: {
     'Authorization': 'Bearer ' + oauthToken
   }
 });
 return response.getBlob();
}

function saveFileAsDocx(blob) {
  var file = {
    title: 'Converted_into_MS_Word.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  file = Drive.Files.insert(file, blob);
  Logger.log('ID: %s, File size (bytes): %s', file.id, file.fileSize);
  return file;
}

function parseHTMLdocument(doc) {
  var document = XmlService.parse(doc)
  return document
}

function appendPageBreaks(doc) {
  var paragraphs = doc.getBody().getParagraphs()
  paragraphs.map(function (par) {
    console.log(par.getText())
    if (par.getText() === '[pageBreak]') {
      par.clear()
      par.appendPageBreak()
    }
  })
  return doc
}

function debugDoPost() {
  var e = {"type":"application/json","length":5180,parameter:{ document: '<html dir="ltr" lang="en"><head><title data-cke-title="Визуальный текстовый редактор, ckdemo">Визуальный текстовый редактор, ckdemo</title><style data-cke-temp="1">html{cursor:text;*cursor:auto} img,input,textarea{cursor:default}</style><link type="text/css" rel="stylesheet" href="https://ckeditor.com/assets/libs/ckeditor4/4.8.0/contents.css?t=HBDC"><link type="text/css" rel="stylesheet" href="https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/copyformatting/styles/copyformatting.css"><link type="text/css" rel="stylesheet" href="https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/tableselection/styles/tableselection.css"><style data-cke-temp="1">.cke_editable{cursor:text}.cke_editable img,.cke_editable input,.cke_editable textarea{cursor:default} .cke_widget_wrapper{position:relative;outline:none}.cke_widget_inline{display:inline-block}.cke_widget_wrapper:hover>.cke_widget_element{outline:2px solid yellow;cursor:default}.cke_widget_wrapper:hover .cke_widget_editable{outline:2px solid yellow}.cke_widget_wrapper.cke_widget_focused>.cke_widget_element,.cke_widget_wrapper .cke_widget_editable.cke_widget_editable_focused{outline:2px solid #ace}.cke_widget_editable{cursor:text}.cke_widget_drag_handler_container{position:absolute;width:15px;height:0;display:none;opacity:0.75;transition:height 0s 0.2s;line-height:0}.cke_widget_wrapper:hover>.cke_widget_drag_handler_container{height:15px;transition:none}.cke_widget_drag_handler_container:hover{opacity:1}img.cke_widget_drag_handler{cursor:move;width:15px;height:15px;display:inline-block}.cke_widget_mask{position:absolute;top:0;left:0;width:100%;height:100%;display:block}.cke_editable.cke_widget_dragging, .cke_editable.cke_widget_dragging *{cursor:move !important} .cke_contents_ltr a.cke_anchor,.cke_contents_ltr a.cke_anchor_empty,.cke_editable.cke_contents_ltr a[name],.cke_editable.cke_contents_ltr a[data-cke-saved-name]{background:url(https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/link/images/anchor.png?t=HBDC) no-repeat left center;border:1px dotted #00f;background-size:16px;padding-left:18px;cursor:auto;}.cke_contents_ltr img.cke_anchor{background:url(https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/link/images/anchor.png?t=HBDC) no-repeat left center;border:1px dotted #00f;background-size:16px;width:16px;min-height:15px;height:1.15em;vertical-align:text-bottom;}.cke_contents_rtl a.cke_anchor,.cke_contents_rtl a.cke_anchor_empty,.cke_editable.cke_contents_rtl a[name],.cke_editable.cke_contents_rtl a[data-cke-saved-name]{background:url(https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/link/images/anchor.png?t=HBDC) no-repeat right center;border:1px dotted #00f;background-size:16px;padding-right:18px;cursor:auto;}.cke_contents_rtl img.cke_anchor{background:url(https://ckeditor.com/assets/libs/ckeditor4/4.8.0/plugins/link/images/anchor.png?t=HBDC) no-repeat right center;border:1px dotted #00f;background-size:16px;width:16px;min-height:15px;height:1.15em;vertical-align:text-bottom;} .cke_upload_uploading img{opacity: 0.3}</style></head><body class="document-editor cke_editable cke_editable_themed cke_contents_ltr" contenteditable="true" spellcheck="false"><h2 style="text-align:center">The Flavorful Tuscany Meetup</h2><p style="text-align:center"><span style="color:#007ac9"><strong>Welcome letter</strong></span></p><p>Dear Guest,</p><p>We are delighted to welcome you to the annual <em>Flavorful Tuscany Meetup</em> and hope you will enjoy the programme as well as your stay at the Bilancino Hotel.</p><p>Please find below the full schedule of the event.</p><table cellpadding="15" cellspacing="0" style="width:100%"><thead><tr><th colspan="2" scope="col" style="background-color:#f2f9ff; text-align:center">Saturday, July 14</th></tr></thead><tbody><tr><td style="white-space:nowrap">9:30 AM - 11:30 AM</td><td>Americano vs. Brewed - “know your coffee” session with <strong>Stefano Garau</strong></td></tr><tr><td style="white-space:nowrap">1:00 PM - 3:00 PM</td><td>Pappardelle al pomodoro - live cooking session with <strong>Rita Fresco</strong></td></tr><tr><td style="white-space:nowrap">5:00 PM - 8:00 PM</td><td>Tuscan vineyards at a glance - wine-tasting session with <strong>Frederico Riscoli</strong></td></tr></tbody></table><blockquote><p>The annual Flavorful Tuscany meetups are always a culinary discovery. You get the best of Tuscan flavors during an intense one-day stay at one of the top hotels of the region. All the sessions are lead by top chefs passionate about their profession. I would certainly recommend to save the date in your calendar for this one!</p><p>Angelina Calvino, food journalist</p></blockquote><p>Please arrive at the Bilancino Hotel reception desk at least <strong>half an hour earlier</strong> to make sure that the registration process goes as smoothly as possible.</p><p>We look forward to welcoming you to the event.</p><p><br></p><p><strong>Victoria Valc</strong></p><p><strong>Event Manager</strong></p><p><strong>Bilancino Hotel</strong></p></body></html>',
                                                              docId: '1', header: '<p>My header</p>' },"name":"postData"}

  doPost(e)
}

function debugDoPost2() {
  var e = {"type":"application/json","length":5180,parameter:{ 
    document: '<html lang="ru"><head></head><body style="margin-top: 123px; margin-bottom: 500px; margin-left: 213px;"><p style="margin-bottom: 300%;">Content paragraph - multiline<br><span style="line-height:300%;"><h1>Title!</h1><br>suchmultiline<br>[pageBreak]<br>its a last string in span<br><br></span></p><p>Content paragraph - <span style="font-family:\'Open Sans\';">font family</span><br></p></body></html>',
    header: '<p>header</p>',
    footer: '<p>footer</p>'
  },"name":"postData"}

  doPost(e)
}
