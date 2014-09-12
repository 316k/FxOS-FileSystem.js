/**
 * Constructor for FileSystem. Note that this class is designed for Firefox OS
 * devices and is not standard.
 *
 * @constructor
 * @param {string} [storage_name='sdcard'] the device to use (one of those : apps, music, pictures, sdcard, videos)
 */
function FileSystem(storage_name) {
    this.device = navigator.getDeviceStorage(storage_name || 'sdcard');
}

/**
 * Checks if a file exists on the device
 *
 * @param {string} filename The file to check
 * @param {function} exists_callback The callback to execute if the file exists
 * @param {function} [not_found_callback] The callback to execute if the file doesn't exist
 */
FileSystem.prototype.exists = function(filename, exists_callback, not_found_callback) {
    not_found_callback = not_found_callback || function() {};

    var request = this.device.get(filename);

    request.onsuccess = exists_callback;
    request.onerror = not_found_callback;
};

/**
 * Saves a Blob object on the device
 *
 * @param {Blob} blob The blob to write
 * @param {string} filename The name of the file
 * @param {boolean|function} overwrite True to force overwrite, or the callback to execute if the file already exists
 * @param {function} [success_callback] The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.save_blob = function(blob, filename, overwrite, success_callback, error_callback) {
    overwrite = overwrite || false;
    success_callback = success_callback || function() {};
    error_callback = error_callback || function() {};

    var that = this;

    var write_file = function() {
        var request = that.device.addNamed(blob, filename);

        request.onsuccess = success_callback;
        request.onerror = error_callback;
    };

    this.exists(filename, function() {
        if(overwrite instanceof Function ? overwrite() : overwrite) {
            that.delete(this.result.name, write_file, error_callback);
        }
    }, write_file);
};

/**
 * Saves a text file on the device
 *
 * @param {string} content The text to write
 * @param {string} filename The name of the file
 * @param {boolean|function} overwrite True to force overwrite, or the callback to execute if the file already exists
 * @param {function} [success_callback] The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.save = function(content, filename, overwrite, success_callback, error_callback) {
    var file = new Blob([content], {type: "text/plain"});
    this.save_blob(file, filename, overwrite, success_callback, error_callback);
}

/**
 * Opens a file from the device
 *
 * @param {string} filename The name of the file to open
 * @param {function} success_callback The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.open = function(filename, success_callback, error_callback) {
    error_callback = error_callback || function () {};

    var request = this.device.get(filename);

    request.onsuccess = success_callback;
    request.onerror = error_callback;
};

/**
 * Reads a text file from the device
 *
 * @param {string} filename The name of the file to read
 * @param {function} success_callback The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.read_as_text = function(filename, success_callback, error_callback) {
    error_callback = error_callback || function() {};

    this.open(filename, function () {
        var reader = new FileReader();
        reader.readAsText(this.result);
        reader.onloadend = success_callback;
    }, error_callback);
};

/**
 * Deletes a file from the device
 *
 * @param {string} filename The name of the file to delete
 * @param {function} [success_callback] The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.delete = function(filename, success_callback, error_callback) {
    error_callback = error_callback || function () {};

    var request = this.device.delete(filename);

    request.onsuccess = success_callback;
    request.onerror = error_callback;
};

/**
 * Lists files on the device
 *
 * @param {function} success_callback The callback to execute on success. Its only parameter is an array of filenames.
 * @param {string} [path=''] Path of the directory to search files from. Note that path CAN'T begin with a '/'.
 * @param {string|regex} [pattern=''] Pattern to filter the filenames. Defaults matches everything.
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.list = function(success_callback, path, pattern, error_callback) {
    pattern = pattern || '';
    path = path || '';
    error_callback = error_callback || function() {};

    var cursor = this.device.enumerate(path);

    var files = [];
    cursor.onsuccess = function () {
        var file = this.result;
        if (file != null) {
            if(file.name.match(pattern)) {
                files.push(file);
            }
            this.continue();
        } else {
            success_callback(files);
        }
    }
    cursor.onerror = error_callback;
};

/**
 * Gets the free/used space in bytes on the device
 *
 * @param {string} type The type of the space to check ('free' or 'used')
 * @param {function} success_callback The callback to execute on success
 * @param {function} [error_callback] The callback to execute if an error occurs
 */
FileSystem.prototype.space = function(type, success_callback, error_callback) {
    error_callback = error_callback || function() {};

    var request = this.device[type + 'Space']();

    request.onsuccess = success_callback;
    request.onerror = error_callback;
};
