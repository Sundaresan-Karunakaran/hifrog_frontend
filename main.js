function callDocker(fileName){
    console.log('Running Hifrog with ' + fileName);
    const apiURL = 'http://localhost:3000/';

    fetch(apiURL)
    .then(response => {
        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}