

var callMarkitOnDemandApi = function(searchTerm, callback) {
    var MARKITONDEMAND_URL = "http://dev.markitondemand.com/Api/v2/Quote/jsonp"; 

    $.ajax({
        data: { symbol: searchTerm },
        url: MARKITONDEMAND_URL,
        dataType: "jsonp",
        success: callback,
        error: handleError
    }); 
}

var displayStockData = function(data) {

    if (data.Status !== "SUCCESS") {
        alert("Unable to find the symbol. Try Use Symbol Finder!"); /* TODO Symbo Finder */
    } else {
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

        stockQuote.forEach(function(element) {
            $('.stockList').append(`<tr class="companyData"><td>${element.Symbol}</td>
                                        <td>${element.High}</td>
                                        <td>${element.Low}</td>
                                        <td>${element.Volume}</td>
                                        <td>${element.MarketCap}</td>
                                        <td>${element.LastPrice}</td>
                                        <td>${element.Name}</td></tr>`);
        });

        callNewYorkTimesApi(stockData.Name, displayStockNews);
    }
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
            searchHistory.push(searchTerm.toUpperCase()); 
            createChart(json);
        },
        error: function(response,txtStatus){
            handleError()
            console.log(response,txtStatus)
        }
    });
}

var createChart = function(data) {
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
        data: dataArray,
        color: "#"+(Math.floor(Math.random()*16777215).toString(16)) //random color, sometimes might be transparent
    };

    stockCharts.push(tempChart);
    displayChart(stockCharts);
}

var displayChart = function(data) {
    Highcharts.stockChart('chartDemoContainer', {

        rangeSelector: {
            selected: 4 // Select default range like 3m 6m or 12m
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
    var today = new Date();
    var year = String(today.getFullYear());
    var month = String(today.getMonth() + 1);
    if (today.getMonth()+1 < 10) { month = "0" + month }
    var day = String(today.getDate());
    if (today.getDate() < 10) { day = "0" + day } 
    var lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    var lastWeekMonth = String(lastWeek.getMonth() + 1);
    if (lastWeek.getMonth()+1 < 10) { lastWeekMonth = "0" + lastWeekMonth }
    var beginDate = String(lastWeek.getFullYear()) + lastWeekMonth + String(lastWeek.getDate());
    var endDate = year + month + day;

    url += '?' + $.param({
        'api-key': "01c5c546907941af9428ba53d9625c9b",
        'q': searchTerm,
        'begin_date': beginDate, // today - 7 days
        'end_date': endDate  // today
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
        article: data.response.docs,
    }

    stockNews.push(news);
    console.log(stockNews);
    $('.newsFrame').remove();
    $('.companyNewsName').remove();

    let title = "";
    let imageUrl = "";
    let newsContent = "";

    stockNews.forEach(function(stockElement) {
        $('#newsRow').append(`<div class="col-12 companyNewsName">${stockElement.company}</div>`)
        stockElement['article'].forEach(function(newsElement) {
            if (newsElement.headline.main.length > 90) {
                title = newsElement.headline.main.substring(0,89) + "...";
            } else {
                title = newsElement.headline.main;
            }

            if (newsElement.multimedia.length > 2) {
                imageUrl = "http://nytimes.com/" + newsElement.multimedia[2].url;
                newsContent = `<div class="col-12 newsFrame">                         
                                    <a target="_blank" href="${newsElement.web_url}">
                                        <div class="news">
                                            <div class="col-4 newsImage"><img src="${imageUrl}" alt="" /></div>
                                            <div class="col-8 newsTitle"><div class="newsButton">
                                            <div class="title">${title}</div>
                                            <p>
                                            <div class="paragraph">${newsElement.lead_paragraph}</div>
                                            </div></div>
                                        </div>
                                    </a>
                                </div>`
            } else {
                imageUrl = "";
                newsContent = `<div class="col-12 newsFrame">                         
                                    <a target="_blank" href="${newsElement.web_url}">
                                        <div class="news">
                                            <div class="col-12 newsTitle"><div class="newsButtonNoImage">
                                            <div class="title">${title}</div>
                                            <p>
                                            <div class="paragraph">${newsElement.lead_paragraph}</div>
                                            </div></div>
                                        </div>
                                    </a>
                                </div>`
            }

            $('#newsRow').append(newsContent);
        })               
    });
}

var handleError = function() {
    alert("Oops! This is a free version, which only allows 2 API calls in 10 seconds."); 
}

/*CORS Issue with Glassdoor*/
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

$(".addStock").on('click', function(event) {
    event.preventDefault();
    var searchStock = $('#search').val();
    $('#search').val('');

    var unifiedSearchTerm = searchStock.toUpperCase();

    if (searchHistory.includes(unifiedSearchTerm)) {
        alert("You have added " + searchStock);
    } else {
        //searchHistory.push(unifiedSearchTerm); // When the API call and push. Not here. Or do it with promise, success and failure.
        callMarkitOnDemandApi(searchStock, displayStockData);      
        callMarkitOnDemandChartApi(searchStock, createChart);    
    }
});

// Better Style. Put () outside
(function(){
    displayChart([0]);
})()





