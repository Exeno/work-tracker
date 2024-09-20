var tasks = [];
var materials = [];
var entries = [];
var workSegments = [];

// Load entries from LocalStorage on page load
window.onload = function() {
    if (localStorage.getItem('entries')) {
        entries = JSON.parse(localStorage.getItem('entries'));
        updateEntries(); // Update existing entries if needed
        displayEntries();
    }
};

function toggleLunchDuration() {
    var tookLunch = document.getElementById('tookLunch').value;
    var lunchDurationContainer = document.getElementById('lunchDurationContainer');
    if (tookLunch === 'yes') {
        lunchDurationContainer.style.display = 'block';
    } else {
        lunchDurationContainer.style.display = 'none';
    }
}

function addTask() {
    var taskDescription = document.getElementById('taskDescription').value.trim();
    if (taskDescription) {
        tasks.push(taskDescription);
        document.getElementById('taskDescription').value = '';
        displayTasks();
    }
}

function displayTasks() {
    var tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    for (var i = 0; i < tasks.length; i++) {
        (function(index) {
            var task = tasks[index];
            var li = document.createElement('li');
            li.textContent = task;
            li.appendChild(createDeleteButton(function() {
                tasks.splice(index, 1);
                displayTasks();
            }));
            tasksList.appendChild(li);
        })(i);
    }
}

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

function displayMaterials() {
    var materialsList = document.getElementById('materialsList');
    materialsList.innerHTML = '';
    for (var i = 0; i < materials.length; i++) {
        (function(index) {
            var material = materials[index];
            var li = document.createElement('li');
            li.textContent = material.name + ': ' + material.quantity;
            li.appendChild(createDeleteButton(function() {
                materials.splice(index, 1);
                displayMaterials();
            }));
            materialsList.appendChild(li);
        })(i);
    }
}

