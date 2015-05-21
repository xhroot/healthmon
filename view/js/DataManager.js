/**
 * Fetch/save data to server via AJAX calls.
 */
var DataManager = function(endpoint) {
    this.endpoint_ = endpoint;
}

DataManager.prototype.get = function(id, callback) {
    if (id === null || id === undefined) {
        var err = new Error('Record identifier missing.');
        callback(err, null);
        return;
    }

    // Pass the querystring to the REST endpoint.
    var url = this.endpoint_ + id;

    var xhr = $.ajax({
        url: url,
        contentType: 'application/json'
    });
    
    xhr.done(function(response) {
        if (response.error) {
            var err = new Error(response.error);
            callback(err, null);
            return;
        }

        // Return model to caller.
        callback(null, response.result);
    });
    
    xhr.fail(function(_unused, textStatus, err) {
        // More info is available in fail error argument.
        var err = new Error('There was a problem fetching the record.');
        callback(err, null);
    });
};

DataManager.prototype.save = function(model, id, callback) {
    var isNewRecord = (id === null);
    var method = isNewRecord ? 'POST' : 'PUT';
    var url = this.endpoint_ + (id || '');

    var xhr = $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(model)
    });
    
    xhr.done(function(response) {
        if (response.error) {
            var err = new Error(response.error);
            callback(err, null);
            return;
        }
        response.result['isNewRecord'] = isNewRecord;
        callback(null, response.result);
    });
    
    xhr.fail(function(_unused, textStatus, err) {
        // More info is available in fail error argument.
        var err = new Error('There was a problem fetching the record.');
        callback(err, null);
    });
};

