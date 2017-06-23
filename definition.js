define( [], function () {
	'use strict';

	var stateName = {
		ref: "props.showTitles",
		label: "Show Titles",
		type: "boolean"
	};

	// Appearance section
	var appearanceSection = {
		uses: "settings",
		items: {
			stateName: stateName
		}
	};

	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: "items"/*,
		component: "accordion",
		items: {
			appearance: appearanceSection
		}*/
	};
});
