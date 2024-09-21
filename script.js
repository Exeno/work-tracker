// Initialize arrays to hold entries, work segments, tasks, and materials
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

    // Auto-populate date with today's date
    document.getElementById('date').value = getTodayDate();
};

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

    if (duration <= 0) {
        alert('End time must be after start time.');
        return;
    }

    workSegments.push({
        workType: workType,
        startTime: startTime,
        endTime: endTime,
        duration: duration.toFixed(2)
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
    if (duration <= 0) {
        alert('End time must be after start time.');
        return;
    }

    workSegments.push({
        workType: workType,
        startTime: startTime,
        endTime: endTime,
        duration: duration.toFixed(2)
    });

    displayWorkSegments();

    // Clear input fields
    document.getElementById('segmentStartTime').value = '';
    document.getElementById('segmentEndTime').value = '';
}

// Display work segments in the list
function displayWorkSegments() {
    var workSegmentsList = document.getElementById('workSegmentsList');
    workSegmentsList.innerHTML = '';
    for (var i = 0; i < workSegments.length; i++) {
        var segment = workSegments[i];
        var li = document.createElement('li');
        li.textContent = `${capitalize(segment.workType)}: ${segment.startTime} - ${segment.endTime} (${segment.duration} hours)`;
        workSegmentsList.appendChild(li);
    }
}

// Function to capitalize the first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format time to HH:MM
function formatTime(date) {
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Calculate duration between two Date objects in hours
function calculateWorkDuration(start, end) {
    var duration = (end - start) / (1000 * 60 * 60); // Convert ms to hours
    return duration;
}

// Calculate duration from manual input times in hours
function calculateManualWorkDuration(startTime, endTime) {
    var start = parseTime(startTime);
    var end = parseTime(endTime);
    return (end - start) / (1000 * 60 * 60); // Convert ms to hours
}

// Parse time string (HH:MM) to Date object
function parseTime(timeString) {
    var parts = timeString.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

// Add a task
function addTask() {
    var taskDescription = document.getElementById('taskDescription').value.trim();
    if (taskDescription) {
        tasks.push(taskDescription);
        document.getElementById('taskDescription').value = '';
        displayTasks();
    }
}

// Display tasks in the list
function displayTasks() {
    var tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    for (var i = 0; i < tasks.length; i++) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.textContent = tasks[i];
        var deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.onclick = (function(index) {
            return function() {
                tasks.splice(index, 1);
                displayTasks();
            }
        })(i);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        tasksList.appendChild(li);
    }
}

// Add a material
function addMaterial() {
    var materialName = document.getElementById('materialName').value.trim();
    var materialQuantity = parseInt(document.getElementById('materialQuantity').value);
    if (materialName && materialQuantity > 0) {
        materials.push({ name: materialName, quantity: materialQuantity });
        document.getElementById('materialName').value = '';
        document.getElementById('materialQuantity').value = '';
        displayMaterials();
    }
}

// Display materials in the list
function displayMaterials() {
    var materialsList = document.getElementById('materialsList');
    materialsList.innerHTML = '';
    for (var i = 0; i < materials.length; i++) {
        var li = document.createElement('li');
        var span = document.createElement('span');
        span.textContent = `${materials[i].name} (Qty: ${materials[i].quantity})`;
        var deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.onclick = (function(index) {
            return function() {
                materials.splice(index, 1);
                displayMaterials();
            }
        })(i);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        materialsList.appendChild(li);
    }
}

// Save a work entry
function saveEntry() {
    var date = document.getElementById('date').value;
    var projectName = document.getElementById('projectName').value.trim();
    var workCode = document.getElementById('workCode').value.trim();
    var notes = document.getElementById('notes').value.trim();

    // Validation
    if (!date || !projectName || !workCode.match(/^#\d{4}$/)) {
        alert('Please fill in all required fields with valid data.\nWork Code must start with # followed by 4 numbers.');
        return;
    }

    var entry = {
        id: Date.now(),
        date: date,
        projectName: projectName,
        workCode: workCode,
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

// Display all work entries
function displayEntries() {
    var entriesContainer = document.getElementById('entriesContainer');
    entriesContainer.innerHTML = '';
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';

        // Checkbox for selection
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'entry-checkbox';
        checkbox.value = entry.id;
        entryDiv.appendChild(checkbox);

        // Project Name
        var h3 = document.createElement('h3');
        h3.textContent = 'Project: ' + entry.projectName;
        entryDiv.appendChild(h3);

        // Work Code
        var workCodeP = document.createElement('p');
        workCodeP.textContent = 'Work Code: ' + entry.workCode;
        entryDiv.appendChild(workCodeP);

        // Date
        var dateP = document.createElement('p');
        dateP.textContent = 'Date: ' + entry.date;
        entryDiv.appendChild(dateP);

        // Notes
        if (entry.notes) {
            var notesP = document.createElement('p');
            notesP.textContent = 'Notes: ' + entry.notes;
            entryDiv.appendChild(notesP);
        }

        // Work Segments
        if (entry.workSegments.length > 0) {
            var segmentsH4 = document.createElement('h4');
            segmentsH4.textContent = 'Work Segments:';
            entryDiv.appendChild(segmentsH4);

            var segmentsUl = document.createElement('ul');
            segmentsUl.className = 'work-segments-list';
            for (var j = 0; j < entry.workSegments.length; j++) {
                var segment = entry.workSegments[j];
                var li = document.createElement('li');
                li.textContent = `${capitalize(segment.workType)}: ${segment.startTime} - ${segment.endTime} (${segment.duration} hours)`;
                segmentsUl.appendChild(li);
            }
            entryDiv.appendChild(segmentsUl);
        }

        // Tasks
        if (entry.tasks.length > 0) {
            var tasksH4 = document.createElement('h4');
            tasksH4.textContent = 'Tasks:';
            entryDiv.appendChild(tasksH4);

            var tasksUl = document.createElement('ul');
            tasksUl.className = 'tasks-list';
            for (var j = 0; j < entry.tasks.length; j++) {
                var task = entry.tasks[j];
                var li = document.createElement('li');
                li.textContent = task;
                tasksUl.appendChild(li);
            }
            entryDiv.appendChild(tasksUl);
        }

        // Materials
        if (entry.materials.length > 0) {
            var materialsH4 = document.createElement('h4');
            materialsH4.textContent = 'Materials:';
            entryDiv.appendChild(materialsH4);

            var materialsUl = document.createElement('ul');
            materialsUl.className = 'materials-list';
            for (var j = 0; j < entry.materials.length; j++) {
                var material = entry.materials[j];
                var li = document.createElement('li');
                li.textContent = `${material.name} (Qty: ${material.quantity})`;
                materialsUl.appendChild(li);
            }
            entryDiv.appendChild(materialsUl);
        }

        // Edit and Delete Buttons
        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons-group-entry';

        var editBtn = document.createElement('button');
        editBtn.className = 'button';
        editBtn.textContent = 'Edit Entry';
        editBtn.style.marginRight = '10px';
        editBtn.onclick = (function(index) {
            return function() {
                editEntry(index);
            }
        })(i);
        buttonsDiv.appendChild(editBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'button delete';
        deleteBtn.textContent = 'Delete Entry';
        deleteBtn.onclick = (function(index) {
            return function() {
                deleteEntry(index);
            }
        })(i);
        buttonsDiv.appendChild(deleteBtn);

        entryDiv.appendChild(buttonsDiv);

        entriesContainer.appendChild(entryDiv);
    }
}

// Edit an entry
function editEntry(index) {
    var entry = entries[index];
    document.getElementById('date').value = entry.date;
    document.getElementById('projectName').value = entry.projectName;
    document.getElementById('workCode').value = entry.workCode;
    document.getElementById('notes').value = entry.notes;

    // Restore work segments, tasks, and materials
    workSegments = entry.workSegments.slice();
    tasks = entry.tasks.slice();
    materials = entry.materials.slice();

    displayWorkSegments();
    displayTasks();
    displayMaterials();

    // Remove the entry being edited
    entries.splice(index, 1);
    saveEntriesToLocalStorage();
    displayEntries();
}

// Delete an entry
function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries.splice(index, 1);
        saveEntriesToLocalStorage();
        displayEntries();
    }
}

// Send selected entries via email
function sendSelectedEntries() {
    var selectedEntries = document.querySelectorAll('.entry-checkbox:checked');
    if (selectedEntries.length === 0) {
        alert('Please select at least one entry to send.');
        return;
    }

    var selectedEntriesData = [];
    selectedEntries.forEach(function(checkbox) {
        var entryId = parseInt(checkbox.value);
        var entry = entries.find(e => e.id === entryId);
        if (entry) {
            selectedEntriesData.push(entry);
        }
    });

    // Compose email content
    var emailContent = selectedEntriesData.map(function(entry) {
        var segments = entry.workSegments.map(function(segment) {
            return `${capitalize(segment.workType)}: ${segment.startTime} - ${segment.endTime} (${segment.duration} hours)`;
        }).join('\n');

        var tasks = entry.tasks.length > 0 ? entry.tasks.join('\n') : 'No tasks';
        var materials = entry.materials.length > 0 ? entry.materials.map(m => `${m.name} (Qty: ${m.quantity})`).join('\n') : 'No materials';
        var notes = entry.notes ? entry.notes : 'No additional notes';

        return `Project: ${entry.projectName}
Work Code: ${entry.workCode}
Date: ${entry.date}
Work Segments:
${segments}
Tasks:
${tasks}
Materials:
${materials}
Notes: ${notes}
`;
    }).join('\n--------------------------\n');

    // Open email client with the composed content
    window.location.href = 'mailto:?subject=Work Entries&body=' + encodeURIComponent(emailContent);
}

// Clear all entries
function clearAllEntries() {
    if (confirm('Are you sure you want to delete all entries?')) {
        entries = [];
        saveEntriesToLocalStorage();
        displayEntries();
    }
}

// Save entries to LocalStorage
function saveEntriesToLocalStorage() {
    localStorage.setItem('entries', JSON.stringify(entries));
}

// Clear the form after saving
function clearForm() {
    document.getElementById('date').value = getTodayDate();
    document.getElementById('projectName').value = '';
    document.getElementById('workCode').value = '';
    document.getElementById('notes').value = '';
    workSegments = [];
    tasks = [];
    materials = [];
    displayWorkSegments();
    displayTasks();
    displayMaterials();

    // Reset Check In/Out buttons
    document.getElementById('checkInButton').style.display = 'inline-block';
    document.getElementById('checkOutButton').style.display = 'none';
}

// Edit a work segment (optional future enhancement)
// Currently, work segments are part of the entry and editing an entry includes all its segments
