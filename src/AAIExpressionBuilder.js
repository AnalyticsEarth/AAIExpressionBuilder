define( [ "qlik",
'text!./template.ng.html',
'./definition',
'text!./dialog-template.ng.html',
'css!./AAIExpressionBuilderStyle.css',
'./wizardList',
'util',
'enigma',
'text!./schema.json'
], 
function ( qlik, template, definition, dialogTemplate, cssStyle, wizardList, Util, enigma, schema) {
	'use strict';
	return {
		support : {
			snapshot: false,
			export: false,
			exportData : false
		},
		template: template,
		definition: definition,
		paint: function ($element,layout){

			layout.navmode = qlik.navigation.getMode();
			console.log($element);

			if(layout.navmode == 'analysis'){
				$("#launchButton").removeClass("hidden").addClass("hidden");
			}else{
				$("#launchButton").removeClass("hidden");
			}

		},
		controller: ['$scope','luiDialog', function ( $scope, luiDialog) {
			$scope.wizardList = wizardList;
			$scope.layout = $scope.$parent.layout;
			console.log($scope);


			/* This function opens the dialog window when the openWizard() function
			is called */
			$scope.openWizard = function(){
				luiDialog.show({
					template: dialogTemplate,
					input: {
						selectedKey: '',
						wizardName: '',
						showKey: false,
						wizardList: $scope.wizardList,
						appModel: $scope.component.model.app,
						layout: $scope.layout,
						isLoading: false,
						enableVizBuild: true,
						previewEnabled: false,
						buttonState: 0,
						buttonTitle: 'Preview Master Items',
						buttonIcon: 'view',
						warningMessage: ''
					},
					controller: ['$scope', function( $scope ) {
						console.log($scope);

						/* Get current Qlik App and field list */
						var app = qlik.currApp(this);
						app.getList("FieldList", function(reply){
							$scope.input.fieldList = reply;
							console.log(reply);
						});

						/* This utility function is called when conversion a written JSON
						path from a config template and returnin the required object
						in the template */
						$scope.objectByString = function(o, s) {
							s = s.replace(/\[(\w+)\]/g, '.$1');
							s = s.replace(/^\./, '');
							var a = s.split('.');
							for (var i = 0, n = a.length; i < n; ++i) {
								var k = a[i];
								if (k in o) {
									o = o[k];
								} else {
									return;
								}
							}
							return o;
						};

						/* Set the default tab and create the function which will allow for
						the tab to be changed in code */
						$scope.tabs = 'tab1';
						$scope.make_tab_active = function(tabid) {
							$scope.tabs = 'tab'+tabid;
							//console.log($scope.tabs);
						}

						$scope.make_tab_active(1);


						/* Prep the input list boxes that are used for parameter capture
						on the input form */
						$scope.input.idList = [];
						$scope.input.aggList = ['Count','Sum','Min','Max','Avg'];
						$scope.input.dateAggList = [
							{level:'Week', frequency:52},
							{level:'Month', frequency:12}
						];

						/* Function called when the selected wizard is changed using the
						onscreen drop down */
						$scope.changeWizard = function(){
							//console.log($scope.input.selectedKey);
							//console.log($scope.input.selectedMethod);
							$scope.input.selectedKey = $scope.input.selectedMethod.index;
							$scope.input.showKey = true;
							//console.log($scope.input.selectedKey);
							$scope.input.wizardName = $scope.input.wizardList[$scope.input.selectedKey].name;
							$scope.loadUI($scope.input.selectedKey);
						};

						//When any of the measures and dimensions are de-selected we must not produce visualizations as these will be incomplete
						$scope.$watch("input.codeTemplates", function(newValue, oldValue) {
							if(newValue){
								$scope.input.vizDisabled = false;
								newValue.forEach(function(entry){
									if(entry.enabled == false){
										$scope.input.vizDisabled = true;
									}
								});
							}
  					}, true);

						/* Loads the UI when a change to the wizard is made */
						$scope.loadUI = function(wizKey){
							$scope.input.uiarray = null;
							$scope.input.codeTemplates = null;
							$scope.input.vizTemplates = null;
							$scope.input.variableTemplates = null;
							$scope.input.vizDisabled = false;
							$scope.input.isLoading = true;
							if($scope.input.wizardList[wizKey].config){
								require(['text!../extensions/AAIExpressionBuilder/wizards/'+ $scope.input.wizardList[wizKey].config + '.json'], function(wizardConfig) {
									var response = JSON.parse(wizardConfig);
									/* Parameters List */
									$scope.input.uiarray = response.parameters;
									$scope.input.uiarray.forEach(function(entry){
										//entry.inputvalue = '';
										entry.itemArray = [];
										if(!entry.arrayItemDefaults){
											entry.arrayItemDefaults = {};
										}
										$scope.addArrayItem(entry.itemArray,entry.arrayItemDefaults);
									});

									/* Master Items to be created list */
									$scope.input.codeTemplates = response.templates;
									$scope.input.codeTemplates.forEach(function(entry){
										entry.enabled = true;
										entry.built = false;
										entry.displayName = entry.name;
									});

									/* Visualizations to be created list */
									$scope.input.vizTemplates = response.viz;
									if($scope.input.vizTemplates){
										$scope.input.vizTemplates.forEach(function(entry){
											entry.enabled = true;
											entry.built = false;
											entry.displayTitle = entry.title;
										});
									}
									$scope.input.vizDisabled = false;

									/* Variables to be created list */
									$scope.input.variableTemplates = response.variables;
									if($scope.input.variableTemplates){
										$scope.input.variableTemplates.forEach(function(entry){
											entry.enabled = true;
											entry.built = false;
										});
									}

									$scope.input.isLoading = false;
									$scope.$apply();
								});
							}
						};

						$scope.addArrayItem = function(p,d){
							//console.log(d);
							var dnew = JSON.parse(JSON.stringify(d));
							p.push(dnew);
						};

						$scope.removeArrayItem = function(p,i){
							var e = p.indexOf(i);
							if(e > -1) {
								p.splice(e,1);
							}
						};

						/* Called when the template parameters need to be turned into the
						Qlik expression that is required for the master item */
						$scope.completeTemplates = function(){
							var errorCounter = 0;
							$scope.input.codeTemplates.forEach(function(t){

								/* Process R scripts */
								if(t.scriptType.toUpperCase() == 'R'){
									if(!$scope.rScriptTemplate(t)) errorCounter++;
								}

								/* Process fields generated from Qlik native date fields */
								if(t.scriptType == 'nativedate'){
									if(!$scope.nativeDateTemplate(t)) errorCounter++;
								}

								/* Process a native Qlik field */
								if(t.scriptType == 'nativefield'){
									if(!$scope.nativeFieldTemplate(t)) errorCounter++;
								}

								/* Process a native Qlik aggregation field */
								if(t.scriptType == 'nativeagg'){
									if(!$scope.nativeFieldAggTemplate(t)) errorCounter++;
								}

								/* Process a native Qlik aggregation field */
								//TODO: Implement this function for native calcs and switch this on
								//if(t.scriptType == 'nativecalc'){
								//	if(!$scope.nativeFieldCalcTemplate(t)) errorCounter++;
								//}

							});
							if(errorCounter > 0){
								return false;
							}{
								return true;
							}
						};

						$scope.rFormula = function(r){
							var out = "";
							r.itemArray.forEach(function(i){
								var e = r.itemArray.indexOf(i) + 1;
								var e2 = e;
								if(e == 1) e2 = '';
								out = out + r.scriptid + e2;
								if(e < r.itemArray.length){
									out = out + " " + i.postoperator + " ";
								}

							});
							return out;
						}

						/* R script template processing */
						$scope.rScriptTemplate = function(t){
							t.outCode = null;

							if(t.enabled){
								//Process Template
								var rScript = t.rscript;
								var qParams = '';
								$scope.input.uiarray.forEach(function(p){
									//Replace Field with a dataframe column parameter
									var regExp = new RegExp('##<'+p.scriptid+'>##','g');
									if(p.scriptisformula){
										rScript = rScript.replace(regExp,$scope.rFormula(p));
									}else{
										rScript = rScript.replace(regExp,p.scriptid);
									}

									//Replace With fieldname as is a Qlik native script function
									var regExp2 = new RegExp('#!<'+p.scriptid+'>!#','g');
									rScript = rScript.replace(regExp2,'['+p.itemArray[0].inputvalue+']');

									//Date Parameter fields replaced with a parameter related to the field selection
									var regExpString = '!!<'+p.scriptid+'>!';
									var regExpParam = new RegExp(regExpString,'g');
									var match;
									while ((match = regExpParam.exec(rScript)) != null) {
    								//console.log("match found at " + match.index);
										//console.log(p);
										if(p.includedateagg){
											//We can expect the parameter after the scriptid match to be a parameter from the dateAggList

											var indexEndOfParameter = rScript.indexOf('!',match.index+regExpString.length);
											//console.log(indexEndOfParameter);
											var parameterName = rScript.substring(match.index+regExpString.length,indexEndOfParameter);
											//console.log(parameterName);

											//Get Date Agg Items
											$scope.input.dateAggList.forEach(function(entry){
												console.log(entry);
												if(p.itemArray[0].dateaggvalue == entry.level){
													//Then check the
													//console.log('Match with: ' + entry.level);
													//console.log(entry[parameterName]);
													var replaceString = regExpString + parameterName + '!';
													//console.log(replaceString);
													rScript = rScript.replace(replaceString,entry[parameterName]);
												}
											});
										}
									}

									if(p.includeinfunction){
										p.itemArray.forEach(function(i){
											var e = p.itemArray.indexOf(i) + 1;
											if(qParams != ''){
												qParams = qParams + ', ';
											}
											var expressionvalue = '';
											if(p.includeagg){
												expressionvalue = i.aggvalue + '([' + i.inputvalue + '])';
											}else{
												expressionvalue = '[' + i.inputvalue + ']';
											}
											if(e == 1) e = '';
											qParams = qParams + expressionvalue + ' as ' + p.scriptid + e;
										});
									}

								});

								var output = t.qlikfunction + '(\'' + rScript + '\',' + qParams + ')';

								t.outCode = output;
								return true;
							}else{
								return true; //Not Enabled is no reason to fail
							}
						};

						/* Native date functions */
						$scope.nativeDateTemplate = function(t){
							t.outCode = null;

							if(t.enabled){
								var output = '';
								//Would be better with a match, but looping for the moment!
								$scope.input.uiarray.forEach(function(p){
									if(p.scriptid == t.idForDate){
										//output = p.dateaggvalue + '([' + p.inputvalue + '])';
										output = '[' + p.itemArray[0].inputvalue + ']';
									}
								});
								t.outCode = output;
								return true;
							}else{
								return true; //Not Enabled is no reason to fail
							}

						};

						/* Native field functions */
						$scope.nativeFieldTemplate = function(t){
							t.outCode = null;

							if(t.enabled){
								var output = '';
								//Would be better with a match, but looping for the moment!
								$scope.input.uiarray.forEach(function(p){
									if(p.scriptid == t.idForField){
										output = '[' + p.itemArray[0].inputvalue + ']';
									}
								});
								t.outCode = output;
								return true;
							}else{
								return true; //Not Enabled is no reason to fail
							}
						};

						/* Native Aggregation functions */
						$scope.nativeFieldAggTemplate = function(t){
							t.outCode = null;
							var complete = true;
							if(t.enabled){

								var output = '';
								//Would be better with a match, but looping for the moment!
								$scope.input.uiarray.forEach(function(p){
									if(p.scriptid == t.idForField){
										if(!p.itemArray[0].aggvalue) complete = false;
										if(!p.itemArray[0].inputvalue) complete = false;
										output = p.itemArray[0].aggvalue + '([' + p.itemArray[0].inputvalue + '])';
									}
								});
								t.outCode = output;
							}
							//console.log(complete);
							return complete;
						};

						$scope.processButtonClick = function(){
							switch ($scope.input.buttonState) {
								case 0: //Preview Master Items
									if($scope.previewMasterItems()){
										$scope.input.buttonState = 1;
										$scope.input.buttonTitle = 'Create Master Items';
										$scope.input.buttonIcon = 'library';
										$scope.input.warningMessage = '';
									}
									break;
								case 1:
									if($scope.createMasterItems()){
										$scope.input.buttonState = 2;
										$scope.input.buttonTitle = 'Reset Expression Builder';
										$scope.input.buttonIcon = 'back';
										$scope.input.warningMessage = '';
									}
									break;
								case 2:
									if($scope.resetWizard()){
										$scope.input.buttonState = 0;
										$scope.input.buttonTitle = 'Preview Master Items';
										$scope.input.buttonIcon = 'view';
										$scope.input.warningMessage = '';
									}
									break;
							}
							document.getElementById("scrollBody").scrollTop = 0;
						};

						$scope.processBackClick = function(){
							$scope.make_tab_active(1);
							$scope.input.buttonState = 0;
							$scope.input.buttonTitle = 'Preview Master Items';
							$scope.input.buttonIcon = 'view';
							$scope.input.warningMessage = '';

							document.getElementById("scrollBody").scrollTop = 0;
						};

						$scope.resetWizard = function(){
							//console.log("Reset Wizard");
							$scope.input.selectedKey = '';
							$scope.input.wizardName = '';
							$scope.input.showKey = false;
							$scope.input.selectedMethod= null;
							$scope.input.uiarray = null;
							$scope.input.codeTemplates = null;
							$scope.input.vizTemplates = null;
							$scope.input.variableTemplates = null;
							$scope.input.vizDisabled = false;
							$scope.input.isLoading = false,
							$scope.input.enableVizBuild = true,
							$scope.input.previewEnabled = false,
							$scope.make_tab_active(1);
							return true;
						}

						/* Preview Master Items function, will complete each template so has to
						be called even if preview on screen is not required */
						$scope.previewMasterItems = function(){
							if($scope.completeTemplates()){
								$scope.input.previewEnabled = true;
								$scope.make_tab_active(2);
								return true;
							}else{
								//Need to do something here to notify of the failure
								//console.log("Validation Check Fail");
								$scope.input.warningMessage = "Complete all required parameters";
								return false;
							}
						};

						/* Create Master Items */
						$scope.createMasterItems = function(){

							if($scope.previewMasterItems()){
								var p = [];
								$scope.input.codeTemplates.forEach(function(t){
									//console.log(t.outCode);
									if(t.type.toUpperCase() == 'DIMENSION'){
										var a = $scope.createDimension(t);
										p.push(a);
									}
									if(t.type.toUpperCase() == 'MEASURE'){
										var a = $scope.createMeasure(t);
										p.push(a);
									}
								});

								if($scope.input.variableTemplates){
									$scope.input.variableTemplates.forEach(function(t){
										//console.log("Create Variable");
										var a = $scope.createVariable(t);
										p.push(a);
									});
								};

								/* Only process after all promises have competed */
								Promise.all(p).then(values => {
									//console.log($scope.input.dimList);
									//console.log($scope.input.measureList);
									if($scope.input.vizTemplates){
										if(!$scope.input.vizDisabled){
											$scope.input.vizTemplates.forEach(function(v){
												$scope.createMasterViz(v);
											});
										}
									}
								});
								return true;
							}else{
								//do something to say there was an error
								return false;
							}
						};

						/* Create Dimension */
						$scope.createDimension = function(t){
							var dimJSON =
							{
								qInfo: {
									qType: "dimension"
								},
								qDim: {
									qGrouping: "N",
									qFieldDefs: [
										t.outCode
									],
									qFieldLabels: [
										t.displayName
									],
									title:t.displayName
								},
								qMetaDef: {
									title:t.displayName,
									description:t.description,
									tags:[]
								}
							};

							return $scope.input.appModel.createDimension(dimJSON).then((data) => {
								var obj = {templateId:t.id,qixId:data.id};
								$scope.input.idList.push(obj);
								t.built = true;
							});
						};

						/* Create Measure */
						$scope.createMeasure = function(t){
							var mesJSON =
							{
								qInfo: {
									qType: "measure"
								},
								qMeasure: {
									qLabel:t.displayName,
									qGrouping: "N",
									qDef: t.outCode,
									qExpressions:[],
									qActiveExpression: 0
								},
								qMetaDef: {
									title:t.displayName,
									description:t.description,
									tags:[]
								}
							};

							return $scope.input.appModel.createMeasure(mesJSON).then((data) => {
								var obj = {templateId:t.id,qixId:data.id};
								$scope.input.idList.push(obj);
								t.built = true;
							});
						};

						/* Create Master Visualization */
						$scope.createMasterViz = function(aeVizTemplate){
							//console.log('Create Viz');
							if(aeVizTemplate.type){
								$.getJSON('../extensions/AAIExpressionBuilder/templates/' + aeVizTemplate.type + '.json', function(response){
									var vizJSON = response;

									vizJSON.qMetaDef.title = aeVizTemplate.displayTitle;
									vizJSON.qMetaDef.description = aeVizTemplate.description;

									aeVizTemplate.replacements.forEach(function(r){
										$scope.input.idList.forEach(function(vid){
											if(vid.templateId == r.template){
												var obj = $scope.objectByString(vizJSON, r.path);
												obj[r.key] = vid.qixId;
											}
										});
									});
									$scope.input.appModel.createObject(vizJSON).then((data) => {console.log('Create Viz'); console.log(data);});
								});
							}
						};

						/* Create Variable */
						$scope.createVariable = function(variableTemplate){
							//console.log('Create Variable');
							if(variableTemplate.enabled){
								var app = qlik.currApp(this);
								app.variable.getContent(variableTemplate.name).then(
								function(data){
									//console.log('Check Variable');
									//console.log(data);
									variableTemplate.built = 'exists';
								}, function(e){
									//console.log('Variable does not exist, create variable');
									app.variable.create({
										qName : variableTemplate.name,
										qDefinition : variableTemplate.definition,
										qComment : variableTemplate.description
									}).then((data) => {
										//console.log('Created Variable');
										//console.log(data);
										variableTemplate.built = 'created';
									});
								});
							}
						};

					}]
				});
			}
		}]
	};
});
