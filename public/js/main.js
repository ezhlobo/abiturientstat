(function( window ) {

	var
		document = window.document,
		proto = "prototype",
		block_input = document.getElementById( "input" ),
		block_output = document.getElementById( "output" ),

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

		function as( value) {
			var that = this;

			that.faculties = {};

			options.endPosition = Math.floor( ( 1 - value / 400 ) / 0.025 );

			that.mark = value;
			that.analyzeData();
			that.showData();
		}

		as[ proto ].showData = function() {
			var html = "";
			var faculties = this.faculties;
			console.log( faculties );

			for ( var facultyName in faculties ) {
				if ( faculties.hasOwnProperty( facultyName ) ) {
					var faculty = faculties[ facultyName ];

					html += "<div class='faculty'>";
					html += "<div class='faculty-name'>" + facultyName + "</div>";
					html += "<ul class='special'>";

					for ( var specialName in faculty ) {
						if ( faculty.hasOwnProperty( specialName ) ) {
							var special = faculty[ specialName ];

							html += "<li class='special-item'>";
							html += "<div class='special-name'>" + specialName + "</div>";
							html += "<span><b>Без экзаменов</b>" + special.freaks + "</span>";
							html += "<span><b>Больше баллы</b>" + special.high + "</span>";
							html += "<span><b>Одинаковые баллы</b>" + special.similar + "</span>";
							html += "<span><b>Больше баллы (село)</b>" + special.highRural + "</span>";
							html += "<span><b>Одинаковые баллы (село)</b>" + special.similarRural + "</span>";
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

	loadData(function() {
		new AbiturientStat( 367 );
	});

})( window );
