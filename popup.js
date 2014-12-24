$(document).ready(function(){
	// localStorage.clear();
	// return;

	// Default for localStorage['exclude_domains']
	if (!localStorage.hasOwnProperty('exclude_domains')) {
		localStorage['exclude_domains'] = "{}";
	}

	//////////////////////////////
	// Deal with options
	//////////////////////////////
	var options = 
	[
		// option_font_size
		{
			'label': 'Font Size&nbsp;',
			'id': 'option_font_size',
			'default_value': 22,
			'values':
			[
				10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
			]
		},

		// option_font_face
		{
			'label': 'Font&nbsp;',
			'id': 'option_font_face',
			'default_value': 'Helvetica',
			'values':
			[
				'Times New Roman', 'Arial', 'Helvetica'
			]
		},
	]

	// Generate table
	for (var i=0; i<options.length; i++) {
		// Generate a row corresponding to options[i]
		var option = options[i];
		var str = '<tr><td>' + option['label']  + '</td>';
		str += '<td><select id="' + option['id'] + '">'
		
		for (var j=0; j<option['values'].length; j++) {
			var value = option['values'][j];
			str += "<option value='" + value + "'>" + value  + "</option>";
		}
		str += "</select></td></tr>";

		// Append the row
		$('#options').append($(str));
	}

	// Make the option menu choices reflect local storage / default
	for (var i=0; i<options.length; i++) {
		var option = options[i];
		if (!localStorage.hasOwnProperty(option['id'])) {
			localStorage[option['id']] = option['default_value'];
			console.log(localStorage[option['id']]);
		}
		$('#' + option['id']).val(localStorage[option['id']]);	
	}

	// If a user changes an option in the popup, change local storage
	$('#options').on( 'change', 'select', function(){
		var id = $(this).attr('id');
		var val = $(this).val();
		localStorage[id] = val;
		//console.log(localStorage);
	});


	//////////////////////////////
	// Deal with excludes
	//////////////////////////////
	var display_exclusion_table = function() {
		var domains = JSON.parse(localStorage['exclude_domains']);
		var table_html = '';
		for (domain in domains) {
			if (domains.hasOwnProperty(domain)) {
				table_html += '<tr><td>';
				table_html += '<span class="remove_domain">x</span> ';
				table_html += '<span>' + domain + '</span>';
				table_html += '</td></tr>';
			}
		}
		$('#excludes_table > tbody').html(table_html);
	}
	display_exclusion_table();

	// Remove domain from exclude list
	$('#excludes_table').on('click', '.remove_domain', function(){
		var domain = $(this).next().html();
		var domains = JSON.parse(localStorage['exclude_domains']);
		delete domains[domain];
		localStorage['exclude_domains'] = JSON.stringify(domains);
		display_exclusion_table();
	});

	// Exclude Current Domain
	$('#exclude_button').click(function(){
		chrome.windows.getCurrent(function(win){ 
			var windowId = win.id; 
			chrome.tabs.getSelected(windowId, function(tab){ 
				var current_url = new URL(tab.url);
				var host_name = current_url.hostname;
				//host_name = /[^.]*\.[^.]*$/.exec(host_name)[0];
				
				var domains = JSON.parse(localStorage['exclude_domains']);
				domains[host_name] = true;
				localStorage['exclude_domains'] = JSON.stringify(domains);
				display_exclusion_table();
			}); 
		});
	});


});
