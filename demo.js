function addEvent() {
			agenda = document.querySelector("zdk-agenda");
			agenda.addEvent({
				start: '2014-11-12T18:00:00',
				end: '2014-11-12T20:30:00',
				label: 'Apéro',
				className: 'event5'
			});
		}
		window.addEventListener("polymer-ready", function() {
			document.querySelector("zdk-agenda").addEventListener("zdk-event-click", function(evt) {
				console.log('zdk-event-click');
				var event = evt.detail.event;
				console.log(event);
			}, false);

			document.querySelector("zdk-agenda").addEventListener("zdk-day-click", function(evt) {
				console.log('zdk-day-click, ' + evt.detail.day);
			}, false);

			document.querySelector("zdk-agenda").addEventListener("zdk-event-close", function(evt) {
				console.log('zdk-event-close');
				var event = evt.detail.event;
				console.log(event);
			}, false);
		},false);