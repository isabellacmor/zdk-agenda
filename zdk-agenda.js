(function() { Polymer({
    is: 'zdk-agenda', // CONVERTED WIP
			day: null,
			lang: null,
			hourHeight: 50,
			hourShow: new Date().getHours(),
			days: [],
			events: [],
			eventsByDay: {},
			allDayEventsByDay: {},
			dragging: false,
			editable: true,
			deleteButtons: false,
			deleteIcon: 'close',

			/**
			 * Method called when view is changed.
			 */
			viewChanged: function() {
				switch (this.view) {
					case 'planning':
						this.$.agenda.querySelector(".view").style.display = "none";
						this.$.agenda.querySelector(".monthview").style.display = "none";
						this.$.weekdays.style.display = "none";
						this.$['all-day-events'].style.display = "none";
						this.$['planning-view'].style.display = '';
						this.setTime(0);
						break;
					case 'month':
						this.$.agenda.querySelector(".view").style.display = "none";
						this.$.agenda.querySelector(".monthview").style.display = "";
						this.$.weekdays.style.display = "";
						this.$.weekdays.querySelector(".hours").style.display = "none";
						this.$['all-day-events'].style.display = "none";
						this.$['planning-view'].style.display = 'none';
						this.setTime(0);
						break;
					default:
						this.$.agenda.querySelector(".view").style.display = "";
						this.$.weekdays.style.display = "";
						this.$.weekdays.querySelector(".hours").style.display = "";
						this.$.agenda.querySelector(".monthview").style.display = "none";
						this.$['all-day-events'].style.display = "";
						this.$['planning-view'].style.display = 'none';
						this.setTime(this.hourShow);
				}

        // console.log(this.$.buttonBar.querySelector(".selected"));
				// this.$.view_menu.querySelector(".selected").classList.remove("selected");
				// this.$.view_menu.querySelector("." + this.view + '-button').classList.add("selected");

				this.$.buttonBar.querySelector(".selected").classList.remove("selected");
				this.$.buttonBar.querySelector("." + this.view + '-button').classList.add("selected");
				this.draw();
				this.$.weekdays.style.paddingRight = this._getScrollBarWidth() + 'px';
				this.$['all-day-events'].style.paddingRight = this._getScrollBarWidth() + 'px';
			},

			// ready: function() {
      attached: function() {
				this.lang = this.lang ? this.lang: navigator.language || navigator.userLanguage;
				moment.locale( this.lang );
				this.day = (typeof this.date === "string") ? moment(this.date) : moment();

        document.querySelector("#dateHolder").innerHTML = this.day;
        console.log(this.day);

				var that = this;

				window.addEventListener("resize", function()
					{
						that.drawEvents(false);
						that.$.weekdays.style.paddingRight = that._getScrollBarWidth() + 'px';
						that.$['all-day-events'].style.paddingRight = that._getScrollBarWidth() + 'px';
					}, false);
				this.drawBG();

				this.events = [];

				var eventElements = this.querySelectorAll('zdk-event');

				if (eventElements.length > 0) {
					var event = {};

          for(var nE = 0; nE < eventElements.length; nE++) {
            console.log(eventElements[nE]);

            event = {
							start: moment(eventElements[nE].getAttribute('start'), 'YYYY-MM-DD HH:mm').toISOString(),
							end: moment(eventElements[nE].getAttribute('end'), 'YYYY-MM-DD HH:mm').toISOString(),
							label: eventElements[nE].getAttribute('label'),
							className: eventElements[nE].className,
							allDay: eventElements[nE].getAttribute('all-day') || false,
							recurring: eventElements[nE].getAttribute('recurring')
						};

            console.log(event);
            this.events.push(event);
            console.log(this.events);
          }
				}

        // Always start out in week view
        this.drawWeekDays();
			},

			domReady: function() {
				this.$.weekdays.style.paddingRight = this._getScrollBarWidth() + 'px';
				this.$['all-day-events'].style.paddingRight = this._getScrollBarWidth() + 'px';
			},

			langChanged: function(oldValue, newValue) {
				if (!oldValue) {
					return;
				}
				this.lang = newValue ? newValue : navigator.language || navigator.userLanguage;
				this.draw();
			},

			draw: function() {
				switch (this.view) {
					case 'planning':
						this.drawPlanning();
						break;
					case 'month':
						this.drawMonth();
						break;
					case 'week':
						this.drawWeekDays();
						break;
					case 'day':
						this.drawDay();
						break;
				}
			},

			drawBG: function() {
				var canvas = this.$.agenda.querySelector("canvas");
				var hours =  this.$.agenda.querySelector(".view .hours");
				canvas.width  = this.$.agenda.offsetWidth;
				canvas.height = 24 * this.hourHeight;
				canvas.style.height = canvas.height + "px";

				function drawBG(obj) {
					var i,
						ctx = canvas.getContext("2d");

					ctx.lineWidth = 1;
					ctx.strokeStyle = "#eeeeee";
					for (i = 0; i < 24; i++) {
						ctx.beginPath();
							ctx.moveTo(0, (i + 0.5) * obj.hourHeight + 0.5);
							ctx.lineTo(canvas.width, (i + 0.5) * obj.hourHeight);
						ctx.stroke();
					}
					ctx.strokeStyle = "#ccc";
					for (i = 0; i < 24; i++) {
						ctx.beginPath();
							ctx.moveTo(0, (i + 1) * obj.hourHeight + 0.5);
							ctx.lineTo(canvas.width, (i + 1)* obj.hourHeight);
						ctx.stroke();
					}
				}

				function pad(n, width, z) {
					z = z || '0';
					n = n + '';
					return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
				}

				function drawHours( obj ) {
					var i, div;

					var df = document.createDocumentFragment();

					for ( i = 1; i < 25; i++) {
						div = document.createElement("div");
						div.innerHTML = pad(i, 2);
						// div.style.bottom = ( (24 - i) * obj.hourHeight) + "px";
            div.style.marginBottom = "35px";
						df.appendChild(div);
					}

					hours.appendChild(df);
				}

				drawBG( this );
				drawHours( this );
			},

			_getScrollBarWidth: function() {

				var inner = null;
				switch (this.view) {
					case 'planning':
						break;
					case 'month':
						inner = this.$.monthview;
						break;
					default:
						inner = this.$.view;
						break;
				}

				if (inner) {
					var outer = this.$.scrollarea;

					var w1 = inner.offsetWidth;
					var w2 = outer.offsetWidth;

					return w2 - w1;
				}

				return 0;
			},

			drawPlanning: function() {

				var view = this.$['planning-view'];

				// Clear the view
				while (view.firstChild) {
					view.removeChild(view.firstChild);
				}

				var df = document.createDocumentFragment();

				var day = moment(this.day);

				for (var i = 0; i < 31; i++) {

					var dayElement = document.createElement('div');
					dayElement.className = 'zdk-agenda day';
					dayElement.setAttribute('data-date', day.format('YYYY-MM-DD'));

					dayElement.innerHTML = [
						'<h2 class="zdk-agenda">', day.format('LL'), '</h2>'
					].join('');

					df.appendChild(dayElement);

					day.add(1, 'day');
				}

				view.appendChild(df);

				this.drawEvents();
			},

			drawMonth: function() {
				var day, format, div, fday, week;
				moment.locale(this.lang);

				var view = this.$.agenda.querySelector(".monthview");

				// Clear the view
				while (view.firstChild) {
					view.removeChild(view.firstChild);
				}

				var content = document.createDocumentFragment();

				// Draw days bar
				this.days = [];
				fday = moment(this.day).startOf("week");
				for (var i = 0; i < 7; i++) {
					day = moment(fday).add(i, 'd');
					day = {
									dayXs: day.format('dd'),
									daySm: day.format('ddd'),
									day: day.format('dddd')
								};
					Polymer.dom(document.querySelector("zdk-agenda")).node.push('days', day);
				}

				// get the first day of the month
				fday = moment(this.day).date(1).weekday(0);
				var bannerDate = this.$.banner.querySelector(".date");
				bannerDate.innerHTML = this.day.format("MMM YYYY");

				var today = moment();
				for (var w = 0; w < 6; w++) {
					week = document.createDocumentFragment();
					for (var d = 0; d < 7; d++) {
						day = { date: fday.date(), data: fday.format("YYYY-MM-DD"), type: "" };
						if (fday.year()  == today.year() &&
							  fday.month() == today.month() &&
							  fday.date()  == today.date()) {
							day.type = "today";
						}

						if (fday.month() != this.day.month()) {
							day.type += (day.type.length ? " " : "") + "d1";
						}

						if ([0,6].indexOf(fday.day()) !== -1) {
							day.type += (day.type.length ? " " : "") + "we";
						}

						var dayElement = document.createElement('div');
						dayElement.className = 'zdk-agenda day ' + day.type;
						dayElement.setAttribute('data-date', day.data);

						dayElement.innerHTML = '<div class="border zdk-agenda"></div><header class="zdk-agenda"><span class="day-link">' + day.date + '<span></header>';

						week.appendChild(dayElement);
						fday.add( 1, 'd');
					}

					var df = document.createDocumentFragment();
					df.appendChild(week);

					var row = document.createElement('div');
					row.className = 'row zdk-agenda';
					row.appendChild(df);

					content.appendChild(row);
				}
				view.appendChild(content);
				[].slice.call(view.querySelectorAll('.day-link')).forEach(function(link) {
					//link.addEventListener("click", this.showDay.bind(this), false);
				}.bind(this));

				this.drawEvents();
				this.setTime(0);
			},

			drawWeekDays: function() {
				var day, type;

				moment.locale( this.lang );
				// get the first day of the week
				var fday = moment(this.day).startOf("week");

				var bannerDate = this.$.banner.querySelector(".date");
				bannerDate.innerHTML = fday.format("DD MMM") + " - " + moment(fday).add(6, 'd').format("DD MMM YYYY");

				var days = this.$.agenda.querySelector(".view .days");
				var content = [];

				var df = document.createDocumentFragment();
				var onTap = function(e) {
					this.fire('zdk-day-click', {day: e.target.getAttribute('data-date')});
					e.stopPropagation();
				};

				this.days = [];
				var i;
				for (i = 0; i < 7; i++) {
					day = moment(fday).add(i, 'd');
					type = "";
					if (day.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
						type = "today";
					}
					day = {

						day: day.format('dddd'),
						dayXs: day.format('dd'),
						daySm: day.format('ddd'),
						date: day.format("DD"),
						data: day.format("YYYY-MM-DD"),
						type: type
					};
					Polymer.dom(document.querySelector("zdk-agenda")).node.push('days', day);

					var dayElement = document.createElement('div');
					dayElement.className = 'dayview ' + day.type + ' zdk-agenda';
					dayElement.setAttribute('data-date', day.data);
					dayElement.style.height = 24 * this.hourHeight + 'px';
					df.appendChild(dayElement);
				}

				// Clear the view
				while (days.firstChild) {
					days.removeChild(days.firstChild);
				}

				days.appendChild(df);

				// Draw all-day events container
				var allDayEvents = this.$['all-day-events'];
				var fdayA = moment(this.day).startOf("week");
				var allDayEventsContent = ['<div class="hours"></div>'];

				for (i = 0; i < 7; i++) {
					day = moment(fdayA).add(i, 'd');
					type = "";
					if (day.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
						type = "today";
					}
					day = {
						date: day.format("DD"),
						data: day.format("YYYY-MM-DD"),
						type: type
					};
					allDayEventsContent.push('<div class="all-day ', day.type, '" data-date="', day.data, '"></div>');
				}
				allDayEvents.innerHTML = allDayEventsContent.join('');

				this.drawEvents();
				this.setTime();
			},

			drawDay: function() {
        this.days = [];

				var day = {
					day: this.day.format('dddd'),
					dayXs: this.day.format('dd'),
					daySm: this.day.format('ddd'),
					date: this.day.format("DD"),
					data: this.day.format("YYYY-MM-DD"),
					type: ( this.day.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ) ? "today" : ""
				};
				Polymer.dom(document.querySelector("zdk-agenda")).node.push('days', day);

        console.log(this.days);
				var bannerDate = this.$.banner.querySelector(".date");
				bannerDate.innerHTML = this.day.format("ddd LL");

				var days = this.$.agenda.querySelector(".view .days");
				var content = '<div class="zdk-agenda dayview ' + day.type + '"  data-date="' + day.data + '" style="height:' + (24 * this.hourHeight) + 'px"></div>';
				days.innerHTML = content;

				// Draw all-day events container
				var allDayEvents = this.$['all-day-events'];
				var allDayEventsContent = '<div class="hours"></div>';

				allDayEventsContent += '<div class="all-day ' + day.type + '" data-date="' + day.data + '"></div>';
				allDayEvents.innerHTML = allDayEventsContent;

				this.drawEvents();
				this.setTime();
			},

			_computeEvents: function(dayNodeList, allDayEvents, hourEvents) {

				function clone(obj) {
					if (obj === null || typeof(obj) != 'object')
						return obj;

					var temp = obj.constructor(); // changed

					for (var key in obj) {
						if (obj.hasOwnProperty(key)) {
								temp[key] = clone(obj[key]);
						}
					}
					return temp;
				}

				var events = {};
				var d = 0;
				[].slice.call(dayNodeList).forEach( function(day) {

					var copyEvent;
					var diff;

					var dayEvents = [];
					var dayDate = moment(day.getAttribute("data-date"));
					var length = this.events.length;
					var recDays = [];

					for (var i = 0; i < length; i++) {

						this.events[i].num = i;

						if (allDayEvents === false && this.events[i].allDay) {
							continue;
						}
						else if (hourEvents === false && !this.events[i].allDay) {
							continue;
						}

						var date = moment(this.events[i].start, moment.ISO_8601);
						var dateEnd = moment(this.events[i].end, moment.ISO_8601);

						if ((date.isBefore(dayDate, 'day') || date.isSame(dayDate, 'day')) &&
							  this.events[i].recurring) {
							// Recurring events
							var recInfos = this.events[i].recurring.split('_');

							switch (recInfos[0]) {
								case 'day':
									diff = -moment(date).startOf('day').diff(dayDate, 'days');

									if (diff % parseInt(recInfos[1], 10) === 0) {
										copyEvent = clone(this.events[i]);
										copyEvent.start = date.add(diff, 'days').toISOString();
										copyEvent.end = dateEnd.add(diff, 'days').toISOString();
										dayEvents.push(copyEvent);
									}
									break;
								case 'week':
									recDays = recInfos[2] ? recInfos[2].split(',') : [];
									diff = -moment(date).startOf('day').diff(dayDate, 'days');

									if (moment(date).startOf('week').diff(dayDate, 'weeks') % parseInt(recInfos[1], 10) === 0 &&
										recDays.indexOf(dayDate.day().toString()) >= -0) {

										copyEvent = clone(this.events[i]);
										copyEvent.start = date.add(diff, 'days').toISOString();
										copyEvent.end = dateEnd.add(diff, 'days').toISOString();
										dayEvents.push(copyEvent);
									}
									break;
							}
						}
						else if (date.isSame(dayDate, 'day') ||
							(d === 0 && date.isBefore(dayDate, 'day') &&
							 (dateEnd.isAfter(dayDate, 'day') ||
							  (this.events[i].allDay && dateEnd.isSame(dayDate, 'day'))
							 )
							)
						) {
							dayEvents.push(this.events[i]);
						}
						else if (date.isAfter(dayDate, 'day')) {
							continue;
						}
					}

					if (dayEvents.length > 0) {
						var index = 0;
						dayEvents.forEach(function(event) {

							var date = moment(event.start, moment.ISO_8601);
							var endDate = date;

							if (event.end) {
								var end = moment(event.end, moment.ISO_8601);

								if (!end.isBefore(date)) {
									endDate = end;
								}
							}

							function indexExists(array, index) {
								var exists = false;
								var i = 0;
								while (i < array.length && !exists) {
									exists = (array[i].index === index);
									i++;
								}
								return exists;
							}

							if (typeof events[dayDate.format('YYYY-MM-DD')] !== 'undefined') {
								while (indexExists(events[dayDate.format('YYYY-MM-DD')], index)) {
									index++;
								}
							}

							var i = moment(date.format('YYYY-MM-DD'), 'YYYY-MM-DD');
							var isStart = true;
							var eventToInsert = null;
							var eventIndex = index;

							do {
								if (typeof events[i.format('YYYY-MM-DD')] === 'undefined') {
									events[i.format('YYYY-MM-DD')] = [];
								}
								eventIndex = (i.weekday() === 0) ? events[i.format('YYYY-MM-DD')].length : eventIndex;

								eventToInsert = clone(event);
								eventToInsert.index = eventIndex;
								eventToInsert.isStart = isStart;
								events[i.format('YYYY-MM-DD')].splice(eventIndex, 0, eventToInsert);

								i.add(1, 'days');
								isStart = false;
							}
							while (i.isBefore(endDate) ||
					    	(event.allDay && i.isSame(moment(endDate.format('YYYY-MM-DD'), 'YYYY-MM-DD'))));

							if (eventToInsert) {
								eventToInsert.isEnd = true;
							}

							index++;
						});
					}

					d++;
				}.bind(this));

				return events;
			},

			orderEvents: function() {
				// orders the event by date and time
				this.events.sort( function(a, b) {
					var timeA = moment(a.start, moment.ISO_8601).valueOf();
					var timeB = moment(b.start, moment.ISO_8601).valueOf();
					return timeA - timeB;
				});
			},

			drawEvents: function(compute) {

				this.$.weekdays.style.paddingRight = this._getScrollBarWidth() + 'px';
				this.$['all-day-events'].style.paddingRight = this._getScrollBarWidth() + 'px';

				if (compute !== false && this.events.length > 0) {
					this.orderEvents();
				}

				var that = this;
				var events;
				switch (this.view) {

					case 'planning':

						// We remove the drawn events
						[].slice.call(this.$['planning-view'].querySelectorAll(".event")).forEach( function(element) {
							element.parentNode.removeChild(element);
						});

						if (compute !== false) {
							this.eventsByDay = this._computeEvents(this.$['planning-view'].querySelectorAll(".day"));
						}

						events = this.eventsByDay;

						// We draw the events
						[].slice.call(this.$['planning-view'].querySelectorAll(".day")).forEach(function(day) {
							var dayEvents = events[day.getAttribute("data-date")];

							if (dayEvents && dayEvents.length) {
								dayEvents.sort(function(a, b) {
									return a.index - b.index;
								});

								day.classList.add('has-events');
								var div = document.createElement('div');

								var df = document.createDocumentFragment();
								var container = document.createElement('div');
								container.className = 'events zdk-agenda';

								df.appendChild(container);

								dayEvents.forEach( function(event) {

									var div = document.createElement('div');
									div.classList.add('event');
                  div.classList.add('zdk-agenda');

									var date = moment(day.getAttribute("data-date"), 'YYYY-MM-DD');
									var eventDate = moment(event.start, moment.ISO_8601);
									var time = moment(event.start, moment.ISO_8601).format('HH:mm');

									if (event.id) {
										div.id = event.id;
									}

									div.setAttribute('data-num', event.num);

									div.innerHTML = '';
									if (event.isStart) {
										if (!event.allDay) {
											div.innerHTML += '<span class="time">' + time + '</span> ';
										}
									}
									else {
										div.classList.add('notStart');
									}

									div.innerHTML += '<span class="title">' + event.label + '</span>';

									container.appendChild(div);
								});

								day.appendChild(df);
							}
						});

						break;

					case 'month':
						if (!this.$.agenda.querySelectorAll(".monthview .day").length) {
							setTimeout( function() { that.drawEvents(compute); }, 0);
							return;
						}

						// We remove the drawn events
						[].slice.call(this.$.agenda.querySelectorAll(".monthview .eventMonth")).forEach( function(element) {
							element.parentNode.removeChild(element);
						});
						[].slice.call(this.$.agenda.querySelectorAll(".day paper-dropdown")).forEach( function(element) {
							element.parentNode.removeChild(element);
						});

						if (compute !== false) {
							this.eventsByDay = this._computeEvents(this.$.agenda.querySelectorAll(".monthview .day"));
						}

						events = this.eventsByDay;

						// We draw the events
						[].slice.call(this.$.agenda.querySelectorAll(".monthview .day")).forEach( function(day) {
							var dayEvents = events[day.getAttribute("data-date")];

							if (dayEvents && dayEvents.length) {
								dayEvents.sort(function(a, b) {
									return a.index - b.index;
								});

								var df = document.createDocumentFragment();

								var index = 0;
								var maxEvents = 3;

								var displayEvent = function(event) {
									var div = document.createElement('div');
									div.className = event.className;
									div.classList.add('eventMonth');
                  div.classList.add('zdk-agenda');

									var date = moment(day.getAttribute("data-date"), 'YYYY-MM-DD');
									var eventDate = moment(event.start, moment.ISO_8601);
									var time = moment(event.start, moment.ISO_8601).format('HH:mm');

									if (event.id) {
										div.id = event.id;
									}

									div.setAttribute('data-num', event.num);

									div.innerHTML = '';
									if (event.isStart) {
										if (!event.allDay) {
											div.innerHTML += '<span class="time">' + time + '</span> ';
										}
									}
									else {
										div.classList.add('notStart');
									}

									if (event.isStart || date.weekday() === 0) {
										div.innerHTML += '<span class="title">' + event.label + '</span>';
									}

									if (!event.isEnd) {
										div.classList.add('notEnd');
									}

									if (that.editable && that.deleteButtons && (event.isEnd || date.weekday() === 6)) {
										var closeButton = document.createElement('paper-icon-button');
										closeButton.setAttribute('icon', that.deleteIcon);
										closeButton.className = 'close';

										div.classList.add('deletable');
										div.appendChild(closeButton);
									}

									return div;
								};
								var hiddenEvents = 0;
								dayEvents.forEach( function(event, i) {

									while (parseInt(event.index) > index && index < maxEvents) {
										var div = document.createElement('div');
										div.classList.add('eventMonth');
										df.appendChild(div);
										index++;
									}

									if (index < maxEvents) {
										df.appendChild(displayEvent(event));
									}
									else {
										hiddenEvents++;
									}

									index++;
								}.bind(this));

								if (hiddenEvents > 0) {
									var div = document.createElement('div');
									div.classList.add('eventMonth');
									div.innerHTML = '<a class="plusLink">+' + hiddenEvents + ' ' + this.i18n('more') + '</a>';
									div.dataset.date = day.getAttribute("data-date");
									df.appendChild(div);

									var dropdownElement = document.createElement('paper-dropdown');
									dropdownElement.setAttribute('layered', true);
									index = 0;
									dayEvents.forEach( function(event) {
										while (parseInt(event.index) > index) {
											var div = document.createElement('div');
											div.classList.add('eventMonth');
											dropdownElement.appendChild(div);
											index++;
										}

										dropdownElement.appendChild(displayEvent(event));
										index++;
									});
									df.appendChild(dropdownElement);
								}

								day.appendChild(df);
							}
						}.bind(this));
						break;

					default:

						[].slice.call(this.$['all-day-events'].querySelectorAll(".all-day .event")).forEach(function(event) {
							event.parentNode.removeChild(event);
						}.bind(this));

						[].slice.call(this.$.agenda.querySelectorAll(".view .event")).forEach( function(event) {
							event.parentNode.removeChild(event);
						});

						if (compute !== false) {
							this.allDayEventsByDay = this._computeEvents(this.$.agenda.querySelectorAll(".view .dayview"), true, false);
							this.eventsByDay = this._computeEvents(this.$.agenda.querySelectorAll(".view .dayview"), false);
						}

						var allDayEvents = this.allDayEventsByDay;

						[].slice.call(this.$['all-day-events'].querySelectorAll(".all-day")).forEach( function(day) {
							var dayEvents = allDayEvents[day.getAttribute("data-date")];

							if (dayEvents && dayEvents.length > 0) {
								dayEvents.sort(function(a, b) {
									return a.index - b.index;
								});

								var df = document.createDocumentFragment();

								var index = 0;

								var displayEvent = function(event) {
									var div = document.createElement('div');
									div.className = event.className;
									div.classList.add('event');
                  div.classList.add('zdk-agenda');

									var innerElement = [];

									var date = moment(day.getAttribute("data-date"), 'YYYY-MM-DD');
									var eventDate = moment(event.start, moment.ISO_8601);
									var time = moment(event.start, moment.ISO_8601).format('HH:mm');

									if (event.id) {
										div.id = event.id;
									}

									div.setAttribute('data-num', event.num);

									if (!event.isStart) {
										div.classList.add('notStart');
									}

									if (event.isStart || date.weekday() === 0 || that.view === 'day') {
										innerElement.push('<span class="title">', event.label, '</span>');
									}

									if (!event.isEnd) {
										div.classList.add('notEnd');
									}

									if (that.editable && that.deleteButtons && (event.isEnd || date.weekday() === 6)) {
										var closeButton = document.createElement('paper-icon-button');
										closeButton.setAttribute('icon', that.deleteIcon);
										closeButton.className = 'close';

										div.classList.add('deletable');
										div.appendChild(closeButton);
									}

									div.innerHTML = innerElement.join('');

									return div;
								};
								dayEvents.forEach( function(event) {

									while (parseInt(event.index) > index && index < maxEvents) {
										var div = document.createElement('div');
										div.classList.add('event');
										df.appendChild(div);
										index++;
									}

									df.appendChild(displayEvent(event));

									index++;
								}.bind(this));

								day.appendChild(df);
							}
						}.bind(this));

						events = this.eventsByDay;

						[].slice.call(this.$.agenda.querySelectorAll(".view .dayview")).forEach( function(day) {

							var dayEvents = events[day.getAttribute("data-date")];
							var dayDate = moment(day.getAttribute("data-date") , "YYYY-MM-DD");

							if (dayEvents && dayEvents.length > 0) {

								dayEvents.sort(function(a, b) {
									return a.index - b.index;
								});

								var df = document.createDocumentFragment();

								var node;
								dayEvents.forEach( function ( event, indx ) {
									var nb = 0;
									var eventElement = document.createElement('div');
									eventElement.setAttribute("start", event.start);
									eventElement.setAttribute("end", event.end);
									eventElement.setAttribute("label", event.label);
									eventElement.classList.add("event");
									eventElement.classList.add(event.className);
                  eventElement.classList.add("zdk-agenda");
									eventElement.setAttribute('data-num', event.num);

									var innerElement = [];

									var time;

									if (event.isStart) {
										time = moment(event.start, moment.ISO_8601).format('HH:mm');
										innerElement.push('<span class="time">', time, '</span> ');
									}
									else {
										eventElement.classList.add('notStart');
									}

									if (event.isEnd) {
										time = moment(event.end, moment.ISO_8601).format('HH:mm');
										innerElement.push('- <span class="time">', time, '</span> ');
									}
									else {
										eventElement.classList.add('notEnd');
									}

									innerElement.push('<span class="title">', event.label, '</span>');

									var start = moment(event.start, moment.ISO_8601);
									var end = moment(event.end, moment.ISO_8601);

									var prev = dayEvents[indx - 1];
									var offset = 0;
									while (prev) {
										if (start.valueOf() < moment(prev.end, moment.ISO_8601).valueOf()) {
											offset++;

											if (offset == 1 && df.children[indx - 1 - nb]) {
												df.children[indx - 1 - nb].style.width = 100 - offset * 100 / 3.5 + '%';
											}
										}
										nb++;
										prev = dayEvents[indx - 1 - nb];
									}
									eventElement.style.left = offset / 3.0 * 100 + "%";

									// Top position (start)
									if (!event.isStart) {
										eventElement.style.top = 0;
									}
									else {
										eventElement.style.top = (start.hour()-1) * this.hourHeight + 'px';
																						//  + start.minute() / 60 * this.hourHeight +
																						//  start.second() / 3600 * this.hourHeight +'px';
									}

									// Height of the element (duration)
									if (!event.isStart) {
                    console.log("Not a starting event");
										eventElement.style.height = Math.min(end.diff(dayDate, 'seconds') / 3600, 24) * this.hourHeight + 'px';
									}
									else if (end && end.isValid()) {
                    console.log("Valid end: " + (new Date(event.end) - new Date(event.start))/1000/60/60);
                    eventElement.style.height = (new Date(event.end) - new Date(event.start))/1000/60/60 * this.hourHeight + 'px';
										// eventElement.style.height = Math.min(end.diff(start, 'seconds'), dayDate.add(1, 'day').diff(start, 'seconds')) / 3600 * this.hourHeight + 'px';
									}
									else {
                    console.log("No end date");
										// No end date
										eventElement.style.height = this.hourHeight / 2.0 + 'px';
									}

									eventElement.innerHTML += innerElement.join('');

									if (that.editable && that.deleteButtons) {
										var closeButton = document.createElement('paper-icon-button');
										closeButton.setAttribute('icon', that.deleteIcon);
										closeButton.className = 'close';

										eventElement.classList.add('deletable');
										eventElement.appendChild(closeButton);
									}

									if (event.isStart && this.editable) {


									}

									df.appendChild(eventElement);

								}.bind(that));

								day.appendChild(df);
							}
						}.bind(this));
				}
			},

			setTime: function(hour) {
				hour = (hour !== undefined && !isNaN(hour)) ? hour : this.hourShow;
				this.$.scrollarea.scrollTop = hour * this.hourHeight;
			},

			/**
			 * Displays the previous day/week/month, depending on the current view.
			 */
			previous: function() {
				switch (this.view) {
					case 'planning':
						this.day.subtract(1, 'd');
						break;
					case 'month':
						this.day.subtract(1, 'M');
						break;
					case 'week':
						this.day.subtract(1, 'w');
						break;
					case 'day':
						this.day.subtract(1, 'd');
						break;
				}
				this.draw();
			},

			/**
			 * Displays the next day/week/month, depending on the current view.
			 */
			next: function() {
				switch (this.view) {
					case 'planning':
						this.day.add(1, 'd');
						break;
					case 'month':
						this.day.add(1, 'M');
						break;
					case 'week':
						this.day.add(1, 'w');
						break;
					case 'day':
						this.day.add(1, 'd');
						break;
				}
				this.draw();
			},

			today: function() {
				this.day = moment();
				this.draw();
			},

			showDay: function(event) {
				this.day = moment(event.target.parentNode.parentNode.getAttribute('data-date'), 'YYYY-MM-DD');
				this.view = 'day';
				this.draw();
			},

			changeView: function(evt) {
				if (!evt.target || evt.target.classList.contains('selected')) {
					return;
				}

				var view = evt.target.getAttribute("data-view");
				this.view = view;
        console.log(this.view);
        this.viewChanged();
			},

			toggleDayDropdown: function(e) {
				var day = e.currentTarget.dataset.date;

				var dropdownElement = this.shadowRoot.querySelector('.day[data-date="' + day + '"] paper-dropdown');

				if (dropdownElement) {
					dropdownElement.toggle();
				}
			},

			eventsChanged: function() {
				this.drawEvents();
			},

			addEvent: function(obj) {
				this.events.push(obj);
			}
		});
	})();
