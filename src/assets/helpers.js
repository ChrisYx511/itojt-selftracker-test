export function generateDateString() {
    let date = new Date()
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    const hours = ('0' + date.getHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    let dateString = `${year}_${month}_${day}-${hours}_${minutes}`
    return dateString
}



    // Function to download data to a file
export function startDownloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.href = url;
    downloadLink.download = fileName;
    
    // Append download link to the DOM and trigger a click to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up after the download is complete
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    //location.reload()
}