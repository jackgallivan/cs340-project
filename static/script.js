document.addEventListener("DOMContentLoaded", bindButtons);

// BUTTON BINDINGS (ON PAGE LOAD)

function bindAdd(btn) {
    
    btn.addEventListener("click", function(event) {
        console.log(event);
        addRow()
        event.preventDefault;
        }
    );
}

function bindDelete(btn) {
    
    btn.addEventListener("click", function(event) {
        console.log(event);
        deleteRow(event);
        event.preventDefault;
        }
    );
}

function bindEdit(btn) {
    
    btn.addEventListener("click", function(event) {
        console.log(event);
        makeEditable(event);
        event.preventDefault;
        }
    );
}

function bindSubmitEdit(btn) {
    btn.addEventListener("click", function(event) {
        console.log(event);
        submitEdit(event);
        event.preventDefault;
        }
    );
}

function bindCancelEdit(btn, originalContent) {
    btn.addEventListener("click", function(event) {
        console.log(event);
        cancelEdit(event, originalContent);
        event.preventDefault;
        }
    );
}

function bindButtons() {
    // let add = document.getElementById("add");
    // bindAdd(add);

    let del = document.getElementsByName("del");
    for (let d of del) {
        bindDelete(d);
    }
    
    let edit = document.getElementsByName("edit");
    for (let e of edit) {
        bindEdit(e);
    }
    
}

// REQUEST HANDLERS

function addRow() {

    // get data out of the form and add to an object
    let workoutData = {};
    let name = document.getElementById("add-name").value;
    let reps = document.getElementById("add-reps").value;
    let weight = document.getElementById("add-weight").value;
    let date = document.getElementById("add-date").value;
    let units = document.getElementById("add-units").value;

    workoutData.name = name;
    workoutData.reps = reps;
    workoutData.weight = weight;
    workoutData.date = date;
    workoutData.units = units;
    if (units == "lbs") {
        workoutData.lbs = 1;
    } else {workoutData.lbs = 0;}

    // Open up a request and send to the app
    let req = new XMLHttpRequest();
    url = ''
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status < 400) {
            console.log(req.responseText);
            workoutData.id = JSON.parse(req.responseText)['id'];
            addToTable(workoutData);
        } else {
            console.log("looks like an error happened");
        }
    });

    req.send(JSON.stringify(workoutData));
}  

function submitEdit(event) {
    // buttons are nested in <td> which is in a <tr>
    let row = event.target.parentElement.parentElement;
    let workoutId = row.id;
    let workout = document.getElementById(workoutId);

    let body = {};
    body['id'] = workoutId;
    for (let element of workout.children) {
        if (element.firstElementChild.tagName == "INPUT") {
            let name = element.firstElementChild.getAttribute('name');
            let value = element.firstElementChild.value;
            body[name] = value;
        }     
    }

    // Open up a request and send to the app
    let req = new XMLHttpRequest();
    url = ''
    req.open('PUT', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status < 400) {
            console.log(req.responseText);
            cancelEdit(event);
        } else {
            console.log("looks like an error happened");
            cancelEdit(event, body);
        }
    });
    req.send(JSON.stringify(body));
}

function deleteRow(event) {
    // buttons are nested in <td> which is in a <tr>
    let row = event.target.parentElement.parentElement;
    let workoutId = row.id;

    // Open up a request and send to the app
    let req = new XMLHttpRequest();
    url = ''
    req.open('DELETE', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status < 400) {
            console.log(req.responseText);
            removeFromTable(workoutId);
        } else {
            console.log("looks like an error happened");
        }
    });

    req.send(JSON.stringify({'id': workoutId}));

}

// UI HANDLERS

function addToTable(workoutData) {
    // present the data as a new row in the table
    let table = document.getElementById("workout-table");
    newWorkout = document.createElement("tr");
    for (let data in workoutData) {

        if (data == 'id') {
            newWorkout.id = workoutData[data];
        }
        else if (data != 'lbs') {
            let td = document.createElement('td');
            td.setAttribute('name', data);
            td.innerText = workoutData[data];
            newWorkout.appendChild(td);
        }
    }

    let edit = document.createElement('td');
    let del = document.createElement('td');
    let editBtn = document.createElement('button');
    let delBtn = document.createElement('button');

    editBtn.name = "edit";
    delBtn.name = "del";
    editBtn.textContent = "Edit";
    delBtn.textContent = "Delete";

    bindEdit(editBtn);
    bindDelete(delBtn);

    edit.appendChild(editBtn);
    del.appendChild(delBtn);

    newWorkout.appendChild(edit);
    newWorkout.appendChild(del);
    
    table.appendChild(newWorkout);
}

function removeFromTable(workoutId) {
    // pass in the id of the table row to be removed. 
    let tbody = document.getElementById("workout-table");
    let workout = document.getElementById(workoutId);
    tbody.removeChild(workout);
}

function makeEditable(event) {
    // buttons are nested in <td> which is in a <tr>
    let row = event.target.parentElement.parentElement;
    let workoutId = row.id;

    let originalContent = {};

    let workout = document.getElementById(workoutId);
    for (let child of workout.children) {
        if (!child.firstElementChild) {
            let field = document.createElement('input');
            field.name = child.getAttribute('name');
            if (child.getAttribute('name') == 'date') {
                field.type = "date";
                field.value = child.textContent;
            } else {
                field.type = "text";
                field.value = child.textContent;
            }
            
            originalContent[field.name] = field.value;
            child.textContent = '';
            child.appendChild(field);  
                  

        } else if (child.firstElementChild.name == "edit") {
            let submitBtn = document.createElement('button');
            submitBtn.name = "submit";
            submitBtn.textContent = "Submit";
            bindSubmitEdit(submitBtn);

            child.replaceChild(submitBtn, child.firstElementChild);

        } else if (child.firstElementChild.name == "del") {
            let cancelBtn = document.createElement('button');
            cancelBtn.name = 'cancel';
            cancelBtn.textContent = "Cancel";
            bindCancelEdit(cancelBtn, originalContent);

            child.replaceChild(cancelBtn, child.firstElementChild);
        }
    }
}

function cancelEdit(event, originalContent) {
    //console.log(originalContent);

    // buttons are nested in <td> which is in a <tr>
    let row = event.target.parentElement.parentElement;
    let workoutId = row.id;
    let workout = document.getElementById(workoutId);

    // cycle through only ELEMENT nodes (given by .children)
    for (let child of workout.children) {
        if (child.firstElementChild.tagName == "INPUT") {
            let content = child.firstChild.value;
            child.removeChild(child.firstElementChild);

            if (originalContent) {
                child.textContent = originalContent[child.getAttribute('name')]
            } else {
                child.textContent = content;     
            }
            

        } else if (child.firstElementChild.name == "submit") {
            let editBtn = document.createElement('button');

            editBtn.name = "edit";
            editBtn.textContent = "Edit";

            bindEdit(editBtn);
            child.replaceChild(editBtn, child.firstElementChild);

        } else if (child.firstElementChild.name == "cancel") {
            let delBtn = document.createElement('button');

            delBtn.name = "del";
            delBtn.textContent = "Delete";

            bindDelete(delBtn);
            child.replaceChild(delBtn, child.firstElementChild);
        }
    }
}
