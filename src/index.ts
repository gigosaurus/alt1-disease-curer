//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import * as a1lib from "@alt1/base";
import {ImgRef} from "@alt1/base";
import DialogReader, {DialogButton} from "@alt1/dialog";

require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./icon.png");

declare type DialogReaderResponse = {
    text: string[] | null;
    opts: DialogButton[] | null;
    title: string;
}

let treatment = document.getElementById('treatment');
let output = document.getElementById("output");

const options = ['head', 'eyes', 'legs and feet', 'stomach'];
const illnesses = ['Foot-in-mouth', 'Flu', 'Curse', 'Dry nose', 'Bone rattle', 'Wooting cough'];
let state = {
    treatment: '',
    nextOption: 0,
    pendingReset: false,
}

a1lib.PasteInput.listen(img => {
    process(img);
}, (err, errid) => {
    output.insertAdjacentHTML("beforeend", `<div><b>${errid}</b>  ${err}</div>`);
});

function capture() {
	process(a1lib.captureHoldFullRs());
}

function resetState() {
    state.treatment = null;
    state.nextOption = 0;
    treatment.innerText = '';
    state.pendingReset = false;
}

function process(img: ImgRef) {
    let dr = new DialogReader();
    if (!dr.find(img)) {
        if (state.pendingReset) {
            resetState();
        }
        return;
    }

    const d = <DialogReaderResponse> dr.read(img);
    if (d == null) {
        if (state.pendingReset) {
            resetState();
        }
        return;
    }

    if (stringSomewhatEquals(d.title, "Select an option", 0.8) && d.opts !== null && d.opts.length == 5) {
        highlightOption(d, state.nextOption);
    } else if (stringSomewhatEquals(d.title, "Which treatment will you use?", 0.8) && d.opts !== null && d.opts.length == 5) {
        highlightTreatment(d, state.treatment);
    } else if (d.text !== null) {
        const text = d.text.join(" ");
        if (stringSomewhatEquals(text, "You examine the animal's stomach:")) {
            if (state.nextOption == 3) {
                let illness = checkStomachPrompt(text);
                setTreatment(illness);
            }
        } else if (stringSomewhatEquals(text, "You examine the animal's head:")) {
            if (state.nextOption == 0) {
                let illness = checkHeadPrompt(text);
                setTreatment(illness);
            }
        } else if (stringSomewhatEquals(text, "You examine the animal's legs:")) {
            if (state.nextOption == 2) {
                let illness = checkLegPrompt(text);
                setTreatment(illness);
            }
        } else if (stringSomewhatEquals(text, "You examine the animal's eyes:")) {
            if (state.nextOption == 1) {
                let illness = checkEyePrompt(text);
                setTreatment(illness);
            }
        }
    }
}

function setTreatment(illness) {
    if (illness != '') {
        state.treatment = illness;
        treatment.innerText = 'Treatment: ' + illness;
        state.nextOption = 4;
    } else if (state.treatment == null) {
        treatment.innerText = 'Treatment: Unknown.';
        output.innerText = 'Continue to next option.';
        state.nextOption += 1;
    }
}

function highlightOption(d, opt) {
    if (opt == 4) {
        output.innerText = 'Select "[Administer treatment.]"';
    } else {
        output.innerText = 'Select "Check the ' + options[opt] + '."';
    }
    let dOpt = d.opts[opt];
    alt1.overLayRect(a1lib.mixColor(255, 255, 255), dOpt.buttonx, dOpt.y - 9, dOpt.width, 18, 500, 3);
}

function highlightTreatment(d, opt) {
    if (opt == null) {
        output.innerText = 'Unknown treatment';
        return;
    }
    
    output.innerText = 'Select ' + opt + ' treatment';
    for (let i = 0; i < 5; i++) {
        let dOpt = d.opts[i];
        if (stringSomewhatEquals(dOpt.text, opt + ' treatment')) {
            alt1.overLayRect(a1lib.mixColor(255, 255, 255), dOpt.buttonx, dOpt.y - 9, dOpt.width, 18, 2000, 3);
            state.pendingReset = true;
            return;
        }
    }
}

function checkStomachPrompt(text) {
    const symptoms = [
        ['The animal\'s emissions smell strangely of shoes.', 'The animal\'s stomach appears to be a little bloated.'],
        ['The animal appears to be suffering from nausea.'],
        ['The animal\'s stomach is making strange noises, like there\'s something singing inside there.'],
        [],
        ['The animal appears to be shivering, but has no temperature.', 'The animal\'s body is making a weird clicking noise.'],
        ['The animal coughs regularly.', 'The animal\'s body is slightly swollen.'],
    ];

    for (let i = 0; i < symptoms.length; i++) {
        for (let j = 0; j < symptoms[i].length; j++) {
            if (stringSomewhatEquals(text, "You examine the animal's stomach: " + symptoms[i][j])) {
                return illnesses[i];
            }
        }
    }

    return '';
}

