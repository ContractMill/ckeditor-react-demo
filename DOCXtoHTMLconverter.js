/* global Utilities, ContentService, Logger, DriveApp, Drive */

function doPost (e) {
  Logger.log(e)
  console.log(e)
  var base64File = e.parameter.docFile
//  console.log(getBlobAsHtml(base64File))
//  return
  var htmlLink = saveFileFromBase64(base64File)
  return ContentService.createTextOutput(htmlLink)
}

function doGet () {
  return ContentService.createTextOutput('version1')
}

function saveFileFromBase64 (string64) {
  var byteDataArray = Utilities.base64Decode(string64)
  var blob = Utilities.newBlob(byteDataArray)
  var file = {
    title: 'documentos.doc',
    mimeType: 'application/vnd.google-apps.document'
  }
  file = Drive.Files.insert(file, blob)
  docxFile = DriveApp.getFileById(file.getId())
  docxFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT)
  console.log('ID: %s, File size (bytes): %s', file.id, file.fileSize)
  console.log(file.exportLinks['text/html'])
  var exportLink = file.exportLinks['text/html']
  return exportLink
}

function getBlobAsHtml (string64) {
  var byteDataArray = Utilities.base64Decode(string64)
  var blob = Utilities.newBlob(byteDataArray)
  console.log(blob)
  var html = blob.getAs('text/html')
  return html
}

function saveBlob (blob) {
  var file = {
    title: 'documentosBlobus.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  Drive.Files.insert(resource, mediaData, {parents: []})
  file = Drive.Files.insert(file, blob)
  console.log('ID: %s, File size (bytes): %s', file.id, file.fileSize)
}

function debugDoPost () {
  doPost({
    parameter: {
      docFile: ''
    }
  })
}

function Test2 () {
  var file = DriveApp.getFolderById('1_hBV5EZLX0JBsq8gX952tsZfUErTFTmR').createFile('File2', 'Empty')
  var id = DriveApp.getFolderById('1_hBV5EZLX0JBsq8gX952tsZfUErTFTmR').getId()
  Logger.log(file)
//  DriveApp.getFolderById(id).createFile('File2', 'Empty');
}
