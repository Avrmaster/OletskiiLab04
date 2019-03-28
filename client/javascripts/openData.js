document.addEventListener('DOMContentLoaded', function () {
    function createNode (user, index) {
        const newEl = template.cloneNode(true);
        newEl.id = 'u' + index;
        Object.entries({
            '.id': (index + 1),
            '.first': user['Name'],
            '.last': user['Location']['Address'],
            '.user': user['Location']['City']['Name'],
        }).forEach(([key, value]) =>
            newEl.querySelector(key).textContent = value,
        );
        container.append(newEl);
        newEl.style.display = 'table-row';
    }

    const template = document.getElementById('u_id');
    const container = document.getElementById('container');
    const request = new XMLHttpRequest();
    request.open('GET', 'https://services.odata.org/TripPinRESTierService/Airports', false);
    request.send();
    JSON
        .parse(request.responseText)['value']
        .forEach(createNode);
}, false);
