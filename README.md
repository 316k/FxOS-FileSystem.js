FileSystem.js
=============

This class is a wrapper for the non-standard Firefox OS DeviceStorage object.

## Usage

As all of the DeviceStorage operations may take a while to execute, Mozilla
developers thought it would be a good idea to use callback for everything that
happens, ever. Don't be surprised to see lots of callbacks in the methods.

### Available functions

See the JSDoc in the code for a full reference.

* `Constructor` : Constructor for FileSystem
* `exists` : Checks if a file exists on the device
* `save_blob` : Saves a Blob object on the device
* `save` : Saves a text file on the device
* `open` : Opens a file from the device
* `read_as_text` : Reads a text file from the device
* `delete` : Deletes a file from the device
* `list` : Lists files on the device
* `space` : Gets the free/used space in bytes on the device

### Examples

To get the content of all the .txt files on the system :

```javascript
fs = new FileSystem('sdcard');

fs.list(function(files) {
    files.forEach(function(file) {
        fs.read_as_text(file.name, function() {
            console.log(file.name + ' : ' + this.result);
        });
    });
}, null, /\.txt$/);
```
