function app() {
    const screen = document.querySelector('#screen');
    const buttons = document.querySelector('#buttons');

    const defaultBackgroundColor = '#1f2937';

    let firstOperand = null;
    let displayString = '0';
    let secondOperand = null;
    let operator = null;
    let operationResult = null;
    let inputString = '0';
    let activeButton;

    buttons.addEventListener('click', (event) => {
        if (activeButton && event.target.classList.contains('btn')) {
            activeButton.style.backgroundColor = defaultBackgroundColor;
            activeButton = null;
        }

        if (event.target.classList.contains('number')) {
            if (event.target.textContent === '.') {
                if (!inputString.includes('.')) {
                    inputString = readNumber(inputString, '.');
                }
            } else {
                if (operator === null) {
                    firstOperand = null;
                }

                inputString = readNumber(inputString, event.target.textContent);
            }

            displayString = parseInputToDisplay(inputString);
        } else if (event.target.classList.contains('operator')) {
            if (event.target.textContent === '=') {
                if (firstOperand === null) {
                    displayString = parseInputToDisplay(inputString);
                } else if (inputString === '0') {
                    if (operator) {
                        displayString = 'Error';
                        // firstOperand = null;
                        secondOperand = null;
                        operator = null;
                        inputString = '0';
                    }
                } else if (inputString !== '0') {
                    secondOperand = parseInputString(inputString);
                    operationResult = executeOperation(firstOperand, secondOperand, operator);
                    operator = null;
                    firstOperand = operationResult;
                    displayString = parseDisplayString(operationResult);
                    secondOperand = null;
                    inputString = '0';
                }
            } else if (event.target.textContent === '+/-') {
                if (activeButton) {
                    activateButton(activeButton);
                }

                if (displayString !== '0' && displayString !== 'NaN' && displayString !== 'MathError') {
                    displayString = `${0 - parseFloat(displayString)}`;
                    if (inputString !== '0') {
                        inputString = `${0 - parseFloat(inputString)}`;
                    } else if (firstOperand) {
                        firstOperand = 0 - firstOperand;
                    }
                }
            } else if (event.target.textContent === '%') {
                operator = null;
                if (inputString != '0') {
                    operationResult = parseFloat(inputString) / 100;
                } else if (firstOperand) {
                    operationResult = firstOperand / 100;
                } else {
                    operationResult = 0 / 100;
                }

                firstOperand = operationResult;
                displayString = parseDisplayString(operationResult);
                inputString = '0';
            } else if (firstOperand === null) {
                activeButton = event.target;
                activateButton(activeButton);
                operator = event.target.textContent;
                firstOperand = parseInputString(inputString);
                inputString = '0';
            } else if (secondOperand === null && operator) {
                activeButton = event.target;
                activateButton(activeButton);
                if (inputString !== '0') {
                    secondOperand = parseInputString(inputString);
                    operationResult = executeOperation(firstOperand, secondOperand, operator);
                    operator = event.target.textContent;
                    firstOperand = operationResult;
                    displayString = parseDisplayString(operationResult);
                    secondOperand = null;
                    inputString = '0';
                }
            } else if (firstOperand) {
                activeButton = event.target;
                activateButton(activeButton);
                operator = event.target.textContent;
            }
        } else if (event.target.classList.contains('misc')) {
            if (event.target.textContent === 'AC') {
                operator = null;
                // activeButton = null;
                firstOperand = null;
                secondOperand = null;
                displayString = '0';
                inputString = '0';
            } else if (event.target.textContent == 'C') {
                let string;

                operator = null;
                if (displayString !== '0' && displayString !== 'NaN' && displayString !== 'MathError') {
                    string = displayString.slice(0, -1);
                    if (string) {
                        displayString = string;
                        if (inputString !== '0') {
                            inputString = displayString;
                        } else if (firstOperand) {
                            firstOperand = parseFloat(displayString);
                        }
                    } else {
                        displayString = '0';
                        if (inputString !== '0') {
                            inputString = '0';
                        } else if (firstOperand) {
                            firstOperand = null;
                        }
                    }
                }
            }
        }
        displayNumber(screen, displayString);
    });

    buttons.addEventListener('mousedown', (event) => {
        if (event.target.classList.contains('blink')) {
            activateButton(event.target);
        }
    });

    buttons.addEventListener('mouseup', (event) => {
        if (event.target.classList.contains('blink')) {
            event.target.style.backgroundColor = defaultBackgroundColor;
        }
    });
}

