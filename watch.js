// mandala.js, Rob Campbell, 2023, GPL 3

// 2D graphics canvas, context, and center point - for clock's hands
var canvas;
var ctx;
var ctrX;
var ctrY;

// Computed styles and options
var clockStyle = Object();
var outerRingHeight;
var innerRingsOffset;
var boolDisplayHrsMinHands
var boolDisplaySecondHand

// Calendar texts  
var day_abbrev;
var month_01_06;
var month_07_12;

function startUp() {
    // Function called on page load
    getTextsForLanguage();
    getComputedStyles();
    
    test();

    // drawCalendar();
    // getCanvasAndContext()
    // drawClockNumerals();
    // tick();  // Start clock running
}

function tick() {
    now = new Date();
    document.getElementById('zulu').innerHTML = now.toISOString();  // Show Zulu time for debugging  
    drawClockHands(now);  // Get updated date & time
    // TODO Update calendar if needed
    setTimeout(tick, 1000);  // Call this function again in 1000ms
}

function calcHeight(ring) {
    return (7 - ring) * innerRingsOffset * 2 + (outerRingHeight / 2) + 'px';
}

function drawClockHands(now) {

    function drawHand(style, angle) {

        // NOTE "height" is actuall radius
        let outX = (parseInt(style.height) * Math.sin(angle));
        let outY = (parseInt(style.height) * Math.cos(angle));

        // Circle and end of hand
        ctx.beginPath();
        ctx.arc(ctrX + outX, ctrY + outY, parseInt(style.width) / 2.3, 0, 2 * Math.PI);
        ctx.fillStyle = style.color;
        ctx.fill();

        // Hand itself
        ctx.strokeStyle = style.color;
        ctx.beginPath();
        ctx.moveTo(ctrX, ctrY);
        ctx.lineTo(ctrX + outX, ctrY + outY);
        ctx.lineWidth = parseInt(style.width);
        ctx.stroke();
    }

    // Adjust canvas if window resized
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctrX = (canvas.width / 2 | 0) + clockHorzAdj; 
    ctrY = (canvas.height / 2 | 0) + clockVertAdj; 

    // Clear existing hands
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Minute 
    var mins = now.getMinutes();

    // Hour    
    var hrs = now.getHours();
    hrs = hrs > 12 ? hrs - 12 : hrs;
    var prev = hrs === 0 ? 11 : hrs - 1;    
    document.getElementById('hours'+prev).classList.remove('currentHour');        
    document.getElementById('hours'+hrs).classList.add('currentHour');    

    // Second 
    var secs = now.getSeconds();
    var prev = secs < 1 ? 59 : secs - 1;
    var prevTxt = prev % 5 === 0 ? prev.toString() : "'";
    document.getElementById('sixty'+prev).textContent = prevTxt;    
    document.getElementById('sixty'+secs).textContent = secs.toString();    

    // Display hands?
    
    if (boolDisplaySecondHand !== 0) {
        secs = secs > 30 ? secs - 30 : secs + 30;   // TODO Why        
        drawHand(clockStyle.secHand, (secs / 60) * -2 * Math.PI);
    }

    if (boolDisplayHrsMinHands !== 0) {
        hrs += now.getMinutes() / 60.0;  // Advance slightly based on minute 

        // TODO Why is this logic needed?
        mins = mins > 30 ? mins - 30 : mins + 30;   
        hrs = hrs > 6 ? hrs - 6 : hrs + 6;   

        drawHand(clockStyle.minHand, (mins / 60) * -2 * Math.PI);
        drawHand(clockStyle.hrsHand, (hrs / 12) * -2 * Math.PI);

        // Center circle
        ctx.beginPath();
        ctx.arc(ctrX, ctrY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "lightgray";
        ctx.fill();
    }
        
    // TODO Advance calendar at midnight

    // TODO Show phase of moon? Dawn? Dusk? - based on loc?
}

function test() {

    function ringSector(value, ringNum, degrees, textStyle, borderStyle=null) {

        // Create item to hold text
        var item = document.createElement('span');
        item.classList.add('rotatable', textStyle);  
        item.textContent = value.toString();
        item.setAttribute('id', 'ring' + ringNum + 'text' + value);

        if (borderStyle !== null) {

            // Add border
            item.classList.add('border');  
            item.classList.add(borderStyle);  

            // Create container to hold text item w/border 
            var container = document.createElement('span');
            container.classList.add('rotatable');
            container.setAttribute('id', 'ring' + ringNum + 'container' + value);
            container.appendChild(item);

            item = container;  // Continer is new outer element for placement
        }

        // Place item in ring
        item.style.transform = 'rotate(' + degrees + 'deg)';
        item.style.height = calcHeight(ringNum); 
        document.getElementById('ring' + ringNum).appendChild(item);
    }

    var ring = 0;

    // Years of century 
    for (i = 1001; i <= 1100; i++) {
        // ringSector((i+1).toString().slice(2,4), ring, i * (360 / 100), 'text_color');
        ringSector('\u25A0', ring, i * (360 / 100), 'text_color'); 
    }
    ring += 1;

    // Seasons
    seasonStr = '                    Winter                    ' +
                '                    Spring                    ' +
                '                    Summer                    ' +
                '                    Autumn                    '; 
    for (i = 0; i < seasonStr.length; i++) {
        ringSector(seasonStr[i], ring, i * (360 / seasonStr.length), 'text_color'); 
    }
    ring += 1;

    // Month names
    monthStr =         'ember       January        February         March           April            May      ' +
                '     June           July          August         September        October         November   ' +        
                '   Dec';
    for (i = 0; i < monthStr.length; i++) {
        ringSector(monthStr[i], ring, i * (360 / monthStr.length), 'text_color'); 
    }
    ring += 1;

    // // Week numbers
    // for (i = 0; i < 52; i++) {
    //     ringSector(i+1, ring, i * (360 / 52), 'text_color'); 
    // }
    // ring += 1;

    // Days of nonth
    for (i = 0; i < 31; i++) {
        ringSector(i+1, ring, i * (360 / 31), 'text_color', 'border_color'); 
    }
    ring += 1;

    // Day of week
    dayStr =           'nday              Monday             Tuesday     ' +
             '       Wednesday            Thursday           Friday      ' + 
             '       Saturday     ' +
             '       Su';
    for (i = 0; i < dayStr.length; i++) {
        ringSector(dayStr[i], ring, i * (360 / dayStr.length), 'text_color'); 
    }
    ring += 1;

    // // Minutes & seconds
    // for (i = 0; i < 60; i++) {
    //     ringSector(i < 10 ? '0' + i : i, ring, i * (360 / 60), 'text_color'); 
    // }
    // ring += 1;

    // Minutes & seconds
    for (i = 0; i < 60; i++) {    
        ringSector(i % 5 === 0 ? '\u25BC' : '|', ring, i * (360 / 60), 'text_color'); 
    }
    ring += 1;

    // 12 hours
    for (i = 0; i < 12; i++) {
        ringSector(i == 0 ? 12 : i, ring, i * (360 / 12), 'text_color'); 
    }
    ring += 1;

    // 24 hours
    for (i = 13; i <= 24; i++) {
        ringSector(i, ring, i * (360 / 12), 'text_color'); 
    }
    ring += 1;
}

function drawCalendar() {
    drawYearAndMonthNames();


    if (week < 52) {
        // Week number  
        let sec = document.createElement('span');
        sec.classList.add('txt', 'weekNumber');
        sec.style.transform = 'rotate(' + (week * (360 / 52)) + 'deg)';
        sec.style.height = (outerRingHeight / 2) + 'px';
        sec.textContent = (week + 1).toString();
        document.getElementById('week').appendChild(sec);
    }
}

function drawYearAndMonthNames() {
    // Display year and month names in outside ring
    var now = new Date();
    var yearText = '' + now.getFullYear();
    var outerText = yearText[2] + yearText[3] + month_01_06 + month_07_12 + yearText[0] + yearText[1];

    moNum = 0;

    for (i = 0; i < outerText.length; i++) {
        let sector = document.createElement('span');
        sector.style.transform = 'rotate(' + i * (360 / outerText.length) + 'deg)';
        sector.style.height = outerRingHeight + 'px';
        sector.textContent = outerText[i];

        if (i < 2 || i > outerText.length - 3) {
            // Year digit
            sector.classList.add('txt', 'year');
        }
        else {
            sector.classList.add('txt', 'mo' + moNum + 'name');

            if (moNum === now.getMonth()) {
                // Show off current month name and number
                sector.classList.add('txt', 'txtCurrentMonth');  
            }

            if (outerText[i] == '|') {
                // advance to next month number
                moNum += 1;
                sector.textContent = ' ';
            }
        }

        document.getElementById('outerRing').appendChild(sector);
    }
}

function getTextsForLanguage() {
    if (navigator.language.startsWith("en")) {
        day_abbrev = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
        month_01_06 = '   January  |  February  |   March    |   April     |    May    |   June       |';  // NOTE spacing
        month_07_12 = '    July    |   August   |  September   |   October  |  November  |  December   ';  // NOTE spacing
    }
    else {
        // TODO String values for other languages
    }
}

function getComputedStyles() {
    // Set style values (globals)

    function computeStyle(className) {
        var dummy = document.createElement('div');
        dummy.classList.add(className);
        dummy.style.display = 'none';
        document.body.appendChild(dummy);
        var style = getComputedStyle(dummy);
        return style;
    }

    clockStyle.secHand = computeStyle('secHand');
    clockStyle.minHand = computeStyle('minHand');
    clockStyle.hrsHand = computeStyle('hrsHand');

    rootStyles = getComputedStyle(document.documentElement);
    outerRingHeight = parseFloat(rootStyles.getPropertyValue('--outerRingHeight'));
    innerRingsOffset = parseFloat(rootStyles.getPropertyValue('--innerRingsOffset'));
    clockHorzAdj = parseInt(rootStyles.getPropertyValue('--clockHorzAdj'));
    clockVertAdj = parseInt(rootStyles.getPropertyValue('--clockVertAdj'));
    boolDisplaySecondHand = parseInt(rootStyles.getPropertyValue('--boolDisplaySecondHand'));
    boolDisplayHrsMinHands = parseInt(rootStyles.getPropertyValue('--boolDisplayHrsMinHands'));
}

function getCanvasAndContext() {
    // Set canvas and context (globals)
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
}