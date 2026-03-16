
const statusMsg = document.getElementById('status-message');
const resultsContainer = document.getElementById('results-container');
const searchInput = document.getElementById('search-input');
const jsonInput = document.getElementById('json-input');
const btnSearch = document.getElementById('btn-search');
const btnCreate = document.getElementById('btn-create');
const btnModalSubmit = document.getElementById('btn-modal-submit');
const btnModalCancel = document.getElementById('btn-modal-cancel');


searchInput.addEventListener('keydown',e=>{
    if(e.key === 'Enter'){
        handleSearch();
    }
});
btnSearch.addEventListener('click', handleSearch);
btnCreate.addEventListener('click', () => openModal('POST'));
btnModalCancel.addEventListener('click', closeModal);


// --- Modal Logic ---
function openModal(action, id = null) {
    document.getElementById('modal-title').innerText = `${action} Document ${id ? '('+id+')' : ''}`;
    document.getElementById('modal-overlay').style.display = 'flex';
    if(action === 'PATCH'){
        btnModalSubmit.innerText = 'Update';
        btnModalSubmit.onclick = ()=>{
            handleUpdate(id, jsonInput.value);
            closeModal();
        }
    }else if(action === 'PUT'){
        btnModalSubmit.innerText = 'Replace';
        btnModalSubmit.onclick = ()=>{
            handleReplace(id, jsonInput.value);
            closeModal();
        }
    }else{
        btnModalSubmit.innerText = 'Create';
        btnModalSubmit.onclick = ()=>{
            handleCreate(jsonInput.value);
            closeModal();
        }
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('json-input').value = '';
}

function showStatus(msg) {
    statusMsg.innerText = msg;
    statusMsg.className = '';
}

function showSuccess(msg) {
    statusMsg.innerText = msg;
    statusMsg.className = 'success';
}

function showError(msg){
    statusMsg.innerText = msg;
    statusMsg.className = 'error';
}


// --- Show Documents ---

function showDocument(doc){
    if(!doc?._id)return;
    let div = document.getElementById(doc._id);
    if(div){
        div.innerHTML = '';
    }else{
        div = document.createElement('div');
        div.className = 'doc-card';
        div.id = doc._id;
        resultsContainer.appendChild(div);
    }
    // data
    const docContent = document.createElement('div');
    docContent.className = 'doc-data';
    docContent.innerText = JSON.stringify(doc, null, 2);
    div.appendChild(docContent);
    // update button
    const patchBtn = document.createElement('button');
    patchBtn.innerText = 'Edit';
    patchBtn.addEventListener('click', () => openModal('PATCH', doc._id));
    div.appendChild(patchBtn);
    // replace button
    const putBtn = document.createElement('button');
    putBtn.innerText = 'Replace';
    putBtn.addEventListener('click', () => openModal('PUT', doc._id));
    div.appendChild(putBtn);
    // delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.classList.add('btn-danger');
    deleteBtn.addEventListener('click', () => handleDelete(doc._id));
    div.appendChild(deleteBtn);
}

function showDocuments(docs) {
    resultsContainer.innerHTML = '';
    docs.forEach(showDocument);
}


// --- Student Work Area ---

//TODO: replace dummy code in each of the functions below with fetch calls to your REST API
//   use showStatus(msg) to display neutral status; e.g.,
//     showStatus('Loading...') can be used to prior to your fetch calls.
//   use showSuccess(msg) to display success message (as in example dummy code below)
//   use showError(msg) to display error if anything goes wrong
//     example below (in handleUpdate) shows how if {error:...} is returned by server, showError may be used to display it)
//   use showDocument(doc) to display a returned document
//   use showDocuments( documentsArray ) to display multiple documents
// HINT: don't forget the 'Content-Type': 'application/json' header for sending json in POST/PUT/PATCH requests
const API_ENDPOINT = '/data';
async function handleSearch() {
    // find document in DB and display them
    // HINT: since this is a REST API and you are using GET method,
    //  make sure the query is a URL param; e.g., 
    //    fetch( API_ENDPOINT + '?q=' + encodeURIComponent(query) )
    //  Note: encodeURIComponent(txt) will ensure your txt is URL-compatible
    const query = searchInput.value.trim();
    showStatus('Loading...');

    try {
        const response = await fetch(
            API_ENDPOINT + '?q=' + encodeURIComponent(query || '{}')
        );
        const docs = await response.json();

        if (!response.ok || docs.error) {
            showError(docs.error || 'Search failed.');
            return;
        }

        showDocuments(docs);
        showSuccess("Documents matching " + query);
    } catch (error) {
        showError(error.message || 'Network error during search.');
    }
}

async function handleCreate(rawJson){
    showStatus('Creating document...');

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: rawJson
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            showError(result.error || 'Create failed.');
            return;
        }

        const doc = JSON.parse(rawJson);
        doc._id = result._id;
        showDocument(doc);
        showSuccess("Created new document with data: " + rawJson);
    } catch (error) {
        showError(error.message || 'Network error during create.');
    }
}

async function handleUpdate(id, rawJson){
    showStatus('Updating document...');

    try {
        const response = await fetch(`${API_ENDPOINT}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: rawJson
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            showError(result.error || 'Could not perform update.');
            return;
        }

        const doc = JSON.parse(rawJson);
        doc._id = id;
        showDocument(doc);
        showSuccess("Updated document with ID: " + id);
    } catch (error) {
        showError(error.message || 'Network error during update.');
    }
}

async function handleReplace(id, rawJson){
    showStatus('Replacing document...');

    try {
        const response = await fetch(`${API_ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: rawJson
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            showError(result.error || 'Replace failed.');
            return;
        }

        const doc = JSON.parse(rawJson);
        doc._id = id;
        showDocument(doc);
        showSuccess("Updated document with ID:" + id + " Data:" + rawJson);
    } catch (error) {
        showError(error.message || 'Network error during replace.');
    }
}

async function handleDelete(id) {
    if(confirm(`Are you sure you want to delete document with ID ${id}?`)) {
        showStatus('Deleting document...');

        try {
            const response = await fetch(`${API_ENDPOINT}/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                showError(result.error || 'Delete failed.');
                return;
            }

            document.getElementById(id).remove();
            showSuccess("Deleted document with ID: " + id);
        } catch (error) {
            showError(error.message || 'Network error during delete.');
        }
    }
}