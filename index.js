function boxClose(selector) {
				document.querySelector(selector).hide();
			}
			function addEvent() {
				var event = document.createElement("zdk-event");
				event.setAttribute("date","2014-08-07");
				event.setAttribute("time","18:00");
				event.setAttribute("duration","02:30");
				event.setAttribute("label","Apero");
				event.classList.add("event5");
				agenda = document.querySelector("zdk-agenda");
				// agenda.appendChild(event);
				event = agenda.addEvent({ date:"2014-08-07",time:"18:00",duration:"02:30",label:"Apero"});
				event.classList.add("event5");
				agenda.drawEvents();
			}
			function editEvent(evt) {
				switch(evt) {
						case 1:
							var event = document.querySelector("zdk-event[date='2014-08-11'][time='09:00']");
							if(event) event.time = "10:00";
							break;
						case 2:
							var event = document.querySelector("zdk-event[date='2014-08-11'][time='14:00']");
							if(event) event.time = "08:00";
							break;
				}
			}
			/*
			window.addEventListener("click", function(evt) {
				if (evt.target.tagName.toLowerCase() === "zdk-event") {
					console.log(evt.target);
				}
			}, false);
			*/
			window.addEventListener("polymer-ready", function() {
				console.log("polymer ready");
				document.querySelector("zdk-agenda").addEventListener("zdkEventClick", function(evt) {
					// console.log(event);
					var event = evt.detail.event;
					var modal = document.querySelector("#modal1");
					var form = document.forms["eventForm"];
					form.label.value = event.label;
					form.date.value = event.date;
					form.time.value = event.time;
					form.duration.value = event.duration;
					form.comment.value = event.textContent;
					modal.show();
				},false);
			},false);