function checkLegPrompt(text) {
    const symptoms = [
        ['The animal\'s feet are a little soggy for some reason.'],
        ['The animal\'s feet are clammy.', 'The animal\'s feet are very sweaty.', 'The animal\'s feet are very warm to the touch.'],
        ['The animal\'s feet are tapping to a strange rhythm. It\'s unsettling.'],
        [],
        ['The animal\'s legs click as it walks.', 'The animal\'s legs seem a little stiff.'],
        ['The animal is a little unsteady on its feet.', 'The animal\'s legs seem fine.'],
    ];

    for (let i = 0; i < symptoms.length; i++) {
        for (let j = 0; j < symptoms[i].length; j++) {
            if (stringSomewhatEquals(text, "You examine the animal's legs: " + symptoms[i][j])) {
                return illnesses[i];
            }
        }
    }

    return '';
}

function checkEyePrompt(text) {
    const symptoms = [
        ['The animal\'s eyes seem normal.'],
        ['The eyes are a little bloodshot.'],
        ['The animal\'s eyes are faintly glowing.', 'The animal\'s eyes are filled with uncharacteristic malice.', 'The animal\'s eyes seem a little glazed over.'],
        [],
        [],
        ['The animal\'s eyes are filled with mirth, more mirth than normal.', 'The animal\'s eyes keep darting around the place with a sense of wonder.'],
    ];

    for (let i = 0; i < symptoms.length; i++) {
        for (let j = 0; j < symptoms[i].length; j++) {
            if (stringSomewhatEquals(text, "You examine the animal's eyes: " + symptoms[i][j])) {
                return illnesses[i];
            }
        }
    }

    return '';
}

function checkHeadPrompt(text) {
    const symptoms = [
        ['The animal keeps making noises at embarrassing moments, making it difficult to investigate.', 'The animal\'s breath smells oddly like socks.', 'The gums appear to be a little sore.', 'There are some nasty looking marks along the gum line.'],
        ['The animal appears to be suffering from a small fever.', 'The animal coughs in your face.', 'The animal sneezes in your face.', 'The animal\'s breath smells deeply unpleasant.'],
        ['The animal occasionally mumbles something in a language it can\'t possibly speak.', 'The animal\'s breath smells faintly of sulphur.', 'The animal\'s nose is lumpy, like it\'s grown warts.', 'There is a faint light deep within the animal\'s throat.'],
        ['The animal\'s nose is very dry.', 'The animal refuses to let you see its nose, it seems like the nose is quite sore.'],
        ['The animal\'s breath smells normal, which is to say horrible.', 'The animal\'s teeth click in a sinister manner.', 'The gums appear to be healthy.'],
        ['The animal coughs as you try and examine it.', 'The animal coughs loudly in a \'hu hu huuu\' style.', 'The animal\'s breath smells normal.'],
    ];

    for (let i = 0; i < symptoms.length; i++) {
        for (let j = 0; j < symptoms[i].length; j++) {
            if (stringSomewhatEquals(text, "You examine the animal's head: " + symptoms[i][j])) {
                return illnesses[i];
            }
        }
    }

    return '';
}

// font doesn't appear to be 100% accurate, sometimes returning the wrong characters.
// there's probably a better way of doing this.
function stringSomewhatEquals(s1, s2, threshold = 0.95) {
    let str1 = s1.toLowerCase();
    let str2 = s2.toLowerCase();

    let max = Math.min(str1.length, str2.length);
    let same = 0;
    let diff = 0;
    for (let i = 0; i < max; i++) {
        if (str1[i] == str2[i]) {
            same++;
        } else {
            diff++;
        }
    }

    return same / max >= threshold;
}

export function start() {
    if (!window.alt1) {
        output.innerText = "You need to run this page in alt1 to capture the screen";
        return;
    }
    if (!alt1.permissionPixel) {
        output.innerText = "Page is not installed as app or capture permission is not enabled";
        return;
    }

    resetState();
    capture();
    setInterval(capture, alt1.captureInterval);
}

//check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	//tell alt1 about the app
	//this makes alt1 show the add app button when running inside the embedded browser
	//also updates app settings if they are changed
	alt1.identifyAppUrl("./appconfig.json");
}