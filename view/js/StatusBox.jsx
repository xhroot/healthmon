/**
 * StatusBox will store a single message and will clear it when displayed.
 * Consumer should check if message is present to avoid overwriting, unless
 * that is desired.
 *
 * To persist messages between pages simply (no session), StatusBox uses
 * `localStorage`. A different mechanism can be substituted by providing the
 * appropriate implementation in the `store` object.
 *
 * Display `info` message:
 * 
 *     statusBox.info('Deathstar charged.');
 *     statusBox.display();
 *
 * Display `danger` message:
 * 
 *     statusBox.danger('Exhaust port stupidly exposed.');
 *     statusBox.display();
 * 
 * Save `success` message for later consumption by `display()`:
 * 
 *     statusBox.success('Planet destroyed successfully.');
 * 
 * Show temporary `busy` message and immediately display. Any saved StatusBox 
 * message is untouched. `busy` also shows a spinner:
 * 
 *     statusBox.busy(' Searching for next target...', true);
 * 
 * Display nominal message unless one already exists, then display that. :
 * 
 *     if (!statusBox.hasMessage()) {
 *         statusBox.success('Just puttering along.');
 *     }
 *     statusBox.display();
 */
var StatusBox = React.createClass({ 

    // Any storage mechanism that implements the below API can be used.
    store: {
        get: function(x) { return localStorage.getItem(x); },
        set: function(x,y) { localStorage.setItem(x, y); },
        remove: function(x) { localStorage.removeItem(x); }
    },

    msgKey: 'status_box_message',
    alertKey: 'status_box_alert',
    alertMap: {
        'info': 'alert alert-info',
        'success': 'alert alert-success',
        'warning': 'alert alert-warning',
        'danger': 'alert alert-danger',
        'busy': 'alert alert-info has-spinner active',
        'clear': ''
    },
    render: function() { 
        var alertStyles = this.alertMap[this.state.alertKey];
        var html;
        if (this.state.alertKey === 'busy') {
            html = (
                <span>
                    <span className="spinner">
                        <i className="icon-spin icon-refresh"/>
                    </span> {this.state.msg}
                </span>
            );
        } else {
            html = this.state.msg;
        }

        return <div className={alertStyles}>{html}</div>; 
    }, 
    getInitialState: function() { 
        return {alertKey: 'clear', msg:''};
    }, 
    pop: function() {
        // Retrieve and clear from persistent storage.
        var alertKey = this.store.get(this.alertKey);
        this.store.remove(this.alertKey);

        var msg = this.store.get(this.msgKey);
        this.store.remove(this.msgKey);

        return {alertKey: alertKey, msg: msg};
    },
    display: function() {
        var data = this.pop();

        // If there is no message, abort.
        if (data.msg === null) {
            return;
        }
        // Kick off a render with the existing message.
        this.setState(data);
    },
    hasMessage: function() {
        return this.store.get(this.msgKey) !== null;
    },
    info: function(msg, skipPersistence) {
        this.write('info', msg, skipPersistence);
    },
    success: function(msg, skipPersistence) {
        this.write('success', msg, skipPersistence);
    },
    warning: function(msg, skipPersistence) {
        this.write('warning', msg, skipPersistence);
    },
    danger: function(msg, skipPersistence) {
        this.write('danger', msg, skipPersistence);
    },
    busy: function(msg, skipPersistence) {
        this.write('busy', msg, skipPersistence);
    },
    write: function(alertKey, msg, skipPersistence) { 
        // skipPersistence: 
        // * do not update/clear persistent storage
        // * show immediately, display() not used.
        if (skipPersistence) {
            this.setState({alertKey: alertKey, msg: msg});
            return;
        }

        this.store.set(this.alertKey, alertKey);
        this.store.set(this.msgKey, msg);
    }, 
    clear: function() { 
        // Clear message.
        this.store.remove(this.alertKey);
        this.store.remove(this.msgKey);

        // Force render to clear status box.
        this.setState({alertKey: 'clear', msg: ''}); 
    } 
}); 
