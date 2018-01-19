/* jshint -W079 */

'use strict';

const Timetable = function () {
	this.scope = {
		hourStart: 9,
		hourEnd: 17
	};
	this.locations = [];
	this.events = [];
};

Timetable.Renderer = function (tt) {
	if (!(tt instanceof Timetable)) {
		throw new TypeError('Initialize renderer using a Timetable');
	}
	this.timetable = tt;
};

(function () {
	function isValidHourRange(start, end) {
		return isValidHour(start) && isValidHour(end);
	}

	function isValidHour(number) {
		return isInt(number) && isInHourRange(number);
	}

	function isInt(number) {
		return number === parseInt(number, 10);
	}

	function isInHourRange(number) {
		return number >= 0 && number < 24;
	}

	function locationExistsIn(loc, locs) {
		return locs.indexOf(loc) !== -1;
	}

	function isValidTimeRange(start, end) {
		const correctTypes = start instanceof Date && end instanceof Date;
		const correctOrder = start < end;
		return correctTypes && correctOrder;
	}

	function getDurationHours(startHour, endHour) {
		return endHour >= startHour ? endHour - startHour : 24 + endHour - startHour;
	}

	Timetable.prototype = {
		setScope(start, end) {
			if (isValidHourRange(start, end)) {
				this.scope.hourStart = start;
				this.scope.hourEnd = end;
			} else {
				throw new RangeError('Timetable scope should consist of (start, end) in whole hours from 0 to 23');
			}

			return this;
		},
		addLocations(newLocations) {
			const hasProperFormat = locs => Array.isArray(locs);
			const existingLocations = this.locations;

			if (hasProperFormat(newLocations)) {
				newLocations.forEach(loc => {
					if (!locationExistsIn(loc, existingLocations)) {
						existingLocations.push(loc);
					} else {
						throw new Error('Location already exists');
					}
				});
			} else {
				throw new Error('Tried to add locations in wrong format');
			}

			return this;
		},
		addEvent(name, location, start, end, options) {
			if (!locationExistsIn(location, this.locations)) {
				throw new Error('Unknown location');
			}
			if (!isValidTimeRange(start, end)) {
				throw new Error('Invalid time range: ' + JSON.stringify([start, end]));
			}

			const optionsHasValidType = Object.prototype.toString.call(options) === '[object Object]';

			this.events.push({
				name,
				location,
				startDate: start,
				endDate: end,
				options: optionsHasValidType ? options : undefined
			});

			return this;
		}
	};

	function emptyNode(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}

	function prettyFormatHour(hour) {
		const prefix = hour < 10 ? '0' : '';
		return prefix + hour + ':00';
	}

	Timetable.Renderer.prototype = {
		draw(selector) {
			function checkContainerPrecondition(container) {
				if (container === null) {
					throw new Error('Timetable container not found');
				}
			}

			function appendTimetableAside(container) {
				const asideNode = container.appendChild(document.createElement('aside'));
				const asideULNode = asideNode.appendChild(document.createElement('ul'));
				appendRowHeaders(asideULNode);
			}

			function appendRowHeaders(ulNode) {
				for (let k = 0; k < timetable.locations.length; k++) {
					const liNode = ulNode.appendChild(document.createElement('li'));
					const spanNode = liNode.appendChild(document.createElement('span'));
					spanNode.className = 'row-heading';
					spanNode.textContent = timetable.locations[k];
				}
			}

			function appendTimetableSection(container) {
				const sectionNode = container.appendChild(document.createElement('section'));
				const timeNode = sectionNode.appendChild(document.createElement('time'));
				appendColumnHeaders(timeNode);
				appendTimeRows(timeNode);
			}

			function appendColumnHeaders(node) {
				const headerNode = node.appendChild(document.createElement('header'));
				const headerULNode = headerNode.appendChild(document.createElement('ul'));

				let completed = false;
				let looped = false;

				for (let hour = timetable.scope.hourStart; !completed;) {
					const liNode = headerULNode.appendChild(document.createElement('li'));
					const spanNode = liNode.appendChild(document.createElement('span'));
					spanNode.className = 'time-label';
					spanNode.textContent = prettyFormatHour(hour);

					if (hour === timetable.scope.hourEnd && (timetable.scope.hourStart !== timetable.scope.hourEnd || looped)) {
						completed = true;
					}
					if (++hour === 24) {
						hour = 0;
						looped = true;
					}
				}
			}

			function appendTimeRows(node) {
				const ulNode = node.appendChild(document.createElement('ul'));
				ulNode.className = 'room-timeline';
				for (let k = 0; k < timetable.locations.length; k++) {
					const liNode = ulNode.appendChild(document.createElement('li'));
					appendLocationEvents(timetable.locations[k], liNode); /**/
				}
			}

			function appendLocationEvents(location, node) {
				for (let k = 0; k < timetable.events.length; k++) {
					const event = timetable.events[k];
					if (event.location === location) {
						appendEvent(event, node);
					}
				}
			}

			function appendEvent(event, node) {
				const hasOptions = event.options !== undefined;
				let hasURL, hasAdditionalClass,
					hasDataAttributes = false;

				if (hasOptions) {
					hasURL = (event.options.url !== undefined);
					hasAdditionalClass = (event.options.class !== undefined);
					hasDataAttributes = (event.options.data !== undefined);
				}

				const elementType = hasURL ? 'a' : 'span';
				const aNode = node.appendChild(document.createElement(elementType));
				const smallNode = aNode.appendChild(document.createElement('small'));
				aNode.title = event.name;

				if (hasURL) {
					aNode.href = event.options.url;
				}
				if (hasDataAttributes) {
					for (const key in event.options.data) {
						aNode.setAttribute('data-' + key, event.options.data[key]);
					}
				}

				aNode.className = hasAdditionalClass ? 'time-entry ' + event.options.class : 'time-entry';
				aNode.style.width = computeEventBlockWidth(event);
				aNode.style.left = computeEventBlockOffset(event);
				smallNode.textContent = event.name;
			}

			function computeEventBlockWidth(event) {
				const start = event.startDate;
				const end = event.endDate;
				const durationHours = computeDurationInHours(start, end);
				return durationHours / scopeDurationHours * 100 + '%';
			}

			function computeDurationInHours(start, end) {
				return (end.getTime() - start.getTime()) / 1000 / 60 / 60;
			}

			function computeEventBlockOffset(event) {
				const scopeStartHours = timetable.scope.hourStart;
				const eventStartHours = event.startDate.getHours() + (event.startDate.getMinutes() / 60);
				const hoursBeforeEvent = getDurationHours(scopeStartHours, eventStartHours);
				return hoursBeforeEvent / scopeDurationHours * 100 + '%';
			}

			var timetable = this.timetable;
			var scopeDurationHours = getDurationHours(timetable.scope.hourStart, timetable.scope.hourEnd);
			const container = document.querySelector(selector);
			checkContainerPrecondition(container);
			emptyNode(container);
			appendTimetableAside(container);
			appendTimetableSection(container);
		}
	};
})();
