define( [], function () {
	'use strict';

	// Appearance section
	var appearanceSection = {
		uses: "settings",
		items: {
			general: {
				items:{
					showTitles:{
						defaultValue: false
					}
				}
			}
		}
	};

	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: "items",
		component: "accordion",
		items: {
			appearance: appearanceSection
		}
	};
});
