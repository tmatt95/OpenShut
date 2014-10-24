(function ($) {
    $.fn.openShut = function (options) {

	// Contains all the functions used to run the open shut plugin.
	var osfunctions = {
	    // Creates the settings information based on the defaults / settings
	    // sent in by the user and stores it on the object.
	    'init': function (e, options) {
		// Contains the defaults which can be overwritten by the
		// application.
		var settings = $.extend({
		    // Whether the output of the text contains html.
		    'textHtml': false,
		    // Default text for when open
		    'textOpen': 'Open',
		    // Default text for when closed
		    'textClosed': 'Closed',
		    // The container that contains the status.
		    'container': '{text}',
		    // The days of the week and when it is open / closed
		    'days': {
			'monday': {'open': '00:00', 'closed': '00:00'},
			'teusday': {'open': '00:00', 'closed': '00:00'},
			'wednesday': {'open': '00:00', 'closed': '00:00'},
			'thursday': {'open': '00:00', 'closed': '00:00'},
			'friday': {'open': '00:00', 'closed': '00:00'},
			'saturday': {'open': '07:00', 'closed': '16:00'},
			'sunday': {'open': '00:00', 'closed': '00:00'}
		    },
		    // The dates that the place is shut.
		    datesClosed: [
//			{
//			    // start and end closed range
//			    'start': 'DD/MM/YYY HH:MM:SS',
//			    'end': 'DD/MM/YYY HH:MM:SS',
//			    // Closed text
//			    'textClosed': 'Happy Christmas',
//			    // Whether to display the text closed as html
//			    'textHtml': false
//			}
		    ],
		    // Where to get the time from
		    timeUrl: '',
		    // A custom function can be used to get the time
		    timeFunction: function (timeUrl) {
			// Ajax the server
			
			// Take the time and convert it to a javascript object
			// Return javascript object.
		    },
		    // status, whether open or closed
		    status: 'open',
		    // Enables ypou to set a message when the widget is loading.
		    loadingText: '',
		    // Whether the loading text contains contains html.
		    loadingHtml: false,
		    // The time the display was genarated at.
		    timeDateGenerated: null,
		    
		    // Whether or not to diplay error messages
		    debug: false
		}, options);

		// Gets the current date and time
		osfunctions.curDateTimeGet(e, settings);
	    },
	    // Gets the current date and time, either from the client or from
	    // a remote server if specified.
	    'curDateTimeGet': function (e, settings) {

		if (settings.timeUrl.length > 0) {
		    // call the time function to get the current time
		    settings.timeFunction(settings.timeUrl);
		} else {
		    // Sets the time generated to that of the local machine.
		    var d = new Date();
		    settings.timeDateGenerated = d;

		    // Calls the function to format the date / time
		    osfunctions.curDateTimeFormat(e, settings);
		    
		    if(settings.debug === true){
			var wmess = 'Warning: The correct information cannot be ';
			wmess = wmess + 'garunteed with the plugin set to use the';
			wmess = wmess + ' time on the viewers computer.';
			alert(wmess);
		    }
		}
	    },
	    // Takes the javascript data time and creates a detailed array
	    // containing the day of the week etc
	    'curDateTimeFormat': function (e, settings) {

		// Day generated in the curDateTimeGet function
		var d = settings.timeDateGenerated;

		var weekday = new Array(7);
		weekday[0] = "sunday";
		weekday[1] = "monday";
		weekday[2] = "tuesday";
		weekday[3] = "wednesday";
		weekday[4] = "thursday";
		weekday[5] = "friday";
		weekday[6] = "saturday";

		// Used to store the current day of the week.
		var curDay = weekday[d.getDay()];

		// Loop through the dates closed array.
		// If there are any date ranges which include the current date
		// then we need to set the status to closed. Also override other
		// settings here as well.
		$(settings.datesClosed).each(function (index, item) {
		    // Create date object from date string for from date
		    var dateClosedFrom = item.start.trim();
		    var dateClosedFromDate = dateClosedFrom.split(" ")[0].split("/");
		    var dateClosedFromTime = dateClosedFrom.split(" ")[1].split(":");
		    var dateClosedFromObj = new Date(dateClosedFromDate[2], dateClosedFromDate[1]- 1, dateClosedFromDate[0], dateClosedFromTime[0], dateClosedFromTime[1], dateClosedFromTime[2], 0);
		    
		    // Create date object from date string for to date
		    var dateClosedTo = item.end.trim();
		    var dateClosedToDate = dateClosedTo.split(" ")[0].split("/");
		    var dateClosedToTime = dateClosedTo.split(" ")[1].split(":");
		    var dateClosedToObj = new Date(dateClosedToDate[2], dateClosedToDate[1]- 1, dateClosedToDate[0], dateClosedToTime[0], dateClosedToTime[1], dateClosedToTime[2], 0);
		    
		    if(d.getTime() > dateClosedFromObj.getTime() && d.getTime() < dateClosedToObj.getTime()){
			
			// Sets the item to closed.
			settings.status = 'closed';
			
			// Override the closed message here.
		    }
		});
		
		// Used to store the current time (24 hours).
		var curTime = d.getHours() + ':' + d.getMinutes();
		var curTimeInt = curTime.replace(/:/ig, "");

		// Takes the current day and figures out the open and closed times.
		var todayTimesBase = settings.days[curDay];

		// Sets the default open/close to the default for the day.
		var open = todayTimesBase.open;
		var closed = todayTimesBase.closed;

		// Now we have the time set up in the open and closed variables
		// and the current time we can look to see if the current time
		// falls inide the range and set the settings.status
		// accordingly.
		var openInt = open.replace(/:/ig, "");
		var closedInt = closed.replace(/:/ig, "");

		if (openInt === '0000' && closedInt === '0000') {
		    // If this is the setting then allways show closed.
		    settings.status = 'closed';
		} else {
		    // Before we open. We are closed
		    if (curTimeInt < openInt) {
			settings.status = 'closed';
		    }
		}
		// We are closed for the evening.
		if (curTimeInt > closedInt) {
		    settings.status = 'closed';
		}

		// Output the info.
		osfunctions.output(e, settings);
	    },
	    '': '',
	    'output': function (e, settings) {

		// Used to store the html we are outputing to the window.
		var output = '';

		// This will contain the content based on whether we have
		// decided to show an open or a closed.
		var outputContent = '';
		
		// gets the output text
		if (settings.status === 'open') {
		    outputContent = settings.textOpen;
		} else {
		    outputContent = settings.textClosed;
		}

		// Joins the content and the container together to get the
		// finished output string.
		output = settings.container.replace('{text}', outputContent);

		// Puts the content on the screen.
		if (settings.textHtml === true) {
		    e.html(output);
		} else {
		    e.text(output);
		}

		// Store the settings on the element. We can reference them if a
		// function calls them in the future.
		e.data('openCloseSettings', settings);
	    }
	};

	// ---------------------------------------------------------------------
	// CONTROLLER SECTION
	// ---------------------------------------------------------------------

	// First we check what type of variable the options is. If it is a
	// string then we are calling a function on a openShut object which has
	// allready been set up. If it is a object then we are setting it up.
	//if (typeof options === 'string') {
	//    // Gets the settings from the object.
	//   var settings = this.data('openCloseTimes');
	//    // functions to run.
	//}
	if (typeof options === 'object') {
	    // Initiate the object
	    osfunctions.init(this, options);
	}

	// At the end we want to return the object back out.
	return this;
    };
}(jQuery));
