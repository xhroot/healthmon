
var TextInput = React.createClass({
    componentDidMount: function() {
        // If there is a tooltip, attach to input box; show on focus.
        if (this.props.tooltip) {
            Helpers.$React(this.refs.input).tooltip({trigger:'focus'});
        }
    },
    handleChange: function(e) {
        // Attach field name to event for parent reference.
        e.updateMap = {};
        e.updateMap[this.props.field] = e.target.value;
    },
    /** 
    * @param props.id Unique html `id`  
    * @param props.label Label displayed above input box
    * @param props.tooltip Helper text for popup tooltip
    * @param props.value Value passed in from model state
    */
    render: function() {
        var value = this.props.model[this.props.field];
        return (
            <div className="form-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input disabled={this.props.readonly} onChange={this.handleChange} className="form-control" data-placement="bottom" title={this.props.tooltip} id={this.props.id} value={value} ref="input"/>
            </div>
        );
    }
});

var DateInput = React.createClass({
    componentDidMount: function() {
	// Bind the bootstrap datetimepicker.
        var node = Helpers.$React(this.refs.dateinput);
        node.datetimepicker({format: dateFormat.DISPLAY});

	// Wire change event on DTP to trigger component change.
        node.on('dp.change', function(e) {
            // Manually calling change event.
            this.handleChange(e);
        }.bind(this));
    },
    handleChange: function(e) {
        // Attach field name to event for parent reference.
        // Reformat date to state/server format.
        e.updateMap = {};
        e.updateMap[this.props.field] = moment(e.target.value, 
            dateFormat.DISPLAY).format(dateFormat.SERVER);

        // Native events do not bubble up the React v-DOM.
        // Manually call parent update.
        this.props.updateModel(e.updateMap);
    },
    formatDate: function(dt) {
        // Parse date using server formatting, reformat for display.
        return moment(dt, dateFormat.SERVER).format(dateFormat.DISPLAY);
    },
    /** 
    * @param props.id Unique html `id`  
    * @param props.label Label displayed above input box
    * @param props.tooltip Helper text for popup tooltip
    * @param props.value Value passed in from model state
    */
    render: function() {
        var value = this.props.model[this.props.field];
        return (
            <div className="form-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input onChange={this.handleChange} className="form-control" data-placement="bottom" title={this.props.tooltip} id={this.props.id} value={this.formatDate(value)} disabled={this.props.readonly} ref="dateinput"/>
            </div>
        );
    }
});

var SelectInput = React.createClass({
    handleChange: function(e) {
        // Attach field name to event for parent reference.
        e.updateMap = {};
        e.updateMap[this.props.field] = e.target.value;
    },
    componentDidMount: function() {
        Helpers.$React(this.refs.select).tooltip({trigger: 'focus'});
    },
    render: function() {
        var value = this.props.model[this.props.field];
        var opts = this.props.options.map(function(o) {
            return <option value={o.value} key={o.value}>{o.label}</option>
        });
        return (
            <div className="form-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <select className="form-control" data-placement="bottom" title={this.props.tooltip} onChange={this.handleChange} id={this.props.id} value={value} disabled={this.props.readonly}>
                    {opts}
                </select>
            </div>
        );
    }
});

var MarkdownInput = React.createClass({
    getInitialState: function() {
        return {renderMarkdown: false}
    },
    handleToggle: function() {
        this.setState({renderMarkdown: !this.state.renderMarkdown});
    },
    handleChange: function(e) {
        // Attach field name to event for parent reference.
        e.updateMap = {};
        e.updateMap[this.props.field] = e.target.value;
    },
    componentDidMount: function() {
        Helpers.$React(this.refs.markdownButton).toggle(!this.props.readonly);
    },
    componentDidUpdate: function() {
        Helpers.$React(this.refs.markdownButton).toggle(!this.props.readonly);
    },
    markdownToHtml: function(markedText) {
        var reader = new commonmark.Parser();
        var writer = new commonmark.HtmlRenderer();
        var parsed = reader.parse(markedText);
        var result = writer.render(parsed); 
        return result;
    },
    render: function() {
        var value = this.props.model[this.props.field];

	// If the markdown button is toggled, switch between rendered and input
	// modes. If we're in readonly mode, only show rendered and no button.
        var el; 
        var buttonType;
        if (this.props.readonly || this.state.renderMarkdown) {
            var html = this.markdownToHtml(value);
            el = <div className="form-group" dangerouslySetInnerHTML={{__html: html}}></div>
            buttonType = 'btn btn-sm btn-default';
        } else {
            el = <textarea onChange={this.handleChange} className="form-control" value={value} rows="14"/>
            buttonType = 'btn btn-sm btn-primary';
        } 
        //` Ad-hoc css.
        return (
        <div style={{height: '28em', overflow: 'auto'}}>
            <div>
                <label>{this.props.label}</label>
            </div>
            <div ref="markdownButton" className="form-group">
                <button onClick={this.handleToggle} className={buttonType}>
                    <span className="glyphicon glyphicon-cog"></span> markdown
                </button>
            </div>
            <div className="form-group">
                {el}
            </div>
        </div>
        );
    }
});

