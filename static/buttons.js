document.addEventListener('DOMContentLoaded', bindButtons);
document.addEventListener('DOMContentLoaded', getDropdownData);

// BUTTON BINDINGS (ON PAGE LOAD)

function bindAdd(btn) {

    btn.addEventListener('click', function(event) {
        console.log(event);
        addRow(btn)
        event.preventDefault;
        }
    );
}

function bindDelete(btn) {

    btn.addEventListener('click', function(event) {
        console.log(event);
        deleteRow(event);
        event.preventDefault;
        }
    );
}

function bindEdit(btn) {

    btn.addEventListener('click', function(event) {
        console.log(event);
        makeEditable(event);
        event.preventDefault;
        }
    );
}

function bindSubmitEdit(btn) {
    btn.addEventListener('click', function(event) {
        console.log(event);
        submitEdit(event);
        event.preventDefault;
        }
    );
}

function bindCancelEdit(btn, originalContent) {
    btn.addEventListener('click', function(event) {
        console.log(event);
        cancelEdit(event, originalContent);
        event.preventDefault;
        }
    );
}

function bindButtons() {
    let add = document.getElementById('add');
    bindAdd(add);

    let del = document.getElementsByName('del');
    for (let d of del) {
        bindDelete(d);
    }

    let edit = document.getElementsByName('edit');
    for (let e of edit) {
        bindEdit(e);
    }

}

// REQUEST HANDLERS

// NOTE: only edit and cancel edit buttons are working (UI only)
// TO DO:
// - refactor add and delete buttons (UI)
// - eventually need to integrate with our backend

function getDropdownData() {
    // incomplete -- not yet working
    let req = new XMLHttpRequest();
    url = '/get-dropdown-data'
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status < 400) {
            console.log('request successful')
            response = JSON.parse(req.responseText);
            
            console.log(response);
            dropdowns = document.getElementsByTagName('select');
            for (dropdown in dropdowns) {
                dropdownName = dropdowns[dropdown].name;
                console.log(dropdownName);
                if (dropdownName in response) {
                    data = response[dropdownName]
                    console.log(response[dropdownName]);
                    for (option in data) {
                        value = data[option][dropdownName];
                        console.log(data[option][dropdownName]);
                        el = document.createElement('option');
                        el.value = value;
                        el.innerText = value;
                        dropdowns[dropdown].appendChild(el);
                    }
                    // for (option in response[dropdown.name]) {
                    //     console.log(option);
                    // }
                }
            }

            // for (data in response) {
            //     console.log(data, response[data]);
            // }
            // () => {
            //     dropdowns = document.getElementsByTagName('select');
            //     for (el in dropdowns) {
            //         for (option in JSON.parse(req.responseText)[dropdowns[el]]) {
            //             new_option = document.createElement('option');
            //             console.log(option)
            //         }
            //     }
            // }
        } else {
            console.log('looks like an error happened');
        }
    });

    dropdowns = document.getElementsByTagName('select');
    data = [];
    for (el in dropdowns) {
        data.push(dropdowns[el]["name"]);
    }
    // console.log(data)
    // console.log(dropdowns);
    req.send(JSON.stringify(data));

    // req.send(JSON.stringify(location.href.split("/").pop()));
}


function addRow(btn) {

    const rowData = {}

    // Get data elements in the form.
    const formElements = btn.parentNode.querySelectorAll('.add-input')

    // Add the element values to the request body.
    formElements.forEach(element => {
        rowData[element.name] = element.value
    })

    // Open up a request and send to the app
    let req = new XMLHttpRequest();
    url = '/add-data'
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status < 400) {
            console.log(req.responseText);
            rowData.id = JSON.parse(req.responseText)['id'];
            addToTable(rowData);
        } else {
            console.log('looks like an error happened');
        }
    });

    req.send(JSON.stringify(rowData));
}

function submitEdit(event) {
    // buttons are nested in <td> which is in a <tr>
    let tableRow = event.target.parentElement.parentElement;
    let rowId = tableRow.id;
    let row = document.getElementById(rowId);

    let body = {};
    body['id'] = rowId;
    for (let element of row.children) {
        if (element.firstElementChild.tagName == 'INPUT') {
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
            console.log('looks like an error happened');
            cancelEdit(event, body);
        }
    });
    req.send(JSON.stringify(body));
}

function deleteRow(event) {
    // buttons are nested in <td> which is in a <tr>
    let tableRow = event.target.parentElement.parentElement;
    let rowId = tableRow.id;

    // NOTE: No database backend currently set up.
    // Use the below code INSTEAD of directly calling
    // the removeFromTable(rowId) function once
    // backend is live

    removeFromTable(rowId); // Comment me out once backend is live!

    // ** MAKE DB REQUEST ** //
    // // Open up a request and send to the app
    // let req = new XMLHttpRequest();
    // url = ''
    // req.open('DELETE', url, true);
    // req.setRequestHeader('Content-Type', 'application/json');
    // req.addEventListener('load', () => {
    //     if (req.status < 400) {
    //         console.log(req.responseText);
    //         removeFromTable(rowId);
    //     } else {
    //         console.log("looks like an error happened");
    //     }
    // });

    // req.send(JSON.stringify({'id': rowId}));

}

