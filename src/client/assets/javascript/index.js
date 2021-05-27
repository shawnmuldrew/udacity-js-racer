// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	track_segments: undefined,
	tracks: undefined,
	racers: undefined
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		await getTracks()
			.then(tracks => {
				store.tracks = tracks
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		await getRacers()
			.then((racers) => {
				store.racers = racers
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	const track = store.tracks.filter(track => track.id.toString() === store.track_id)
	renderAt('#race', renderRaceStartView(track[0]))

	// TODO - Get player_id and track_id from the store
	const player_id = store.player_id
	const track_id = store.track_id
	// const race = TODO - invoke the API call to create the race, then save the result
	const race = await createRace(player_id, track_id)
	// TODO - update the store with the race id
	store.race_id = (race.ID-1).toString()
	console.log(store)
	// Get the segments for the track for this race - will use to show race graphically
	store.track_segments = (store.tracks.find(track => track.id.toString() === track_id)).segments.length
	// The race has been created, now start the countdowns
	// TODO - call the async function runCountdown
	await runCountdown()
	// TODO - call the async function startRace
	await startRace(store.race_id)
	// TODO - call the async function runRace
	await runRace(store.race_id)
}

async function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
		let raceInterval = setInterval(() => {
			getRace(raceID)
				.then((raceInfo) => {
					if (raceInfo.status === 'in-progress') {
							/* 
								TODO - if the race info status property is "in-progress", update the leaderboard by calling:
								renderAt('#leaderBoard', raceProgress(res.positions))
							*/
						renderAt('#leaderBoard', raceProgress(raceInfo.positions))
					}
					else if (raceInfo.status === 'finished') {
							/* 
								TODO - if the race info status property is "finished", run the following:
								clearInterval(raceInterval) // to stop the interval from repeating
								renderAt('#race', resultsView(res.positions)) // to render the results view
								resolve(res) // resolve the promise
							*/
						clearInterval(raceInterval) // to stop the interval from repeating
						renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
						resolve(raceInfo)
					}
				})
				.catch((err) => console.log(err))
			}, 500)
	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			let timerSecond = setInterval(() => {
				--timer
			// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = timer
			// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if (timer === 0) {
					clearInterval(timerSecond)
					resolve(true)
				}
			}, 1000)

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected racer", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = target.id
}

function handleSelectTrack(target) {
	console.log("selected track", target.id)
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id
}

async function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	await accelerate(store.race_id)
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')
	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name} = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))  // Converted to integer
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1
	//console.log(positions)

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h4>${count++} - ${p.driver_name}</h4>
				</td>
			</tr>
		`
	})

	
	// let car1_segment = (positions.find(position => position.id === 1)).segment.toString()
	// let car2_segment = (positions.find(position => position.id === 2)).segment.toString()
	// console.log(car1_segment)
	// console.log(car2_segment)
	// const car_images = 
	// 	`
	// 		<style> span#car1 {padding-left:${car1_segment}px;} </style>
	// 		<style> span#car2 {padding-left:${car2_segment}px;} </style>
	// 		<style> span.finish {position: absolute; left: 240px;} </style>
	// 		<table>
	// 			<tr>
	// 				<td>
	// 					<span>|</span><span id="car1">Car1</span><span class="finish">|</span>
	// 				</td>
	// 			</tr>				
	// 			<tr>
	// 				<td>
	// 					<span>|</span><span id="car2">Car2</span><span class="finish">|</span>
	// 				</td>
	// 			</tr>				
	// 		</table>
	// 	`

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
			<h3>Race Track</h3>
			<style> section#raceTrackImage {position: relative; width: 250px;} </style>
			<section id="raceTrackImage">
				${renderCars(positions)}
			</section>
		</main>
	`
}

function renderCars(raceState) {
		let styleSection = `<style> span.finish {position: absolute; left: ${store.track_segments+40}px;} </style>`
		let raceSection = '<table>'
	raceState.forEach(car => {
		styleSection += `<style> span#car${car.id} {padding-left:${car.segment}px;} </style>`
		raceSection += `<tr>
											<td>
												<span>|</span><span id="car${car.id}">Cacar${car.id}</span><span class="finish">|</span>
											</td>
										</tr>	`
	})
	raceSection += '</table>'
	return styleSection + raceSection
}


function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
	.then(res => res.json())
	.catch(err => console.log(err))
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
	.then(res => res.json())
	.catch(err => console.log(err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(error => console.log("Problem with createRace request:", error))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
	.then(res => res.json())
	.catch(err => console.log(err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.catch(error => console.log("Problem with startRace request:", error))
}

// POST request to `${SERVER}/api/races/${id}/accelerate`
// options parameter provided as defaultFetchOpts
// no body or datatype needed for this request
function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.catch(error => console.log("Problem with accelerate request:", error))
}