/**
 * Total width: col-md-4
 */
var ButtonArray = React.createClass({
    render: function() {
        return this.props.editMode ? (
            <div className="row">
                <div className="col-md-2 form-group">
                    <button onClick={this.props.handleSave} id="saveForm" className="btn btn-default btn-primary">
                    <span className="glyphicon glyphicon-save"></span> Save
                    </button>
                </div>
                <div className="col-md-2 form-group">
                    <button onClick={this.props.handleCancel} id="cancelForm" className="btn btn-default">
                    <span className="glyphicon glyphicon-remove"></span> Cancel
                    </button>
                </div>
                </div>
                ) : (
                <div className="row">
                <div className="col-md-2 col-md-offset-2 form-group">
                    <button onClick={this.props.handleEdit} id="editForm" className="btn btn-default">
                    <span className="glyphicon glyphicon-edit"></span> Edit
                    </button>
                </div>
            </div>
        );
    }
});

var HealthrecInputGroup = React.createClass({
    onChange: function(e) {
        // Requires field value set by child event.
        if (typeof e.updateMap === 'undefined') {
            konsole.warn(null, 'e.updateMap was not set by child component.');
            return;
        }
        this.props.updateModel(e.updateMap);
    },
    selectOptionalFields: function(model, readonly) {
        // This table determines which fields to render based on which
        // RecordType was selected.
        //
        // 'RecordType': [Measurement, MedicationName, MedicationUrl, Symptom]
        var renderArray = {
            'Symptom': [false, false, false, true],
            'Temperature': [true, false, false, false],
            'Medication': [true, true, true, false]
        }[model.RecordType];

        var optionalFields = [
            <TextInput id="MeasurementId" 
                ref="Measurement" 
                label="Measurement" 
                tooltip="Enter measurement with units" 
                readonly={readonly}
                key="Measurement" 
                field="Measurement" 
                model={model}/>,
            <TextInput id="MedicationNameId" 
                ref="MedicationName" 
                label="Medication Name" 
                tooltip="Medication name" 
                readonly={readonly}
                key="MedicationName" 
                field="MedicationName" 
                model={model}/>,
            <TextInput id="MedicationUrlId" 
                ref="MedicationUrl" 
                label="Medication Link" 
                tooltip="Provide url/link to drugs.com" 
                readonly={readonly}
                key="MedicationUrl" 
                field="MedicationUrl" 
                model={model}/>,
            <TextInput id="SymptomId" 
                ref="Symptom" 
                label="Symptom" 
                tooltip="Describe any symptoms" 
                readonly={readonly}
                key="Symptom" 
                field="Symptom" 
                model={model}/>
        ];

        // Select only the fields corresponding marked to render.
        var fieldsToRender = _.filter(optionalFields, function(_ignore, idx) {
            return renderArray[idx];
        });

        return fieldsToRender;
    },
    render: function() {
        var model = this.props.healthrec;
        var readonly = !this.props.editMode;

        var optionalFields = this.selectOptionalFields(model, readonly);

        // id: unique DOM id.
        // field: name of field within model.
        // label: UI visible label.
        return (
            <div onChange={this.onChange}>
                <div className="col-md-4">
                    <DateInput id="DateActionId" 
                        label="Date of action" 
                        updateModel={this.props.updateModel}
                        readonly={readonly}
                        field="DateAction" 
                        model={model}/>
                    <SelectInput id="PatientId" 
                        label="Patient Name" 
                        options={this.props.patients}
                        readonly={readonly}
                        field="Patient" 
                        model={model}/>
                    <SelectInput id="RecordTypeId" 
                        label="Record Type" 
                        tooltip="Select record type" 
                        options={this.props.recordTypes}
                        readonly={readonly}
                        field="RecordType" 
                        model={model}/>
                    {optionalFields}
                </div>
                <div className="col-md-5">
                    <MarkdownInput id="NoteId" 
                        label="Additional Notes" 
                        readonly={readonly}
                        field="Note" 
                        model={model}/>
                    <ButtonArray editMode={!readonly} handleEdit={this.props.handleEdit} handleCancel={this.props.handleCancel} handleSave={this.props.handleSave}/>
                </div>
            </div>
        );
    }
});

/**
 * @description HealthrecForm maintains model state, pushes updates to children,
 *      calls data manager for fetch/save.
 */
