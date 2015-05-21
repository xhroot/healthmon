var Helpers = {
    // Shortcut, converts React ref -> jQuery DOM handle.
    $React: function(ref) {
        return $(React.findDOMNode(ref));
    },

    // Shortcut, update single state value.
    // Requires `this` to be bound to local React component, as default is 
    // unpredictable. I love javascript.
    updateState: function(updateQuery) {
        var newState = React.addons.update(this.state, updateQuery);
        this.setState(newState);
    }
};
