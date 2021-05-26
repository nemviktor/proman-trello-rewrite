export function animation(){
    let container = document.querySelector('.container');
    let mylinks = document.querySelector('#myLinks');
    container.addEventListener('click', ()=>{
        container.classList.toggle('change');
        mylinks.classList.toggle('change');
    })
}
