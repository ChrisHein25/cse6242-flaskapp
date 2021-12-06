function runJS (inputs) {

    k_opt = inputs['k_opt'];
    inertia = inputs['inertia'];
    edges = inputs['edges'];
    nodes = inputs['nodes'];

    div = document.getElementById('myDiv');
    div.innerHTML += '<p>'+'k_opt: '+k_opt+'</p>';
    div.innerHTML += '<p>'+'inertia: '+inertia+'</p>';
};