var HealthrecForm = React.createClass({

    // Local interface for external objects loaded here, to keep direct 
    // references to a mininum; common libraries permitted of course (i.e., 
    // jQuery, lodash, obviously React).
    //
    // Stubs imply known used values. Should be private and loaded through a
    // constructor but ... well ... javascript :/
    ext: {
        // This object should implement the DataManager methods/callbacks.
        dataManager: null,
        // Record id, null if new record.
        id: null,
        // Id of record to be copied, if exists.
        copyId: null,
        // Base URL.
        currentPath: null,
        // Canceled creates will return back to home.
        parentPath: null,
        patients: [
            {value: 'Martin', label: 'Martin'},
            {value: 'Donald', label: 'Donald'},
            {value: 'Liz', label: 'Liz'},
            {value: 'Whistler', label: 'Whistler'},
            {value: 'Mother', label: 'Mother'},
            {value: 'Carl', label: 'Carl'}
        ],
        recordTypes: [
            {value: 'Symptom', label: 'Symptom'},
            {value: 'Medication', label: 'Medication'},
            {value: 'Temperature', label: 'Temperature'}
        ]
    },

    componentWillMount: function() {
        // Welp, gonna use this as my constructor till I know better...
        var args = _.pick(this.props.args, ['dataManager', 'id', 'copyId', 
                'currentPath', 'parentPath']);

        _.extend(this.ext, args);
    },

    // Cache of model for aborted edits.
    serverModel: null,

    getInitialState: function() {
        return {PageBusy: true, EditMode: false, Id: null, Model: {
            Patient: this.ext.patients[0].value,
            DateAction: moment().format(dateFormat.SERVER),
            RecordType: this.ext.recordTypes[0].value,
            Symptom: '',
            Note: '',
            MedicationName: '',
            MedicationUrl: '',
            Measurement: ''
        }};
    },
    updateModel: function(updateMap){
        Helpers.updateState.call(this, {Model: {$merge: updateMap}});
    },
    handleSave: function() {
        // Put page in freeze mode before going async.
        Helpers.updateState.call(this, {EditMode: {$set: false}});
        statusBox.busy(' Saving...', true);

        var model = this.state.Model;
        var id = this.state.Id;
        this.ext.dataManager.save(model, id, function(err, result) {
            if (err != null) {
                statusBox.warning(err.message);
                statusBox.display();
                return;
            }

            // If data manager signals a fresh record, reload page.
            if (result.isNewRecord) {

                // Store this message for later display.
                statusBox.success('Record created.');

                // Incur full page refresh to properly set URL; fudging with it
                // manually is unstable.
                location.href = this.ext.currentPath + result.Id;
                return;
            }
            var newState = _.pick(result, ['Id', 'Model']);
            Helpers.updateState.call(this, {$merge: newState});

            statusBox.success('Record saved.');
            statusBox.display();
        }.bind(this));
    },
    handleEdit: function() {
        // Cache deep copy of model in case of revert.
        this.serverModel = _.clone(this.state.Model, true);

        var newState = {PageBusy: false, EditMode: true};
        Helpers.updateState.call(this, {$merge: newState});
    },
    handleCancel: function() {
        // For canceled saves, revert record from cache.
        if (this.state.Id !== null) {
            Helpers.updateState.call(this, {$merge: {EditMode: false, Model: 
                this.serverModel}});
            statusBox.info('Save canceled; original values restored.');
            statusBox.display();
            return;
        }

        // For canceled new records/copies, return to caller (usually home).
        statusBox.info('Record creation canceled.');
        
        location.href = this.ext.parentPath;
    },
    componentDidMount: function() {
        // PageBusy suppresses rendering to prevent intermittent updates from
        // causing multiple ui flashes.
        Helpers.updateState.call(this, {PageBusy: {$set: true}});
        statusBox.busy(' Loading...', true);

        // Fetch record from server.
        var id = this.ext.id || this.ext.copyId;
        if (id === null) {
            // Use initial state for new record.
            statusBox.info('New record.');
            statusBox.display();
            this.handleEdit();
            return;
        }

        this.ext.dataManager.get(id, function(err, result){
            if (err !== null) {
                statusBox.warning(err.message);
                statusBox.display();
                return;
            }

            // Found a copyId, treat as new record.
            if (this.ext.copyId !== null) {
                // Don't copy over Date, overwrite with today.
                result.Model.DateAction = moment().format(dateFormat.SERVER);
                var newState = {PageBusy: false, EditMode: true, Id: null, 
                    Model: result.Model};
                Helpers.updateState.call(this, {$merge: newState});
                statusBox.info('Information copied into new record.');
                statusBox.display();
                return;
            }

            var newState = {PageBusy: false, EditMode: false, Id: result.Id, 
                Model: result.Model};
            Helpers.updateState.call(this, {$merge: newState});

            // Could have incurred a reload from record creation, so check 
            // for existing message first.
            if (statusBox.hasMessage()) {
		statusBox.display();
            } else {
		statusBox.clear();
	    }

        }.bind(this));
    },
    render: function() {

        var mode;
        if (!this.state.EditMode) {
            mode = 'Record Detail';
        } else if (this.ext.id === null) {
            mode = 'Create New Record';
        } else {
            mode = 'Edit Record';
        }

        return this.state.PageBusy ? null : (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h2 className="panel-title">{mode}</h2>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <HealthrecInputGroup updateModel={this.updateModel} healthrec={this.state.Model} editMode={this.state.EditMode} handleEdit={this.handleEdit} handleCancel={this.handleCancel} handleSave={this.handleSave} ref="inputGroup" patients={this.ext.patients} recordTypes={this.ext.recordTypes}/>
                    </div>
                </div>
            </div>
        );
    }
});