// UI HANDLERS

function addToTable(rowData) {
    // present the data as a new tableRow in the table
    const tbody = document.querySelector('tbody');
    newrow = document.createElement('tr');
    for (let data in rowData) {
        const td = document.createElement('td')
        td.setAttribute('name', data)
        td.innerText = rowData[data]
        if (data == 'id') {
            newrow.id = rowData[data]
            newrow.prepend(td)
        }
        else {
            newrow.append(td);
        }
    }

    const edit = document.createElement('td');
    const del = document.createElement('td');
    const editBtn = document.createElement('button');
    const delBtn = document.createElement('button');

    editBtn.name = 'edit';
    delBtn.name = 'del';
    editBtn.textContent = 'Update';
    delBtn.textContent = 'Delete';

    bindEdit(editBtn);
    bindDelete(delBtn);

    edit.append(editBtn);
    del.append(delBtn);

    newrow.append(edit);
    newrow.append(del);

    tbody.append(newrow);
}

function removeFromTable(rowId) {
    // pass in the id of the table tableRow to be removed.
    let tbody = document.getElementById('data-table');
    let row = document.getElementById(rowId);
    tbody.removeChild(row);
}

function makeEditable(event) {
    // buttons are nested in <td> which is in a <tr>
    let tableRow = event.target.parentElement.parentElement;
    let rowId = tableRow.id;

    let originalContent = {};

    let row = document.getElementById(rowId);
    let exclude = ["deviceID", "locationID", "missionID", "functionID", "operatorID"];
    let dropdowns = ["deviceName", "locationName", "missionName", "operatorName", "functionName"];
    let dropdownExclude = {"devices": "deviceName",
                           "locations": "locationName",
                           "missions": "missionName",
                           "operators": "operatorName",
                           "functions": "functionName"
                           };

    console.log(exclude);
    for (let child of row.children) {
        if (!(exclude.includes(child.getAttribute('name')))) {
            // no inner element means just raw data in the <td>
            if (!child.firstElementChild) {
                console.log(child.getAttribute('name'));

                // the field in question requires a dropdown
                if (dropdowns.includes(child.getAttribute('name'))) {
                    document.getElementsByClassName('')
                    let table = document.getElementById('display-data');
                    
                    if (child.getAttribute('name') != dropdownExclude[table.getAttribute('name')]) {
                    
                        let field = document.createElement('select');
                        field.name = child.getAttribute('name');
                        field.value = value;
                        field.innerText = value;

                        option = document.createElement('option')
                        option.value = value;
                        option.innerText = value;
                        field.appendChild(option)
                        
                        originalContent[field.name] = field.value;
                        child.textContent = '';
                        child.append(field);
                        
                        getDropdownData();
                    }
                    

                } else {

                    let field = document.createElement('input');
                    field.name = child.getAttribute('name');

                    if (child.getAttribute('name') == 'date') {
                        field.type = 'date';
                        field.value = child.textContent;
                    }

                    else {
                        field.type = 'text';
                        field.value = child.textContent;
                    }

                    originalContent[field.name] = field.value;
                    child.textContent = '';
                    child.append(field);
                }
                

            // the <td> has the edit button in it
            } else if (child.firstElementChild.name == 'edit') {
                let submitBtn = document.createElement('button');
                submitBtn.name = 'submit';
                submitBtn.textContent = 'Submit';
                bindSubmitEdit(submitBtn);

                child.replaceChild(submitBtn, child.firstElementChild);
            
            // the <td> has the delete button in it
            } else if (child.firstElementChild.name == 'del') {
                let cancelBtn = document.createElement('button');
                cancelBtn.name = 'cancel';
                cancelBtn.textContent = 'Cancel';
                bindCancelEdit(cancelBtn, originalContent);

                child.replaceChild(cancelBtn, child.firstElementChild);
            }
        }
    }
}

function cancelEdit(event, originalContent) {
    // buttons are nested in <td> which is in a <tr>
    let tableRow = event.target.parentElement.parentElement;
    let rowId = tableRow.id;
    let row = document.getElementById(rowId);

    // cycle through only ELEMENT nodes (given by .children)
    for (let child of row.children) {
        if (child.firstElementChild) {
            if (child.firstElementChild.tagName == 'INPUT' || 
                child.firstElementChild.tagName == 'SELECT') {
                
                    content = child.firstElementChild.value;
                    child.removeChild(child.firstElementChild);

                    if (originalContent) {
                        child.textContent = originalContent[child.getAttribute('name')]
                    } else {
                        child.textContent = content;
                    }

            } else if (child.firstElementChild.name == 'submit') {
                let editBtn = document.createElement('button');

                editBtn.name = 'edit';
                editBtn.textContent = 'Update';

                bindEdit(editBtn);
                child.replaceChild(editBtn, child.firstElementChild);

            } else if (child.firstElementChild.name == 'cancel') {
                let delBtn = document.createElement('button');

                delBtn.name = 'del';
                delBtn.textContent = 'Delete';

                bindDelete(delBtn);
                child.replaceChild(delBtn, child.firstElementChild);
            }
        }
    }
}
