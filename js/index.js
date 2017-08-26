$(".addStock").on('click', function(event) {
  event.preventDefault();
  let searchStock = $('#search').val();
  $('#search').val('');

  let unifiedSearchTerm = searchStock.toUpperCase();

  if (stockContainer.checkIfExist(unifiedSearchTerm)) {
    alert("You have added " + unifiedSearchTerm);
  } else {
    callBarchartOnDemandApi(searchStock, displayStockInformation);      
    callMarkitOnDemandChartApi(searchStock, createChart);    
  }
});

(function(){
  callBarchartOnDemandApi("AAPL", displayStockInformation);     
  callMarkitOnDemandChartApi("AAPL", createChart);  
})();