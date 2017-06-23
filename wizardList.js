//Placeholder Format: ##<scriptid>##

define( [], function () {
	'use strict';
	return [
		{
			index:0,
			name:'Hello World',
			parameters:[
				{
					index:0,
					type:'fieldselect',
					tag:'$numeric',
					includeinfunction:true,
					scriptid:'numeric1',
					name:'Numeric Field'
				}
			],
			templates:[
				{
					id:'0',
					name:'Hello World',
					type:'Measure',
					description:'Sample R expressions built using R Wizard',
					scriptType:'r',
					qlikfunction:'R.ScriptAggr',
					rscript:'sum(na.omit(q$##<numeric1>##))'
				}
			],
			viz:[
				{
					id:'0',
					type:'kpi',
					vizicon:'kpi',
					title:'R Calculated Sum - KPI',
					description:'KPI Object containing an R aggregation of the source data',
					replacements:[
						{template:'0',path:'qHyperCubeDef.qMeasures[0]',key:'qLibraryId'}
					]

				}
			]

		},
		{
			index:1,
			name:'Holt Winters Forecast',
			parameters:[
				{
					index:0,
					type:'fieldselect',
					tag:'$date',
					includedateagg:true,
					includeinfunction:false,
					scriptid:'date1',
					name:'Date Field'
				},
				{
					index:1,
					type:'fieldselect',
					tag:'$numeric',
					includeagg:true,
					includeinfunction:true,
					scriptid:'agg1',
					name:'Aggregation'
				}
			],
			templates:[
				{
					id:'0',
					type:'Measure',
					name:'Forecast Fitted and Mean',
					description:'Holt Winters Time Series Forecast Measure containing the fitted and mean projection values',
					scriptType:'r',
					qlikfunction:'R.ScriptEval',
					rscript:'library("forecast");crime <- ts(q$timeSeries, start=c($(vMinYear),$(vMinMonth)), frequency=12, end=c($(vMaxYear),$(vMaxMonth)));crimeforecasts <- HoltWinters(crime); crimeforecasts2 <- forecast.HoltWinters(crimeforecasts, h=$(vForecastPeriods));c(crimeforecasts2$fitted, crimeforecasts2$mean);',
					setanalysis:[{
						scriptid:'agg1',
						setmodifier:'{$<##date1## = {"<=$(vForecastEndDate)"}>}'
					}]
				},
				{
					id:'1',
					type:'Dimension',
					name:'Time Series Dimension',
					description:'The time series dimension ',
					scriptType:'nativedate',
					idForDate:'date1'
				}
			]
		},
		{
			index:2,
			name:'K-means Cluster',
			parameters:[
				{
					index:0,
					type:'fieldselect',
					includeinfunction:false,
					scriptid:'dimension',
					name:'Dimension'
				},
				{
					index:1,
					type:'fieldselect',
					tag:'$numeric',
					includeagg:true,
					includeinfunction:true,
					scriptid:'measure1',
					name:'Measure 1'
				},
				{
					index:2,
					type:'fieldselect',
					tag:'$numeric',
					includeagg:true,
					includeinfunction:true,
					scriptid:'measure2',
					name:'Measure 2'
				}
			],
			templates:[
				{
					id:'0',
					type:'Measure',
					name:'K-Means Scatter - Measure 1',
					description:'Measure 1 for K-Means scatter plot',
					scriptType:'nativeagg',
					idForField:'measure1'
				},
				{
					id:'1',
					type:'Measure',
					name:'K-Means Scatter - Measure 2',
					description:'Measure 2 for k-Means scatter plot',
					scriptType:'nativeagg',
					idForField:'measure2'
				},
				{
					id:'2',
					type:'Measure',
					name:'Cluster Number',
					description:'Returns a K-Means cluster number which is best used as a Color By Measure option',
					scriptType:'r',
					qlikfunction:'R.ScriptEval',
					rscript:'clusterdata <- data.frame(q$##<measure1>##,q$##<measure2>##);clusterdata[is.na(clusterdata)] <- 0;set.seed(20); cluster <- kmeans(clusterdata,4,nstart = 20);cluster$cluster;',
				},
				{
					id:'3',
					type:'Dimension',
					name:'Cluster Dimension',
					description:'The field for the clusters',
					scriptType:'nativefield',
					idForField:'dimension'
				}
			],
			viz:[
				{
					id:'0',
					type:'clusterscatter',
					vizicon:'scatter-chart',
					title:'K-Means Cluster - Scatter Plot',
					description:'K-means cluster displayed as a scatter plot',
					replacements:[
						{template:'3',path:'qHyperCubeDef.qDimensions[0]',key:'qLibraryId'},
						{template:'0',path:'qHyperCubeDef.qMeasures[0]',key:'qLibraryId'},
						{template:'1',path:'qHyperCubeDef.qMeasures[1]',key:'qLibraryId'},
						{template:'2',path:'qHyperCubeDef.qDimensions[0].qAttributeExpressions[0]',key:'qLibraryId'},
						{template:'2',path:'color.byMeasureDef',key:'key'}
					]

				}
			]
		}
	]
});

/*R.ScriptEval('
library("forecast");
crime <- ts(q$timeSeries, start=c($(vMinYear),$(vMinMonth)), frequency=12, end=c($(vMaxYear),$(vMaxMonth)));
crimeforecasts <- HoltWinters(crime);
crimeforecasts2 <- forecast.HoltWinters(crimeforecasts, h=$(vForecastPeriods));
c(crimeforecasts2$fitted, crimeforecasts2$mean);
', Sum({$<[Reported Date] = {"<=$(vForecastEndDate)"}>}[Crime Counter]) as timeSeries) */
