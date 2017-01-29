function getStockDataFromApi(searchTerm, callback) {

}

function getNewsDataFromApi(searchTerm, callback) {

}

function getGlassdoorDataFromApi(searchTerm, callback) {

}

function displayStockData(data) {

}

function displayNewsData(data) {

}

function displayGlassdoorData(data) {
	
}

// Button one click
$(".stock1").on('click', function(event) {
	event.preventDefault();

	var search = $('#one').val();
	getStockDataFromApi(search, displayStockData)
	getNewsDataFromApi(search, displayNewsData)	
	getGlassdoorDataFromApi(search, displayGlassdoorData)	
})

$(".stock2").on('click', function(event) {
	event.preventDefault();

	var search = $('#two').val();
	getStockDataFromApi(search, displayStockData)
	getNewsDataFromApi(search, displayNewsData)	
	getGlassdoorDataFromApi(search, displayGlassdoorData)	
})