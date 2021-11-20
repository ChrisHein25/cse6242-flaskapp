function runJS (inputs) {

    x = inputs['x'];
    y = inputs['y'];

    console.log(x);
    console.log(y);

    div = document.getElementById('myDiv');
    div.innerHTML += '<p>'+x+'</p>';
    div.innerHTML += '<p>'+y+'</p>';
};