function addWorkSegment() {
    var workType = document.getElementById('workType').value;
    var segmentStartTime = document.getElementById('segmentStartTime').value;
    var segmentEndTime = document.getElementById('segmentEndTime').value;

    if (!segmentStartTime || !segmentEndTime) {
        alert('Please enter both start and end times for the work segment.');
        return;
    }

    // Validate that end time is after start time
    var duration = calculateWorkDuration(segmentStartTime, segmentEndTime, 0);
    if (duration < 0) {
        alert('End time must be after start time.');
        return;
    }

    workSegments.push({
        workType: workType,
        startTime: segmentStartTime,
        endTime: segmentEndTime,
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
        (function(index) {
            var segment = workSegments[index];
            var li = document.createElement('li');
            li.textContent = segment.workType.toUpperCase() + ': ' + segment.startTime + ' - ' + segment.endTime;
            li.appendChild(createDeleteButton(function() {
                workSegments.splice(index, 1);
                displayWorkSegments();
            }));
            workSegmentsList.appendChild(li);
        })(i);
    }
}

function saveEntry() {
    var date = document.getElementById('date').value;
    var projectName = document.getElementById('projectName').value.trim();
    var clientName = document.getElementById('clientName').value.trim();
    var notes = document.getElementById('notes').value.trim();
    var tookLunch = document.getElementById('tookLunch').value;
    var lunchDuration = 0;
    var hourlyRate = parseFloat(document.getElementById('hourlyRate').value);

    if (tookLunch === 'yes') {
        lunchDuration = parseInt(document.getElementById('lunchDuration').value);
        if (isNaN(lunchDuration) || lunchDuration <= 0 || lunchDuration > 180) {
            alert('Please enter a valid lunch duration (1-180 minutes).');
            return;
        }
    }

    if (!date || !projectName || !clientName) {
        alert('Please fill in all required fields.');
        return;
    }

    if (workSegments.length === 0) {
        alert('Please add at least one work segment.');
        return;
    }

    // Calculate total work time in hours
    var totalWorkDuration = 0;
    var shopDuration = 0;
    var jobsiteDuration = 0;

    for (var i = 0; i < workSegments.length; i++) {
        var segment = workSegments[i];
        if (segment.workType === 'shop') {
            shopDuration += segment.duration;
        } else if (segment.workType === 'jobsite') {
            jobsiteDuration += segment.duration;
        }
    }

    totalWorkDuration = shopDuration + jobsiteDuration;
    totalWorkDuration -= lunchDuration / 60;

    if (totalWorkDuration < 0) {
        alert('Total work duration cannot be negative after subtracting lunch.');
        return;
    }

    var earnings = 0;
    if (!isNaN(hourlyRate) && hourlyRate > 0) {
        earnings = totalWorkDuration * hourlyRate;
    }

    var entry = {
        id: Date.now(),
        date: date,
        tookLunch: tookLunch,
        lunchDuration: lunchDuration,
        projectName: projectName,
        clientName: clientName,
        notes: notes,
        hourlyRate: hourlyRate,
        workSegments: JSON.parse(JSON.stringify(workSegments)),
        tasks: tasks.slice(),
        materials: materials.slice(),
        totalWorkDuration: totalWorkDuration,
        shopDuration: shopDuration,
        jobsiteDuration: jobsiteDuration,
        earnings: earnings
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
        (function(index) {
            var entry = entries[index];
            var entryDiv = document.createElement('div');
            entryDiv.className = 'entry-item';

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'entry-checkbox';
            entryDiv.appendChild(checkbox);

            var h3 = document.createElement('h3');
            h3.textContent = 'Project: ' + entry.projectName;
            entryDiv.appendChild(h3);

            var clientP = document.createElement('p');
            clientP.textContent = 'Client: ' + entry.clientName;
            entryDiv.appendChild(clientP);

            var dateP = document.createElement('p');
            dateP.textContent = 'Date: ' + entry.date;
            entryDiv.appendChild(dateP);

            var hourlyRateP = document.createElement('p');
            hourlyRateP.textContent = 'Hourly Rate: $' + entry.hourlyRate.toFixed(2);
            entryDiv.appendChild(hourlyRateP);

            if (entry.tookLunch === 'yes') {
                var lunchP = document.createElement('p');
                lunchP.textContent = 'Lunch Break: ' + entry.lunchDuration + ' minutes';
                entryDiv.appendChild(lunchP);
            }

            var totalWorkP = document.createElement('p');
            totalWorkP.className = 'total-work-time';
            totalWorkP.textContent = 'Total Work Time: ' + entry.totalWorkDuration.toFixed(2) + ' hours';
            entryDiv.appendChild(totalWorkP);

            var shopWorkP = document.createElement('p');
            shopWorkP.textContent = 'SHOP Time: ' + entry.shopDuration.toFixed(2) + ' hours';
            entryDiv.appendChild(shopWorkP);

            var jobsiteWorkP = document.createElement('p');
            jobsiteWorkP.textContent = 'JOB SITE Time: ' + entry.jobsiteDuration.toFixed(2) + ' hours';
            entryDiv.appendChild(jobsiteWorkP);

            var earningsP = document.createElement('p');
            earningsP.textContent = 'Earnings: $' + entry.earnings.toFixed(2);
            entryDiv.appendChild(earningsP);

            if (entry.notes) {
                var notesP = document.createElement('p');
                notesP.textContent = 'Notes: ' + entry.notes;
                entryDiv.appendChild(notesP);
            }

            // Display work segments
            var segmentsH4 = document.createElement('h4');
            segmentsH4.textContent = 'Work Segments:';
            entryDiv.appendChild(segmentsH4);

            var segmentsUl = document.createElement('ul');
            segmentsUl.className = 'work-segments';
            for (var j = 0; j < entry.workSegments.length; j++) {
                var segment = entry.workSegments[j];
                var li = document.createElement('li');
                li.textContent = segment.workType.toUpperCase() + ': ' + segment.startTime + ' - ' + segment.endTime;
                segmentsUl.appendChild(li);
            }
            entryDiv.appendChild(segmentsUl);

            if (entry.tasks.length > 0) {
                var tasksH4 = document.createElement('h4');
                tasksH4.textContent = 'Tasks:';
                entryDiv.appendChild(tasksH4);

                var tasksUl = document.createElement('ul');
                tasksUl.className = 'tasks';
                for (var j = 0; j < entry.tasks.length; j++) {
                    var li = document.createElement('li');
                    li.textContent = entry.tasks[j];
                    tasksUl.appendChild(li);
                }
                entryDiv.appendChild(tasksUl);
            }

            if (entry.materials.length > 0) {
                var materialsH4 = document.createElement('h4');
                materialsH4.textContent = 'Materials:';
                entryDiv.appendChild(materialsH4);

                var materialsUl = document.createElement('ul');
                for (var k = 0; k < entry.materials.length; k++) {
                    var material = entry.materials[k];
                    var li = document.createElement('li');
                    li.textContent = material.name + ': ' + material.quantity;
                    materialsUl.appendChild(li);
                }
                entryDiv.appendChild(materialsUl);
            }

            // Edit and Delete Buttons Container
            var buttonsDiv = document.createElement('div');
            buttonsDiv.style.display = 'flex';
            buttonsDiv.style.justifyContent = 'space-between';
            buttonsDiv.style.marginTop = '10px';

            var editBtn = document.createElement('button');
            editBtn.className = 'button';
            editBtn.textContent = 'Edit Entry';
            editBtn.style.width = '48%';
            editBtn.onclick = function() {
                editEntry(index);
            };
            buttonsDiv.appendChild(editBtn);

            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'button delete';
            deleteBtn.textContent = 'Delete Entry';
            deleteBtn.style.width = '48%';
            deleteBtn.onclick = function() {
                if (confirm('Are you sure you want to delete this entry?')) {
                    entries.splice(index, 1);
                    saveEntriesToLocalStorage();
                    displayEntries();
                }
            };
            buttonsDiv.appendChild(deleteBtn);

            entryDiv.appendChild(buttonsDiv);

            entriesContainer.appendChild(entryDiv);
        })(i);
    }
}

function sendEmail() {
    var email = document.getElementById('emailAddress').value;
    if (!email) {
        alert('Please enter a valid email address.');
        return;
    }

    var selectedEntries = [];
    var checkboxes = document.querySelectorAll('.entry-checkbox');
    checkboxes.forEach(function(checkbox, index) {
        if (checkbox.checked) {
            selectedEntries.push(entries[index]);
        }
    });

    if (selectedEntries.length === 0) {
        alert('Please select at least one entry to send.');
        return;
    }

    var emailContent = formatEntriesForEmail(selectedEntries);
    window.open('mailto:' + email + '?subject=Work Entries&body=' + encodeURIComponent(emailContent));
}

function formatEntriesForEmail(entries) {
    var content = 'Here are the selected work entries:\n\n';
    entries.forEach(function(entry) {
        content += 'Project: ' + entry.projectName + '\n';
        content += 'Client: ' + entry.clientName + '\n';
        content += 'Date: ' + entry.date + '\n';
        content += 'Total Work Time: ' + entry.totalWorkDuration.toFixed(2) + ' hours\n';
        if (entry.earnings) {
            content += 'Earnings: $' + entry.earnings.toFixed(2) + '\n';
        }
        content += 'Tasks: ' + entry.tasks.join(', ') + '\n';
        content += 'Materials: ' + entry.materials.map(material => material.name + ' (Qty: ' + material.quantity + ')').join(', ') + '\n';
        content += 'Notes: ' + entry.notes + '\n';
        content += '--------------------------\n';
    });
    return content;
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('hourlyRate').value = '';
    document.getElementById('tookLunch').value = 'no';
    toggleLunchDuration();
    document.getElementById('lunchDuration').value = '30';
    document.getElementById('projectName').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('notes').value = '';
    workSegments = [];
    displayWorkSegments();
    tasks = [];
    materials = [];
    displayTasks();
    displayMaterials();
}

function saveEntriesToLocalStorage() {
    localStorage.setItem('entries', JSON.stringify(entries));
}

function createDeleteButton(onClick) {
    var btn = document.createElement('button');
    btn.textContent = 'X';
    btn.className = 'button delete';
    btn.style.marginLeft = '10px';
    btn.style.width = 'auto';
    btn.onclick = onClick;
    return btn;
}

function calculateWorkDuration(startTime, endTime, lunchDuration) {
    var start = parseTime(startTime);
    var end = parseTime(endTime);
    var duration = (end - start) / (1000 * 60); // Duration in minutes

    if (duration <= 0) {
        return -1; // Error: end time is before start time
    }

    duration -= lunchDuration;
    if (duration < 0) {
        return -1; // Error: lunch duration exceeds work duration
    }

    return duration / 60; // Return duration in hours
}

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

// Function to update existing entries (for backward compatibility)
function updateEntries() {
    for (var i = 0; i < entries.length; i++) {
        if (typeof entries[i].totalWorkDuration === 'undefined') {
            entries[i].totalWorkDuration = 0;
        }
        if (typeof entries[i].earnings === 'undefined') {
            entries[i].earnings = 0;
        }
        if (typeof entries[i].shopDuration === 'undefined') {
            entries[i].shopDuration = 0;
        }
        if (typeof entries[i].jobsiteDuration === 'undefined') {
            entries[i].jobsiteDuration = 0;
        }
        if (typeof entries[i].notes === 'undefined') {
            entries[i].notes = '';
        }
    }
    saveEntriesToLocalStorage();
}

// Function to clear all entries
function clearAllEntries() {
    if (confirm('Are you sure you want to delete all entries?')) {
        entries = [];
        saveEntriesToLocalStorage();
        displayEntries();
    }
}

// Function to edit an entry
function editEntry(index) {
    var entry = entries[index];
    // Populate the form with the entry's data
    document.getElementById('date').value = entry.date;
    document.getElementById('hourlyRate').value = entry.hourlyRate;
    document.getElementById('tookLunch').value = entry.tookLunch;
    toggleLunchDuration();
    document.getElementById('lunchDuration').value = entry.lunchDuration || 30;
    document.getElementById('projectName').value = entry.projectName;
    document.getElementById('clientName').value = entry.clientName;
    document.getElementById('notes').value = entry.notes;
    workSegments = JSON.parse(JSON.stringify(entry.workSegments));
    displayWorkSegments();
    tasks = entry.tasks.slice();
    materials = entry.materials.slice();
    displayTasks();
    displayMaterials();

    // Remove the entry being edited
    entries.splice(index, 1);
    saveEntriesToLocalStorage();
    displayEntries();
}
