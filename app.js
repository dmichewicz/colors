const colors = document.querySelectorAll('.color');
const generateButton = document.querySelector('button.generate');
const openControlsBtns = document.querySelectorAll('.colormenu');
const lockBtns = document.querySelectorAll('.lockcolor');
const controlsDivs = document.querySelectorAll('.controls'); 
const sliders = document.querySelectorAll('input[type="range"]');
const closeControlsBtns = document.querySelectorAll('.close-controls');
const copyHexes = document.querySelectorAll('.hex');
const popupContainers = document.querySelectorAll('.popup-container');
const saveBtn = document.querySelector('.save');
const libBtn = document.querySelector('.library');
const closeLibBtn = document.querySelector('.close-library');
const closeSaveBtn = document.querySelector('.close-save');
const saveSubmitBtn = document.querySelector('.save-palette');
const savePopup = document.querySelector('.save-popup');
const saveInput = document.querySelector('.save-input');
const libPopup = document.querySelector('.library-popup');
let savedPalettes;
let selectLibBtns = [];

JSON.parse(localStorage.getItem('palettes')) === null ? savedPalettes = [] : savedPalettes = JSON.parse(localStorage.getItem('palettes'));
let initialColors;


//start app
generateRandomColors();
setUpLibrary();


//event listeners

generateButton.addEventListener('click', () => generateRandomColors());

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)

})

openControlsBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => openControls(index));
});

lockBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        btnLocked = `<i class="fas fa-lock">`;
        btnUnlocked = `<i class="fas fa-lock-open">`;
        btn.parentElement.parentElement.classList.toggle('locked');
        btn.parentElement.parentElement.classList.contains('locked') ? btn.innerHTML = btnLocked  : btn.innerHTML = btnUnlocked ;
    })
})

closeControlsBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => closeControls(index));
});

copyHexes.forEach(hex => {
    hex.addEventListener('click', () => copyToClipboard(hex))
})

colors.forEach((color, index) => {
    const sliders = color.querySelectorAll('input[type=range]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    color.addEventListener('change', ()=> {
        updateTextUI(index);
        const currentColor = chroma(color.style.backgroundColor).hex();

        colorizeSliders(currentColor, hue, brightness, saturation);
        
       
    })
})

saveBtn.addEventListener('click', () => openSave());

closeSaveBtn.addEventListener('click', () => closeSave());

saveSubmitBtn.addEventListener('click', () => saveToLocal());

savePopup.children[2].addEventListener('keydown', e => {
    if(e.key === 'Enter') {
        saveToLocal();
    } 
});

libBtn.addEventListener('click', () => openLibrary());

closeLibBtn.addEventListener('click', () => closeLibrary());


//functions

function generateRandomColors() {
    initialColors = []
    colors.forEach((color, index) => {
        const randomColor = chroma.random().hex();
        const sliders = color.querySelectorAll('input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        if(color.classList.contains('locked')) {
             initialColors.push(color.children[0].innerText);
        } else{
             initialColors.push(randomColor);
        }
        color.style.background = initialColors[index];
        color.children[0].textContent = initialColors[index];
        checkLuminance(initialColors[index], color.children[0]);
        colorizeSliders(initialColors[index], hue, brightness, saturation);
        })
    setSliders();  

    openControlsBtns.forEach((btn, index) => {
        checkLuminance(initialColors[index], btn);
        checkLuminance(initialColors[index], lockBtns[index]);
    })

}

