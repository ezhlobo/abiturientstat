(function( window ) {

	var
		document = window.document,
		proto = "prototype",
		block_input = document.getElementById( "input" ),
		block_output = document.getElementById( "output" ),
		block_score = document.getElementById( "score" ),

		score = 0,

		str2id = function( str ) {
			return str.replace( /^\s*|\s*$/g, "" );
		},
		str2num = function( str ) {
			return parseFloat( str ) || 0;
		};

	var loaded = false;
	var loadData = function( callback ) {
		if ( loaded ) return;

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function() {
			if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
				loaded = true;
				block_input.innerHTML = xmlhttp.responseText;
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
				options.endPosition = 30;
			} else if ( value < 60 ) {
				options.endPosition = 31;
			} else {
				options.endPosition = Math.floor( ( 1 - value / 400 ) / 0.025 );
			}

			that.mark = value;
			that.analyzeData();
			that.showData();
		}

		as[ proto ].showData = function() {
			var html = "";
			var faculties = this.faculties;

			for ( var facultyName in faculties ) {
				if ( faculties.hasOwnProperty( facultyName ) ) {
					var faculty = faculties[ facultyName ];

					html += "<div class='faculty'>";
					html += "<div class='faculty-name'>" + facultyName + "</div>";
					html += "<ul class='special'>";

					for ( var specialName in faculty ) {
						if ( faculty.hasOwnProperty( specialName ) ) {
							var special = faculty[ specialName ];
							var addclass = " class='zero'";

							html += "<li class='special-item'>";
							html += "<div class='special-name'>" + specialName + "</div>";
							html += "<span" + (special.freaks === 0 ? addclass : "") + "><b>Без экзаменов</b>" + special.freaks + "</span>";
							html += "<span" + (special.high === 0 ? addclass : "") + "><b>Больше баллы</b>" + special.high + "</span>";
							html += "<span" + (special.similar === 0 ? addclass : "") + "><b>Одинаковые баллы</b>" + special.similar + "</span>";
							html += "<span" + (special.highRural === 0 ? addclass : "") + "><b>Больше баллы (село)</b>" + special.highRural + "</span>";
							html += "<span" + (special.similarRural === 0 ? addclass : "") + "><b>Одинаковые баллы (село)</b>" + special.similarRural + "</span>";
							html += "</li>";
						}
					}

					html += "</ul>";
					html += "</div>";
				}
			}

			block_output.innerHTML = html;
		};

		as[ proto ].analyzeData = function() {
			var that = this;
			var rows = document.querySelectorAll( "#input .thead + .thead + tr" );

			for ( var i = 0, l = rows.length; i < l; i++ ) {
				var row = rows[ i ];
				var name = str2id( row.children[ 0 ].children[ 0 ].innerHTML );

				that.faculties[ name ] = that._getSpeciality( row );
				// that.faculties[ name ][ "name" ] = name;
			}
		};

		as[ proto ]._getSpeciality = function( row ) {
			var out = {};

			var next = row;
			var k = 0;

			while ( !next.classList.contains( "all" ) ) {
				var index = k++ === 0 ? 1 : 0;
				var title = next.children[ index ].innerHTML;

				var high = 0;
				var highRural = 0;
				var similar = 0;
				var similarRural = 0;

				var n = options.endPosition;
				for ( var i = 0; i < n; i++ ) {
					high += str2num( next.children[ i + options.startPosition - 1 + index ].innerHTML );
					highRural += str2num( next.nextElementSibling.children[ i + options.startRuralPosition ].innerHTML ) ;
				}


				similar = str2num( next.children[ options.endPosition + options.startPosition - 1 + index ].innerHTML );
				similarRural = str2num( next.nextElementSibling.children[ options.endPosition + options.startRuralPosition - 1 + index ].innerHTML );

				out[ str2id( title ) ] = {
					"name": str2id( title ),
					"all":  str2num( next.children[ index + 1 ].innerHTML ),
					"freaks": str2num( next.children[ 4 - 1 + index ].innerHTML ),
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

	var checkKeypress = function( e ) {
		if ( ( e.keyCode >= 48 /*0*/ && e.keyCode <= 57 /*9*/ ) || e.keyCode === 8 /*Esc*/ ) {
			var value = this.value;

			if ( loaded ) {
				new AbiturientStat( value );
			} else {
				score = value;
			}

			localStorage.setItem( "score", value );
		}
	};

	var checkKey = function( e ) {
		if ( ( e.keyCode <= 48 /*0*/ && e.keyCode >= 57 /*9*/ ) || !e.keyCode === 8 ) {
			return false;
		}
	};

	var loadedCllb = function() {
		new AbiturientStat( score );
	};

	block_score.addEventListener( "keyup", checkKeypress, false );
	block_score.addEventListener( "keydown", checkKey, false );
	block_score.addEventListener( "keypress", checkKey, false );

	loadData( loadedCllb );

	if ( localStorage.getItem( "score" ) ) {
		block_score.blur();
		block_score.value = localStorage.getItem( "score" );
	}

})( window );