function add(firstOperand, secondOperand) {
    return firstOperand + secondOperand;
}

function subtract(firstOperand, secondOperand) {
    return firstOperand - secondOperand;
}

function multiply(firstOperand, secondOperand) {
    return firstOperand * secondOperand;
}

function divide(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return NaN;
    }

    return firstOperand / secondOperand;
}

function executeOperation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return add(firstOperand, secondOperand);

        case '-':
            return subtract(firstOperand, secondOperand);

        case '*':
            return multiply(firstOperand, secondOperand);

        case '/':
            return divide(firstOperand, secondOperand);
    }
}

function displayNumber(screen, displayString) {
    screen.textContent = displayString;
}

function readNumber(inputString, inputCharacter) {
    if (inputString.length < 8) {
        inputString += inputCharacter;
    }

    return inputString;
}

function parseDisplayString(operationResult) {
    let mantissa;
    let whole;
    let string;
    let split;
    let sign = '';
    let exponent = 0;

    string = operationResult.toString();
    if (string === 'NaN') {
        return 'NaN';
    } else if (string.includes('e')) {
        let carry;

        split = string.split('e');
        whole = split[0].substr(0, 3);
        if (split[0].length > 4) {
            if (parseInt(split[0][4]) > 4) {
                carry = parseInt(split[0][3]) + 1;
                whole += carry.toString();
            } else {
                whole += split[0][3];
            }
        }

        return whole + 'e' + split[1];
    }

    split = string.split('.');
    whole = split[0];
    mantissa = split.at(1);

    if (whole.startsWith('-')) {
        whole = whole.slice(1);
        sign = '-';
    }

    if (string.length > 7) {
        if (string.includes('.')) {
            if (whole === '0') {
                for (const char of mantissa) {
                    if (char === '0') {
                        exponent++;
                    } else {
                        break;
                    }
                }

                whole = mantissa[exponent] + '.' + mantissa.substr(exponent + 1, 3);
                whole = whole.padEnd(5, '0');
            } else {
                exponent = whole.length - 2;

                whole = whole[0] + '.' + whole.substr(1, 3);
                for (const char of mantissa) {
                    if (whole.length === 5) {
                        break;
                    }

                    whole += char;
                }
            }
        } else {
            exponent = whole.length - 2;

            whole = whole[0] + '.' + whole.substr(1, 3);
            whole = whole.padEnd(5, '0');

        }

        if (parseInt(whole.at(-1)) > 4) {
            carry = parseInt(whole[3]) + 1;
            whole = whole.slice(0, 3) + carry.toString();
        } else {
            whole = whole.slice(0, -1);
        }

        whole += `e${exponent + 1}`;

        return sign + whole;
    }

    return string;
}

function parseInputToDisplay(inputString) {
    let mantissa;
    let whole;
    let split;

    if (inputString.includes('.')) {
        split = inputString.split('.');
        whole = split[0];
        mantissa = split.at(1);
        whole = parseFloat(whole).toString();

        return whole + '.' + mantissa;
    }

    return parseFloat(inputString).toString();
}

function parseInputString(inputString) {
    let reverseMantissa;
    let mantissa;
    let whole;
    const split = inputString.split('.');

    whole = split[0];
    mantissa = split.at(1);

    if (mantissa) {
        reverseMantissa = mantissa.split('').reverse().join('');
        mantissa = parseFloat(reverseMantissa).toString().split('').reverse().join('');

        return parseFloat(`${whole + '.' + mantissa}`);
    }

    return parseFloat(whole);
}

function activateButton(button) {
    const style = getComputedStyle(button);

    button.style.backgroundColor = style.borderColor;
}

app();