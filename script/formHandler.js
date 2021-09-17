
let uploadCrop;
let imageUploaded = false;
let profiles;

function prepareContactHtml(formData, imgName) {
    return `<div className="contact">`
        + `<div className="card">`
            + `<figure className="front">`
                + `<img src="../images/team/${imgName}" alt="${formData.name}"/>`
                + `<h3>${formData.name}</h3>`
                + `<p className="smaller">${formData.position}<br>`
                    + `<a href="mailto:${formData.email}">${formData.email}</a><br>`
                  + `  <a className="twitter_bird" href="https://twitter.com/graph_aware">${formData.twitter}</a><br>`
              + `  </p>`
              + `  <a href="javascript:void(0)" className="button smaller text showmore">Read more</a>`
          + `  </figure>`
           + ` <figure className="back">`
               + ` <h3>About ${formData.name.trim().split(' ')[0]}</h3>`
                +`<p>${formData.bio}</p>`
              + `  <a href="javascript:void(0)" className="close-card">Close</a>`
           + ` </figure>`
       + ` </div>`
   + ` </div>`;
}

async function submitForm() {

    const formData = {
        name: document.getElementById('fname').value,
        position: document.getElementById('fposition').value,
        email: document.getElementById('femail').value,
        twitter: document.getElementById('ftwitter').value,
        bio: document.getElementById('fbio').value,
    }

    const place = Number.parseInt(document.getElementById('fplace').value);


    // validate empty
    const emptyKeys = Object.keys(formData).filter(key => !formData[key].length).join(', ');
    document.getElementById('issues').innerText = `${emptyKeys === '' ? '' : `Fields ${emptyKeys} can not be empty. \n`}  ${!imageUploaded ? 'The profile image is missing. \n' : ''} ${place < 0 || place > profiles.length || !place ? 'Invalid place.' : ''}`

    if(document.getElementById('issues').innerText.length){
        console.log('errors in form.');
        return;
    }

    const picData = await uploadCrop.result({
        type: 'base64',
        size: {width: 240, height: 240},
        circle: false,
        format: 'jpeg',
        quality: 0.8,
    });

    const imgName = formData.name.toLowerCase().replaceAll(' ', '-') + '.jpeg';

    const contactHtml = prepareContactHtml(formData, imgName);
    
    console.log('submit it: ', {contactHtml, picData, imgName});
}

function imageCropUpload() {
    function readFile(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
                imageUploaded = true;
                document.getElementById('upload-demo').classList.add('ready');
                uploadCrop.bind({
                    url: e.target.result
                }).then(function(){
                    console.log('bind complete');
                });

            }

            reader.readAsDataURL(input.files[0]);
        }
        else {
            console.log("Sorry - you're browser doesn't support the FileReader API");
        }
    }

    uploadCrop = new Croppie(document.getElementById('upload-demo'), {
        viewport: {
            width: 240,
            height: 240,
            type: 'circle',
        },
        enableExif: true
    });

    document.getElementById('upload').addEventListener('change', function () { readFile(this); });
}


function mountProfiles() {

    const ol = document.createElement('ol');

    document.getElementById('profile-list').appendChild(ol);

    profiles.forEach(function (item) {
        let li = document.createElement('li');
        ol.appendChild(li);
        li.innerHTML = `${item[0]} <small>${item[1]}</small>`;
    });
}

function processProfilesData(rawData) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(rawData, 'text/html');
    const contactsHtml = htmlDoc.getElementById('contacts');
    profiles = [];
    contactsHtml.childNodes.forEach(contact => {
        if(!contact.hasChildNodes()){
            return;
        }
        const contactCard = contact.childNodes.item(1).childNodes.item(1);

        const name = contactCard.getElementsByTagName('h3')[0].innerText;
        const pos = contactCard.getElementsByTagName('p')[0].innerText.split('\n').filter(p => !!p)[0].trim();

        profiles.push([name, pos]);
    })

    mountProfiles();

}

async function loadProfiles() {

// Make a request for a user with a given ID
    axios.get('https://graphaware.com/company/')
        .then(function (response) {
            // handle success
            processProfilesData(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

function monitorPlace() {
    document.getElementById('fplace').addEventListener("input", function(event) {
        const fieldToSet = document.getElementById('fplaceinfo');
        if(event.target.value === ""){
            fieldToSet.innerText = '-';
            return;
        }
        if(event.target.value === '0'){
            fieldToSet.innerText = 'the very first';
            return;
        }

        const position = Number.parseInt(event.target.value);
        if(position > profiles.length || position < 0){
            fieldToSet.innerText = 'invalid place';
            return;
        }
        document.getElementById('fplaceinfo').innerText = `after ${profiles[position - 1][0]}`
    })
}

function init() {
    imageCropUpload();
    loadProfiles();
    monitorPlace();
}

init();
