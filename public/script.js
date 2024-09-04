document.getElementById('ftpForm').addEventListener('submit', function() {    
    fetch('/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ host, username, password, port })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data!== undefined) {
            const files = data.files.map(file => `<li>${file.name}</li>`).join('');
            document.body.innerHTML += `<ul>${files}</ul>`;
        } else {
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert(`Connection failed: ${error.message}`);
    });
});

function updateFileList(path) {
    fetch('/navigate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
    })
    .then(response => {
        console.log("test3")
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response;
    })
    .then(response => response.json())
    .then(data => {
        if (!data.files) {
            console.error('Files data is missing');
            return; 
        }
        const fileListDiv = document.getElementById('fileList');
        if(document.getElementById(path) !== null) {
            return;
        }
        document.getElementById('currentPath').value = `/${path}`;
        let newList = document.createElement('ul');
        newList.id = path;
        let listItem = document.createElement('li');
        listItem.textContent = `${path}`;
        listItem.classList.add('center');
        listItem.addEventListener('click', function() {
            document.getElementById(path).remove();
            document.getElementById('currentPath').value = `/${path}`;
        });
        newList.appendChild(listItem);
        data.files.forEach( file => {
            console.log("test")
            let listItem = document.createElement('li');
            let filePath = `${path}${file.name}/`;
            let text = document.createElement('p');
            text.textContent += ` ${file.name} `;
            listItem.setAttribute('data-path', filePath);
            let icon = document.createElement('i');
            if(file.path) {
                listItem.setAttribute('data-path', file.path);
            }
            if (file.type == 2) {
                listItem.classList.add('folder');
                //listItem.classList.add('icon-folder');
                icon.className = 'fas fa-folder';
                listItem.addEventListener('click', function() {
                    updateFileList(filePath);
                    document.getElementById('currentPath').value = filePath;
                });
            } else {
                listItem.classList.add('file');
                icon.className = 'fas fa-file';
                //listItem.classList.add('icon-file');
            }
            listItem.appendChild(icon);
            listItem.appendChild(text);
            newList.appendChild(listItem);
        });
        console.log("test2")
        fileListDiv.appendChild(newList);
        //attachEventListeners(); 
    })
    .catch(error => {
        console.error('Error updating file list:', error);
        alert('Failed to update file list. See console for details.');
    });
}

function uploadThing() {
    console.log("It works")
    const files = document.getElementById('fileInput').files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    const currentPath = document.getElementById('currentPath').value;
    console.log(currentPath)
    formData.append('path', currentPath);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Upload successful');
            //location.reload();
        } else {
            console.error('Upload failed', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
};