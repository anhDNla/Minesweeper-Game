function create_line_break()
{
	let br = document.createElement('br');
    document.body.appendChild(br);
}

function create_button() {
    let button = document.createElement('button');
    button.classList.add('game-button');
    document.body.appendChild(button);
    return button;
}
