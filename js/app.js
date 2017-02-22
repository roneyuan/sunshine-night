
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

var displayStockData = function(data) {
    var stockData = {
        Change: data.Change,
        ChangePercent: data.ChangePercent,
        ChangePercentYTD: data.ChangePercentYTD,
        ChangeYTD: data.ChangeYTD,
        High: data.High,
        LastPrice: data.LastPrice,
        Low: data.Low,
        MSDate: data.MSDate,
        MarketCap: data.MarketCap,
        Name: data.Name,
        Open: data.Open,
        Status: data.Status,
        Symbol: data.Symbol,
        Timestamp: data.Timestamp,
        Volume: data.Volume
    }   

    stockQuote.push(stockData);
    
    $('.companyData').remove();
    // Use foreach loop to create DOM
    stockQuote.forEach(function(element) {
        $('.stock_list').append(`<tr class="companyData"><td>${element.Symbol}</td>
                                    <td>${element.High}</td>
                                    <td>${element.Low}</td>
                                    <td>${element.Volume}</td>
                                    <td>${element.MarketCap}</td>
                                    <td>${element.LastPrice}</td>
                                    <td>${element.Name}</td></tr>`);
    });

    callNewYorkTimesApi(stockData.Name, displayStockNews);
}

var callMarkitOnDemandChartApi = function(searchTerm, callback) {
    var MARKITONDEMAND_CHART_URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp";
    var params = {
        parameters: JSON.stringify({   
            Normalized: false,
            NumberOfDays: 3650,
            DataPeriod: "Day",
            Elements: [
                {
                    Symbol: searchTerm,
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                }
            ]
        })
    }

    $.ajax({
        data: params,
        url: MARKITONDEMAND_CHART_URL,
        dataType: "jsonp",
        context: this,
        success: function(json) {
            if (!json || json.Message){
                console.error("Error: ", json.Message);
                return;
            }
            createChart(json);
        },
        error: function(response,txtStatus){
            console.log(response,txtStatus)
        }
    });
}

var createChart = function(data) {
    // 2d array where inner array respresent ohlc. That data was scatterd over by object.
    var dataArray = [];
    var tempArray = [];

    for (var i = 0; i < data.Elements[0].DataSeries.close.values.length; i++) {
        tempArray = [];
        tempArray.push(Date.parse(data.Dates[i]));
        tempArray.push(data.Elements[0].DataSeries.open.values[i]);
        dataArray.push(tempArray);
    }

    var tempChart = {
        name: data.Elements[0].Symbol,
        data: dataArray
    }

    stockCharts.push(tempChart);
    displayChart(stockCharts);
}

var displayChart = function(data) {
    /*
        TODO: Change color of line
    */
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

        series: data // This is where the data store
    });
}

var callNewYorkTimesApi = function(searchTerm, callback) {
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

    url += '?' + $.param({
        'api-key': "01c5c546907941af9428ba53d9625c9b",
        'q': searchTerm,
        'begin_date': "20161231",
        'end_date': "20170130"
    });

    $.ajax({
        url: url,
        method: 'GET',
    }).done(function(result) {
        callback(result, searchTerm);
    }).fail(function(err) {
        throw err;
    });
}

var displayStockNews = function(data, searchTerm) {
    var news = {
        company: searchTerm,
        article: data.response.docs
    }

    stockNews.push(news);
    $('.news').remove();
    $('.companyNewsName').remove();
    stockNews.forEach(function(stockElement) {
        //console.log(stockElement);
        $('#newsRow').append(`<h2 class="companyNewsName">${stockElement.company}</h2>`)
        stockElement['article'].forEach(function(newsElement) {
            // Put news in DOM
            $('#newsRow').append(`<div class="col-12 news"><a href="${newsElement.web_url}">${newsElement.lead_paragraph}</a></div>`); 
        })               
    });
}

$(".addStock").on('click', function(event) {
    event.preventDefault();
    var searchStock = $('#search').val();
    $('#search').val('');

    // Hit Enter and Search
    // If error, should show try again.

    callMarkitOnDemandApi(searchStock, displayStockData);
    callMarkitOnDemandChartApi(searchStock, createChart); 
});

// Create initial state 
// difference between IIFE?
$(function() {
    displayChart([0]);
})


// Use map or foreach function to replace for loop
// Avoid using for loop
// for loop might freeze up...

// When we get question about challenges
// Trying to figure to good story to tell people. Every day story happened
// Interesting problems you solved. When something happen, interesting way to solve

// Recorder interesting problems you solved




