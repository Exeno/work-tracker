var entries = [];
var workSegments = [];
var tasks = [];
var materials = [];
var checkInTime = null;

// Load entries from LocalStorage on page load
window.onload = function() {
    if (localStorage.getItem('entries')) {
        entries = JSON.parse(localStorage.getItem('entries'));
        displayEntries();
    }
};

// "Check In" function to start a work segment
function checkIn() {
    checkInTime = new Date();
    document.getElementById('checkInButton').style.display = 'none';
    document.getElementById('checkOutButton').style.display = 'inline-block';
}

// "Check Out" function to end a work segment and store it
function checkOut() {
    var checkOutTime = new Date();
    var workType = document.getElementById('workType').value;

    var startTime = formatTime(checkInTime);
    var endTime = formatTime(checkOutTime);

    var duration = calculateWorkDuration(checkInTime, checkOutTime);

    workSegments.push({
        workType: workType,
        startTime: startTime,
        endTime: endTime,
        duration: duration
    });

    displayWorkSegments();

    // Reset check in/out buttons
    document.getElementById('checkInButton').style.display = 'inline-block';
    document.getElementById('checkOutButton').style.display = 'none';
    checkInTime = null;
}

// Add work segment manually
function addWorkSegment() {
    var workType = document.getElementById('workType').value;
    var startTime = document.getElementById('segmentStartTime').value;
    var endTime = document.getElementById('segmentEndTime').value;

    if (!startTime || !endTime) {
        alert('Please enter both start and end times for the work segment.');
        return;
    }

    var duration = calculateManualWorkDuration(startTime, endTime);
    if (duration < 0) {
        alert('End time must be after start time.');
        return;
    }

    workSegments.push({
        workType: workType,
        startTime: startTime,
        endTime: endTime,
        duration: duration
    });

    displayWorkSegments();

    // Clear input fields
    document.getElementById('segmentStartTime').value = '';
    document.getElementById('segmentEndTime').value = '';
}

function displayWorkSegments() {
    var workSegmentsList = document.getElementById('workSegmentsList');
    workSegmentsList.innerHTML = '';
    for (var i = 0; i < workSegments.length; i++) {
        var segment = workSegments[i];
        var li = document.createElement('li');
        li.textContent = segment.workType.toUpperCase() + ': ' + segment.startTime + ' - ' + segment.endTime + ' (' + segment.duration + ' hours)';
        workSegmentsList.appendChild(li);
    }
}

function formatTime(date) {
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
}

function calculateWorkDuration(start, end) {
    var duration = (end - start) / (1000 * 60 * 60); // Convert from ms to hours
    return duration.toFixed(2);
}

function calculateManualWorkDuration(startTime, endTime) {
    var start = parseTime(startTime);
    var end = parseTime(endTime);
    return (end - start) / (1000 * 60 * 60); // Convert from ms to hours
}

function parseTime(timeString) {
    var parts = timeString.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
}

// Rest of the code for tasks, materials, saveEntry, etc.
// Keeping the same functions like addTask, addMaterial, saveEntry, etc.

function saveEntry() {
    var date = document.getElementById('date').value;
    var projectName = document.getElementById('projectName').value.trim();
    var clientName = document.getElementById('clientName').value.trim();
    var notes = document.getElementById('notes').value.trim();

    if (!date || !projectName || !clientName) {
        alert('Please fill in all required fields.');
        return;
    }

    var entry = {
        id: Date.now(),
        date: date,
        projectName: projectName,
        clientName: clientName,
        notes: notes,
        workSegments: workSegments.slice(),
        tasks: tasks.slice(),
        materials: materials.slice(),
    };

    entries.push(entry);
    saveEntriesToLocalStorage();
    displayEntries();
    clearForm();
}

function displayEntries() {
    var entriesContainer = document.getElementById('entriesContainer');
    entriesContainer.innerHTML = '';
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'entry-checkbox';
        checkbox.value = entry.id;
        entryDiv.appendChild(checkbox);

        var h3 = document.createElement('h3');
        h3.textContent = 'Project: ' + entry.projectName;
        entryDiv.appendChild(h3);

        var clientP = document.createElement('p');
        clientP.textContent = 'Work Code: ' + entry.clientName;
        entryDiv.appendChild(clientP);

        var dateP = document.createElement('p');
        dateP.textContent = 'Date: ' + entry.date;
        entryDiv.appendChild(dateP);

        if (entry.notes) {
            var notesP = document.createElement('p');
            notesP.textContent = 'Notes: ' + entry.notes;
            entryDiv.appendChild(notesP);
        }

        var segmentsH4 = document.createElement('h4');
        segmentsH4.textContent = 'Work Segments:';
        entryDiv.appendChild(segmentsH4);

        var segmentsUl = document.createElement('ul');
        for (var j = 0; j < entry.workSegments.length; j++) {
            var segment = entry.workSegments[j];
            var li = document.createElement('li');
            li.textContent = segment.workType.toUpperCase() + ': ' + segment.startTime + ' - ' + segment.endTime + ' (' + segment.duration + ' hours)';
            segmentsUl.appendChild(li);
        }
        entryDiv.appendChild(segmentsUl);

        entriesContainer.appendChild(entryDiv);
    }
}

// Additional functions for tasks, materials, etc.

function saveEntriesToLocalStorage() {
    localStorage.setItem('entries', JSON.stringify(entries));
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('projectName').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('notes').value = '';
    workSegments = [];
    tasks = [];
    materials = [];
    displayWorkSegments();
    displayTasks();
    displayMaterials();
}

function clearAllEntries() {
    if (confirm('Are you sure you want to delete all entries?')) {
        entries = [];
        saveEntriesToLocalStorage();
        displayEntries();
    }
}
