export function hamburger_menu() {
    let hambi = document.querySelector('.fa-bars');
    hambi.addEventListener('click', ()=>{
        let x = document.getElementById("myLinks");
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
    })
}


export function animation(){
    let container = document.querySelector('.container')
    container.addEventListener('click', ()=>{
        container.classList.toggle('change');
    })
}