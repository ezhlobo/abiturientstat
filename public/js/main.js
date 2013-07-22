(function( window ) {

	var
		// Optimize document variable
		document = window.document,
		location = window.location,

		// DOM elements
		b_input = document.getElementById( "input" ),
		b_output = document.getElementById( "output" ),
		b_score = document.getElementById( "score" ),

		// Your score by default
		score = 0,

		// Save score
		setScore = function( value ) {
			window.location.hash = value;
			b_score.value = value;
			localStorage.setItem( "score", value );
		},

		// Convert string to id
		str2id = function( str ) {
			return str.replace( /^\s*|\s*$/g, "" );
		},

		// Convert string to number
		str2num = function( str ) {
			return parseFloat( str ) || 0;
		},

		dataLoaded = false,
		loadData = function( callback ) {
			if ( dataLoaded ) return;

			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
				if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
					dataLoaded = true;
					b_input.innerHTML = xmlhttp.responseText;
					callback();
				}
			}

			xmlhttp.open( "GET", "backend/table" );
			xmlhttp.send();
		};

	var AbiturientStat = (function() {
		var options = {
			startPosition: 8,
			startRuralPosition: 2,
			endPosition: 0
		};

		function as( value ) {
			var that = this;

			that.faculties = {};

			if ( value >= 60 && value <= 100 ) {
				// Pre-last cell
				options.endPosition = 30;
			} else if ( value < 60 ) {
				// Last cell
				options.endPosition = 31;
			} else {
				// Find cell according to your score
				options.endPosition = Math.floor( ( 1 - value / 400 ) / 0.025 );
			}

			that.mark = value;

			// Get 'this.faculties' object
			that.parseData();

			// Show table with analyzed data
			that.showData();
		}

		as.prototype.showData = function() {
			var facultyName,
				html = "",
				faculties = this.faculties,
				addclass = " class='zero'";

			// Faculty template
			for ( facultyName in faculties ) {
				var spceialName,
					faculty = faculties[ facultyName ];

				html += "<div class='faculty " + localStorage.getItem( facultyName ) + "' data-id='" + facultyName + "'>";
				html += "<div class='faculty-name'>" + facultyName + "<i class='faculty-close'></i></div>";
				html += "<ul class='special'>";

				// Specialty template
				for ( specialName in faculty ) {
					var
						special = faculty[ specialName ],
						highest = special.freaks + special.exempts + special.high + special.highRural;

					html += "<li class='special-item " + ( highest >= special.all ? "closed" : "opened" ) + "'>";
					html += "<div class='special-name'>" + specialName + "</div>";
					html += "<span" + ( special.freaks === 0 ? addclass : "" ) + "><b>Без экзаменов + Вне конкурса</b>" + special.freaks + " + " + special.exempts + "</span>";
					html += "<span" + ( special.high === 0 && special.highRural === 0 ? addclass : "" ) + "><b>Больше баллы + село</b>" + special.high + " + " + special.highRural + "</span>";
					html += "<span><b>Больше баллы / Количество мест</b>= " + highest + " / " + special.all + "</span>";
					html += "<span" + ( special.similar === 0 && special.similarRural === 0 ? addclass : "" ) + "><b>Одинаковые баллы + село</b>" + special.similar + " + " + special.similarRural + "</span>";
					html += "</li>";
				}

				html += "</ul>";
				html += "</div>";
			}

			b_output.innerHTML = html;

			var
				closeButtons = document.querySelectorAll(".faculty-close"),
				openBlockFaculty = function( parent, id ) {
					parent.classList.remove( "closed" );
					localStorage.setItem( id, "" );
				},
				closeBlockFaculty = function( parent, id ) {
					parent.classList.add( "closed" );
					localStorage.setItem( id, "closed" );
				},
				closeButtonClicked = function() {
					var parent = this.parentElement.parentElement;

					if( parent.classList.contains( "closed" ) ) {
						openBlockFaculty( parent, parent.dataset.id );
					} else {
						closeBlockFaculty( parent, parent.dataset.id );
					}
				},
				i = 0,
				l = closeButtons.length;

			for ( ; i < l; i++ ) {
				closeButtons[ i ].addEventListener( "click", closeButtonClicked, false );
			}
		};

		as.prototype.parseData = function() {
			var
				that = this,
				rows = document.querySelectorAll( "#input .thead + .thead + tr" ),
				i = 0,
				l = rows.length;

			for ( ; i < l; i++ ) {
				var
					row = rows[ i ],
					name = str2id( row.children[ 0 ].children[ 0 ].innerHTML );

				that.faculties[ name ] = that._getSpeciality( row );
			}
		};

		as.prototype._getSpeciality = function( row ) {
			var
				out = {},
				next = row,
				k = 0;

			while ( !next.classList.contains( "all" ) ) {
				var
					index = k++ === 0 ? 1 : 0,
					title = next.children[ index ].innerHTML,

					high = 0,
					highRural = 0,
					similar = 0,
					similarRural = 0,

					n = options.endPosition,
					i = 0;

				for ( ; i < n; i++ ) {
					high += str2num( next.children[ i + options.startPosition + ( - 1 + index ) ].innerHTML );
					highRural += str2num( next.nextElementSibling.children[ i + options.startRuralPosition ].innerHTML ) ;
				}


				similar = str2num( next.children[ options.endPosition + options.startPosition + ( - 1 + index ) ].innerHTML );
				similarRural = str2num( next.nextElementSibling.children[ options.endPosition + options.startRuralPosition + ( - 1 + index ) ].innerHTML );

				out[ str2id( title ) ] = {
					"name": str2id( title ),
					"all":  str2num( next.children[ index + 1 ].innerHTML ),
					"freaks": str2num( next.children[ 4 + ( - 1 + index ) ].innerHTML ),
					"exempts": str2num( next.children[ 5 + ( - 1 + index ) ].innerHTML ),
					"high": high,
					"highRural": highRural,
					"similar": similar,
					"similarRural": similarRural
				};

				next = next.nextElementSibling.nextElementSibling;
			}

			return out;
		};

		return as;
	})();

	loadData(function() {
		new AbiturientStat( score );
	});

	// Don't propose to enter data if user use a permanent link
	if ( location.hash ) {
		b_score.blur();
		score = b_score.value = location.hash.replace( /^#/, "" );
	} else
	// Don't propose to enter data if user already use this site
	if ( localStorage.getItem( "score" ) ) {
		b_score.blur();
		score = b_score.value = localStorage.getItem( "score" );
	}

	var addNewScore = function( value ) {
		if ( dataLoaded ) {
			new AbiturientStat( value );
		} else {
			score = value;
		}

		setScore( value );
	};

	var keyHandler = function() {
		addNewScore( this.value );
	};

	var hashHandler = function() {
		addNewScore( location.hash.replace( /^#/, "" ) );
	};

	b_score.addEventListener( "keyup", keyHandler, false );

	// Change table if user change window hash
	window.addEventListener( "hashchange", hashHandler, false );

})( window );
