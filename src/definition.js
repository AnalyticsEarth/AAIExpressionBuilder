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

	var aaiSettings = {
		component: "expandable-items",
		label: "AAI Expression Builder",
		items: {
			header: {
				type: "items",
				label: "Settings",
				items: {
					beta: {
						ref: "props.includeBeta",
						label: "Include Beta Functions",
						type: "boolean",
						defaultValue: false
					},
					allFields: {
						ref: "props.allFields",
						label: "Show All Fields",
						type: "boolean",
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
			appearance: appearanceSection,
			settings: aaiSettings
		}
	};
});
