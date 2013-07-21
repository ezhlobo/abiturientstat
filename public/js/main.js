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
			var addclass = " class='zero'";

			for ( var facultyName in faculties ) {
				if ( faculties.hasOwnProperty( facultyName ) ) {
					var faculty = faculties[ facultyName ];

					html += "<div class='faculty " + localStorage.getItem(facultyName) + "' data-id='" + facultyName + "'>";
					html += "<div class='faculty-name'>" + facultyName + "<i class='faculty-close'></i></div>";
					html += "<ul class='special'>";

					for ( var specialName in faculty ) {
						if ( faculty.hasOwnProperty( specialName ) ) {
							var special = faculty[ specialName ];
							var highest = special.freaks + special.det + special.high + special.highRural;

							html += "<li class='special-item " + (highest >= special.all ? "closed" : "opened" ) + "'>";
							html += "<div class='special-name'>" + specialName + "</div>";
							html += "<span" + (special.freaks === 0 ? addclass : "") + "><b>Без экзаменов + Вне конкурса</b>" + special.freaks + " + " + special.det + "</span>";
							html += "<span" + (special.high === 0 && special.highRural === 0 ? addclass : "") + "><b>Больше баллы + село</b>" + special.high + " + " + special.highRural + "</span>";
							html += "<span><b>Больше баллы / Количество мест</b>= " + (highest) + " / " + special.all + "</span>";
							html += "<span" + (special.similar === 0 && special.similarRural === 0 ? addclass : "") + "><b>Одинаковые баллы + село</b>" + special.similar + " + " + special.similarRural + "</span>";
							html += "</li>";
						}
					}

					html += "</ul>";
					html += "</div>";
				}
			}

			block_output.innerHTML = html;

			var closeButtons = document.querySelectorAll(".faculty-close");
			var clicked = function() {
				var item = this;
				var parent = item.parentElement.parentElement;
				if( parent.classList.contains("closed") ) {
					openFaculty( parent, item, parent.dataset.id );
				} else {
					closeFaculty( parent, item, parent.dataset.id );
				}
			};
			for (var i = 0, l = closeButtons.length; i < l; i++) {
				closeButtons[i].addEventListener("click", clicked, false)
			}
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
					"det": str2num( next.children[ 5 - 1 + index ].innerHTML ),
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

	var openFaculty = function(parent, item, id) {
		parent.classList.remove("closed");
		localStorage.setItem(id, "");
	};

	var closeFaculty = function(parent, item, id) {
		parent.classList.add("closed");
		localStorage.setItem(id, "closed");
	}

	var checkKeypress = function( e ) {
		var value = this.value;

		if ( loaded ) {
			new AbiturientStat( value );
		} else {
			score = value;
		}

		localStorage.setItem( "score", value );
	};

	var loadedCllb = function() {
		new AbiturientStat( score );
	};

	block_score.addEventListener( "keyup", checkKeypress, false );

	loadData( loadedCllb );

	if ( localStorage.getItem( "score" ) ) {
		block_score.blur();
		score = block_score.value = localStorage.getItem( "score" );
	}

})( window );
