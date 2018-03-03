const currentLocation = window.location.hostname;
//const socket = io.connect('http://localhost:8031');
const socket = io.connect('http://192.168.0.223:8001');
const export_url = 'http://'+ currentLocation + '/synergix-pos/export/ae_result.php';
const time = document.getElementById('timeDiv');
let chart_ae; // global

function requestData() {
	socket.emit('mon-job-department', {});
	socket.emit('mon-call-type', {});
}

function timestampHome() {
	let date;
	date = new Date();
	
	time.innerHTML = date.toLocaleTimeString();
}

function resizeChart() {
	let chart_el = document.getElementsByClassName('chart')[0];
	chart_el.style.width = '100%';
	chart_ae.setSize(chart_el.offsetWidth-40,chart_el.offsetHeight-40,true);
}

function connectAnimation() {
	let overlay, errorOverlay, disconnectOverlay, connectOverlay;
	let errorStatus = false, disconnectStatus = false;		
	
	socket.on('disconnect', function(reason) {
		disconnectStatus = true;
		disconnectOverlay = iosOverlay({
			text: 'Disconnected',
			icon: './img/cross.png'
		});
	});
	
	socket.on('reconnect', function() {
		//requestData();
		
		if (errorStatus) {
			errorStatus = false;
			errorOverlay.hide();
		}
		
		if (disconnectStatus) {
			disconnectStatus = false;
			disconnectOverlay.hide();
		}
		
		connectOverlay = iosOverlay({
			text: 'Connected',
			duration: 2000,
			icon: './img/check.png'
		});
	});
}

function aeResult() {
	socket.on('total-mon-job-department', function(data) {
		let seriesLength;	
		data = JSON.parse(data);
		
		if (data !== null && typeof data === 'object') {			
			let id = [];
			let regional = [];
			let total = [];
			let success = [];
			let unsuccess = [];
			let followUp = [];
			
			for (var i = 0, len = data.length; i < len; i++) {
				regional.push(data[i].regional);
				total.push(data[i].total);
				success.push(data[i].success);
				unsuccess.push(data[i].unsuccess);
				followUp.push(data[i].follow_up);
			}
			
			seriesLength = chart_ae.series.length;
			
			if (seriesLength > 0) {
				for(var i = seriesLength -1; i > -1; i--) {
					chart_ae.series[i].remove();
				}
			}
		
			chart_ae.addSeries({name:'Success', data: success}, false);
			chart_ae.addSeries({name:'Unsuccess', data: unsuccess}, false);
			chart_ae.addSeries({name:'Follow up', data: followUp}, false);
			chart_ae.xAxis[0].setCategories(regional);
			chart_ae.redraw();
			
			resizeChart();
		}
	});
}

$(function() {
	if (time) {
		setInterval(timestampHome, 1000);
	}
	
	connectAnimation();
	requestData();
	$('[data-toggle="tooltip"]').tooltip();
	
	let preventKey = [61, 107, 173, 109, 187, 189];

	document.addEventListener('keydown', function(event) {	
		if (event.ctrlKey == true && preventKey.indexOf(event.which) >= 0) {
			event.preventDefault();
		}
	});
	
	document.addEventListener('wheel', function(event) {
		if (event.ctrlKey == true) {
			event.preventDefault();
		}
	});

	chart_ae = Highcharts.chart('container-bar', {
		chart: {
			type: 'column',
			backgroundColor:'rgba(255, 255, 255, 0.0)',
			events: {
				load: aeResult
			}
		},
		
		title: {
			text: ''
		},
		
		subtitle: {
			text: ''
		},
		
		credits: { 
			enabled: false 
		},
		
		xAxis: {
			type: 'regional',
			labels: {
				//rotation: -45,
				style: {
					fontSize: '13px',
					fontFamily: 'Verdana, sans-serif',
					fontWeight: 'bolder'
				}
			}
		},
		
		yAxis: {
			min: 0,
			title: {
				text: 'Total'
			}
		},
		
		exporting: {
			buttons: {
				contextButton: {
					menuItems: [
						{
							text: 'Export to Excel',
							onclick: function() {
								 window.location = export_url;
							}
						}
					]
				}
			}
		}
	});
					
	window.addEventListener('resize', function() {
		resizeChart();
	});
});
