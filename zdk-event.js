(function() { Polymer({
		is: 'zdk-event',

		properties: {
        start: String,
				time: String,
				end: String,
				label: String
    },

		ready: function() {
			console.log(this.start + "\t" + this.time + "\t" + this.end + "\t" + this.label);
		},

		startChanged: function(oldValue, newValue) {
			if ( !oldValue || oldValue === newValue ) return;
			this.setAttribute("start", newValue);
			this.time = moment(newValue, 'YYYY-MM-DD HH:mm').format('HH:mm');
			this.fire('zdk-event-changed');
		},
		endChanged: function(oldValue, newValue) {
			if ( !oldValue || oldValue === newValue ) return;
			this.setAttribute("end", newValue);
			this.fire('zdk-event-changed');
		},
		labelChanged: function(oldValue, newValue) {
			if( !oldValue || oldValue === newValue ) return;
			this.setAttribute("label", newValue);
			this.fire('zdk-event-changed');
		},
		eventClick: function(event, detail, sender) {
			console.log("Clicked on event: ");
			console.log(event);
			this.fire('zdk-event-click',{event: this});
		}
	});
	})();
