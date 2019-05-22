/* eslint-disable no-console */
import { api, LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ZIP from '@salesforce/resourceUrl/Zipper';

//zip.TextReader(text)

export default class CoastalZip extends LightningElement {

    @api header
    @api recordId

    renderedCallback() { // invoke the method when component rendered or loaded
        
        Promise.all([
            loadScript(this, ZIP + '/gildas-lormeau-zip.js-3e79208/WebContent/zip.js'),
            loadScript(this, ZIP + '/gildas-lormeau-zip.js-3e79208/WebContent/inflate.js'),
            loadScript(this, ZIP + '/gildas-lormeau-zip.js-3e79208/WebContent/deflate.js'),
        ])
        .then(() => { 
            this.error = undefined; // scripts loaded successfully
           
            // eslint-disable-next-line no-undef
            this.Zip = zip
            this.Zip.useWebWorkers = false

            this.initialize();
        })
        .catch(error => this.handleError(error))
    }

    async initialize(){

        console.dir('initialized this.Zip => ')
        console.dir(this.Zip)

    }

    handleClick(){

        // create the blob object storing the data to compress
        const data = new Blob([ this.getText() ], {
            type : "text/plain"
        })

        // creates a zip storing the file "lorem.txt" with blob as data
        // the zip will be stored into a Blob object (zippedBlob)
        this.zipBlob("lorem.txt", data, zippedBlob => {
            
            const a = document.createElement("a")
            //a.href = "data:text/csv;base64," + btoa(csv)
            a.href = URL.createObjectURL(zippedBlob);
            a.download = `CoastalZipper-${new Date().getTime()}`
            a.click()

            // unzip the first file from zipped data stored in zippedBlob
            this.unzipBlob(zippedBlob, unzippedBlob => {
                // logs the uncompressed Blob
                console.log('unzipped Blob => ');
                console.log(unzippedBlob);
            });
        })
    }

        
    zipBlob(filename, blob, callback) {
        // use a zip.BlobWriter object to write zipped data into a Blob object
        this.Zip.createWriter(new this.Zip.BlobWriter("application/zip"), zipWriter => {
        // use a BlobReader object to read the data stored into blob variable
        
        zipWriter.add(filename, new this.Zip.BlobReader(blob), function() {
            // close the writer and calls callback function
            zipWriter.close(callback);
        });
        }, onerror);
    }
    
    unzipBlob(blob, callback) {
        // use a zip.BlobReader object to read zipped data stored into blob variable
        this.Zip.createReader(new this.Zip.BlobReader(blob), zipReader => {
            
            // get entries from the zip file
            zipReader.getEntries(function(entries) {
                // get data from the first file
                entries[0].getData(new this.Zip.BlobWriter("text/plain"), function(data) {
                    // close the reader and calls callback function with uncompressed data as parameter
                    zipReader.close();
                    callback(data);
                });
            })
        }, onerror);
    }
    
    onerror(message) {
        
        this.toast('', message, 'error')
    }

    toast(title = this.header, message, variant) {
        
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
            })
        )
    }

    getText(){
        return `The Border Collie is a working and herding dog breed developed in the Scottish borders for herding livestock, especially sheep.[1] It was specifically bred for intelligence and obedience.

        Considered highly intelligent, extremely energetic, acrobatic and athletic, they frequently compete with great success in sheepdog trials and dog sports. They are often cited as the most intelligent of all domestic dogs.[2] Border Collies continue to be employed in their traditional work of herding livestock throughout the world.`
    }
}