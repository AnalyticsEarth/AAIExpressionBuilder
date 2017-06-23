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

	var includeBeta = {
		ref: "props.includeBeta",
		label: "Include Beta Functions",
		type: "boolean",
		component: "switch",
		defaultValue: false
	};

	var aaiSettings = {
		component: "expandable-items",
		label: "AAI Expression Builder",
		items: {
			header: {
				type: "items",
				label: "Settings",
				items: {
					beta: includeBeta
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
			appearance: appearanceSection,
			settings: aaiSettings
		}
	};
});