function colorizeDivs(btnIndex) {

    initialColors = []
    let ix = btnIndex;
    colors.forEach((color, index) => {
        const sliders = color.querySelectorAll('input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
    console.log(savedPalettes);
        initialColors.push(savedPalettes[ix].colors[index]);

        color.style.background = initialColors[index];
        color.children[0].textContent = initialColors[index];
        checkLuminance(initialColors[index], color.children[0]);
        colorizeSliders(initialColors[index], hue, brightness, saturation);
        })
    setSliders();  

    openControlsBtns.forEach((btn, index) => {
        checkLuminance(initialColors[index], btn);
        checkLuminance(initialColors[index], lockBtns[index]);
    })

}

function checkLuminance(color, text) {
    if(chroma(color).luminance() > 0.5) {
        text.style.color = 'black'
    }else {
        text.style.color = 'white'
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    const noSat = chroma(color).set('hsl.s', 0);
    const fullSat = chroma(color).set('hsl.s', 1);
    const scaleSat= chroma.scale([noSat, color, fullSat]);
    saturation.style.background = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`

    const midBright = chroma(color).set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);
    brightness.style.background = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`

    hue.style.background = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
    const index = e.target.getAttribute('data-hue') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-bright');
    const sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    let hexText = document.querySelectorAll('.hex')[index];
    
    // const bgColor = colors[index].querySelector('.hex').innerText;
    const bgColor = initialColors[index];
    let currentColor = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

    colors[index].style.background = currentColor;

    colorizeSliders(currentColor, hue, brightness, saturation)

    checkLuminance(currentColor, hexText);
        checkLuminance(currentColor, openControlsBtns[index]);
        checkLuminance(currentColor, lockBtns[index]);
    
}

function updateTextUI(index) {
    let hexTexts = document.querySelectorAll('.hex');
    let currentColor = chroma(colors[index].style.backgroundColor).hex();
    hexTexts[index].innerText = currentColor;
}

function setSliders() {
    const sliders = document.querySelectorAll('input')
    sliders.forEach(slider => {
        if (slider.classList.contains('hue')){
        const index = slider.getAttribute('data-hue');
        const currentColor = initialColors[index];
        const hueValue = chroma(currentColor).hsl()[0];
        slider.value = hueValue;

        }
        else if (slider.classList.contains('saturation')){
            const index = slider.getAttribute('data-sat');
            const currentColor = initialColors[index];
            const satValue = chroma(currentColor).hsl()[1];
            slider.value = satValue;
        }
        else if (slider.classList.contains('brightness')){
            const index = slider.getAttribute('data-bright');
            const currentColor = initialColors[index];
            const brightValue = chroma(currentColor).hsl()[2];
            slider.value = brightValue;
        }
    })
};

function openControls(index) {
    console.log(index)
    controlsDivs[index].style.transform = 'translateY(0px)';
    controlsDivs[index].style.opacity = '1';
    controlsDivs[index].style.visibility = 'visible';
    
}

function closeControls(index) {
    controlsDivs[index].style.transform = 'translateY(500px)';
    controlsDivs[index].style.opacity = '0';
    controlsDivs[index].style.visibility = 'hidden';
}

function copyToClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el); 
    
    popupContainers[0].style.opacity = '1';
    setTimeout(() => popupContainers[0].style.opacity = '0', 1000)
}

function openSave() {
    popupContainers[1].style.opacity = '1';
    popupContainers[1].style.pointerEvents = 'all';
}

function closeSave() {
    popupContainers[1].style.opacity = '0';
    popupContainers[1].style.pointerEvents = 'none';
    savePopup.children[2].value = null;
}

function saveToLocal() {
    const name = saveInput.value;
    const colors = [];
    copyHexes.forEach(hex => colors.push(hex.innerText));
    let paletteNr = savedPalettes.length;

    

    const paletteObj = {name, colors, nr: paletteNr};
    
    savedPalettes.push(paletteObj);

        
    setInLocal(paletteObj);

    setUpLibrary();

    closeSave();
}
  
function setInLocal(paletteObj) {
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(paletteObj);

localStorage.setItem('palettes', JSON.stringify(localPalettes));

savedPalettes = localPalettes
console.log(savedPalettes)
}

function openLibrary() {
    popupContainers[2].style.opacity = '1';
    popupContainers[2].style.pointerEvents = 'all';
}


function closeLibrary() {
    popupContainers[2].style.opacity = '0';
    popupContainers[2].style.pointerEvents = 'none';
}

function setUpLibrary() {
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {

        if (document.querySelector('.palettes-div') === null) {
        } else {
            document.querySelector('.palettes-div').remove();
        }

        palettes = JSON.parse(localStorage.getItem('palettes'));
        let palettesDiv = document.createElement('div');
        palettesDiv.classList.add('palettes-div'); 
     
        palettes.forEach((palette, index) => {
            let paletteDiv = document.createElement('div');
            paletteDiv.classList.add('palette-div')
            let paletteName = document.createElement('p');
            let paletteColors = document.createElement('div');
            paletteColors.classList.add('library-colors');
            let selectLibBtn = document.createElement('button');
            selectLibBtns.push(selectLibBtn);
            selectLibBtn.classList.add('library-color', 'library-button')
            selectLibBtn.textContent = 'select';


            let paletteButtons = document.createElement('div');
            paletteButtons.classList.add('library-buttons')
            palette.colors.forEach(color => {
                let colorDiv = document.createElement('div');
                colorDiv.style.background = color;
                colorDiv.classList.add('library-color');
                paletteColors.appendChild(colorDiv);
            })

           
            paletteButtons.appendChild(selectLibBtn);

            paletteColors.appendChild(paletteButtons);

            paletteName.innerText = palette.name;

            paletteDiv.appendChild(paletteName);
            paletteDiv.appendChild(paletteColors);

            palettesDiv.appendChild(paletteDiv);
            

        })
        libPopup.appendChild(palettesDiv);
    }

    selectLibBtns.forEach((button, index) => {
        let ix = index;
        button.addEventListener('click', () => {
            colorizeDivs(ix)
        })
    });
    
    
}

