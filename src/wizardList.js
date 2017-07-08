//Placeholder Format: ##<scriptid>##

define( [], function () {
	'use strict';
	return [
		{
			index:0,
			name:'Hello World',
			status:'live',
			config:'helloworld'
		},
		{
			index:1,
			name:'K-means Cluster',
			status:'live',
			config:'kmeanscluster'
		},
		{
			index:2,
			name:'Time Series Decomposition',
			status:'live',
			config:'timeseriesdecomposition'
		},
		{
			index:3,
			name:'Linear Regression',
			status:'live',
			config:'linearregression'
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
