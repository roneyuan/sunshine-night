/**
 * Create the chart when all data is loaded
 * @returns {undefined}
 */
function createChart(data) {
    console.log(data);
    Highcharts.stockChart('chartDemoContainer', {

        rangeSelector: {
            selected: 3 // Select default range like 3m 6m or 12m
        },

        yAxis: {

            // Setup labels on the right
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },

            // Setup 0 point line
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },

        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true // Show graph on the bottom
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2, // decimal point
            split: true
        },

        series: [data] // This is where the data store
    });
}





function getNewsDataFromApi(searchTerm, callback) {
    var URL = "https://api.nytimes.com/svc/topstories/v2/home.json";

    var query = {
        section: "business",
        format: "jsonp",
        callback: displayNewsData
    }
    $.getJSON(URL, query, callback);  
}




var callMarkitOnDemandApi = function(searchTerm, callback) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; // Has to be jsonp in order to display data

    // Does not work using $.getJSON. It needs to use $.ajax
    $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: callback,
        error: callback
    });
}


var callMarkitOnDemandChartApi = function(searchTerm, callback) {
    var MARKITONDEMAND_CHART_URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp";
    var params = {
        parameters: JSON.stringify(            
        { Normalized: false,
            NumberOfDays: 180,
            DataPeriod: "Day",
            Elements: [
                {
                    Symbol: "IBM",
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                },
                {
                    Symbol: "IBM",
                    Type: "volume"
                }
            ]} )
    }

    $.ajax({
        data: params,
        url: MARKITONDEMAND_CHART_URL,
        dataType: "jsonp",
        context: this,
        success: function(json){
            //Catch errors
            if (!json || json.Message){
                console.error("Error: ", json.Message);
                return;
            }
            disaplyChart(json);
        },
        error: function(response,txtStatus){
            console.log(response,txtStatus)
        }


    });
}

var callNewYorkTimesApi = function(searTerm, callback) {
    var url = "https://api.nytimes.com/svc/topstories/v2/business.json";
    url += '?' + $.param({
        'api-key': "01c5c546907941af9428ba53d9625c9b",
    }); 
    $.ajax({
        url: url,
        method: 'GET'
    }).done(function(result) {
        callback(result)
    }).fail(function(err) {
       throw err;
    });
}

function businessTopStoriesCallback(data) {
    console.log(data)
}
var callGuardianApi = function() {

}

var displayStockData1 = function(data) {
    var res = 0;
    
    stockQuote[res].Change = data.Change,
    stockQuote[res].ChangePercent = data.ChangePercent,
    stockQuote[res].ChangePercentYTD = data.ChangePercentYTD,
    stockQuote[res].ChangeYTD = data.ChangeYTD,
    stockQuote[res].High = data.High,
    stockQuote[res].LastPrice = data.LastPrice,
    stockQuote[res].Low = data.Low,
    stockQuote[res].MSDate = data.MSDate,
    stockQuote[res].MarketCap = data.MarketCap,
    stockQuote[res].Name = data.Name,
    stockQuote[res].Open = data.Open,
    stockQuote[res].Status = data.Status,
    stockQuote[res].Symbol = data.Symbol,
    stockQuote[res].Timestamp = data.Timestamp,
    stockQuote[res].Volume = data.Volume

    //console.log(stockQuote[0]);

    for (key in stockQuote[res]) {
        $('#stock1').append(`<div class="col-3">${stockQuote[res][key]}</div>`);
    }
}

var displayStockData2 = function(data) {
    var res = 1;
    
    stockQuote[res].Change = data.Change,
    stockQuote[res].ChangePercent = data.ChangePercent,
    stockQuote[res].ChangePercentYTD = data.ChangePercentYTD,
    stockQuote[res].ChangeYTD = data.ChangeYTD,
    stockQuote[res].High = data.High,
    stockQuote[res].LastPrice = data.LastPrice,
    stockQuote[res].Low = data.Low,
    stockQuote[res].MSDate = data.MSDate,
    stockQuote[res].MarketCap = data.MarketCap,
    stockQuote[res].Name = data.Name,
    stockQuote[res].Open = data.Open,
    stockQuote[res].Status = data.Status,
    stockQuote[res].Symbol = data.Symbol,
    stockQuote[res].Timestamp = data.Timestamp,
    stockQuote[res].Volume = data.Volume

    //console.log(stockQuote[1]);
    for (key in stockQuote[res]) {
        $('#stock2').append(`<div class="col-3">${stockQuote[res][key]}</div>`);
    }
}


function disaplyChart(data) {
    //console.log(data);

    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?',    function (data2) {
        var seriesOptions = {
            name: "AAPL",
            data: data2
        };
        createChart(seriesOptions);
    });

}

var displayNewsData = function(data) {
    //var res = data.responseText;
    console.log(data.results[1]);

}

var displayGuardianData = function(data) {

}


var callGlassdoorApi = function(searchTerm, callback) {
    var GLASSDOOR_URL = 'https://api.glassdoor.com/api/api.htm';

    var query = {
        v: 1,
        format: 'json',
        't.p':"119004",
        't.k': "gHME7vA2tRw",
        userip:"0.0.0.0",
        useragent:"Mozilla",
        callback:displayGlassdoorData,
        action: "employers",
        q: searchTerm
    }
    $.getJSON(GLASSDOOR_URL, query, callback);
}

function displayGlassdoorData(data) {
    console.log(data);
}

// Button one click
$(".stock1").on('click', function(event) {
    event.preventDefault();

    var search1 = $('#firstSearch').val();
    callMarkitOnDemandApi(search1, displayStockData1);
    //marketDataExample2();
    callNewYorkTimesApi(search1, displayNewsData);
    callMarkitOnDemandChartApi(search1, disaplyChart);
    //callGlassdoorApi(search1, displayGlassdoorData);   
})

$(".stock2").on('click', function(event) {
    event.preventDefault();

    var search2 = $('#secondSearch').val();
    callMarkitOnDemandApi(search2, displayStockData2) 
})




