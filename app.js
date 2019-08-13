		
	const supportedCards = {
		visa, mastercard
	};

	const countries = [
		{
			code: "US",
			currency: "USD",
			currencyName: '',
			country: 'United States'
		},
		{
			code: "NG",
			currency: "NGN",
			currencyName: '',
			country: 'Nigeria'
		},
		{
			code: 'KE',
			currency: 'KES',
			currencyName: '',
			country: 'Kenya'
		},
		{
			code: 'UG',
			currency: 'UGX',
			currencyName: '',
			country: 'Uganda'
		},
		{
			code: 'RW',
			currency: 'RWF',
			currencyName: '',
			country: 'Rwanda'
		},
		{
			code: 'TZ',
			currency: 'TZS',
			currencyName: '',
			country: 'Tanzania'
		},
		{
			code: 'ZA',
			currency: 'ZAR',
			currencyName: '',
			country: 'South Africa'
		},
		{
			code: 'CM',
			currency: 'XAF',
			currencyName: '',
			country: 'Cameroon'
		},
		{
			code: 'GH',
			currency: 'GHS',
			currencyName: '',
			country: 'Ghana'
		}
	];

	const billHype = () => {
		const billDisplay = document.querySelector('.mdc-typography--headline4');
		if (!billDisplay) return;

		billDisplay.addEventListener('click', () => {
			const billSpan = document.querySelector("[data-bill]");
			if (billSpan &&
				appState.bill &&
				appState.billFormatted &&
				appState.billFormatted === billSpan.textContent) {
				window.speechSynthesis.speak(
					new SpeechSynthesisUtterance(appState.billFormatted)
				);
			}
		});
	};

const appState = {
	
};

const formatAsMoney = (amount, buyerCountry) => {
	for(let i = 0; i < countries.length; i++) {
		if(buyerCountry == countries[i].country){
			code = countries[i].code;
			currency = countries[i].currency;
			return amount.toLocaleString("en-" + code, {style:'currency', currency: currency})
		}
	}
	return amount.toLocaleString("en-US", {style:'currency', currency: "USD"})
};

const flagIfInvalid = (field, isValid) => {
	isValid ? field.classList.remove('is-invalid') : field.classList.add('is-invalid');
};

const expiryDateFormatIsValid = (field) => {
	const pattern = /^(1[0-2]|0[1-9]|\d)\/(20\d{2}|19\d{2}|0(?!0)\d|[1-9]\d)$/;
	return pattern.test(field);
}

const detectCardType = (first4Digits) => {
		const fieldOne = document.querySelector('[data-credit-card]');
		const fieldType = document.querySelector('[data-card-type]');
		if(first4Digits.toString().startsWith(4)){
			fieldOne.classList.add('is-visa');
			fieldOne.classList.remove('is-mastercard');
			fieldType.src = supportedCards.visa;
			return "is-visa";
		} else if(first4Digits.toString().startsWith(5)){
			fieldOne.classList.add('is-mastercard');
			fieldOne.classList.remove('is-visa');
			fieldType.src = supportedCards.mastercard;
			return "is-mastercard";
		}
};

const validateCardExpiryDate = () => {
	const expiryDateQuery = 'div[data-cc-info] input:nth-child(2)'
	const field = document.querySelector(expiryDateQuery);
	const isValid = expiryDateFormatIsValid(field.value);
	if(isValid == true){
		const theDate = field.value.split('/');
		const month = theDate[0];
		const year = '20' + theDate[1];
		const t = new Date();
		t1 = t.setFullYear(year, month - 1)
		const expDate = (t < new Date())? true: false;
		if(!expDate && month <=12){
			flagIfInvalid(field, true);
			return true;
		} else {
			flagIfInvalid(field, false);
			return false;
		};
	}
	return false;
};

const smartCursor = (event, fieldIndex, fields) => {
	if(event.target.value.length === event.target.size) {
		fields[fieldIndex + 1].focus();
	}
};

const enableSmartTyping = () => {
	let inputs = document.querySelectorAll('input');
	inputs.forEach((field, index, fields)=> {
		field.addEventListener('keyup', event => {
			smartCursor(event, index, fields);
		});
		field.addEventListener('keydown', event => {
			smartInput(event, index, fields);
		});
	})
};

const validateCardHolderName = () => {
	const cardHolderName = "[data-cc-info] input:first-child";
	const field = document.querySelector(cardHolderName);
	const nameValue = field.value;
	const isNameValid = /^[a-zA-Z]{3,9}$/;
	const nameArr = nameValue.split(' ');
	const [name, surname] = nameArr;
	if(isNameValid.test(name) && isNameValid.test(surname) && nameArr.length === 2) {
		flagIfInvalid(field, true);
		return true;
	} else {
		flagIfInvalid(field, false);
		return false;
	}
};

const validateWithLuhn = (digits) => {
	let total = 0;
	let sumOdd = 0;
	let sumEven = 0;

	for(let i=0; i < digits.length; i++){
		if(i % 2 === 0){
			if(digits[i] * 2 > 9){
				sumEven += digits[i] * 2 - 9;
			} else {
				sumEven += digits[i] * 2;
			}
		} else {
			sumOdd += digits[i];
		}
	}

	total = sumOdd + sumEven;
	return total % 10 === 0;
};

const validateCardNumber = () => {
	let cardNumber = '';
	const cardFields = document.querySelectorAll('[data-cc-digits] input');
	cardFields.forEach(field => {
		cardNumber += field.value;
	});

	cardNumber = cardNumber.toString().split('').map(x=>parseInt(x));
	const cardField = document.querySelector('[data-cc-digits]');
	if(validateWithLuhn(cardNumber)){
		cardField.classList.remove('is-invalid');
		return true;
	} else {
		cardField.classList.add('is-invalid');
		return false;
	}
};

const validatePayment = () => {
	validateCardNumber();
	validateCardHolderName();
	validateCardExpiryDate();
};

const smartInput = (event, fieldIndex, fields) => {
	if(fieldIndex < 4 || fieldIndex == 5) {
		const validKeys = ['Backspace', 'Tab', 'Delete', 'Shift', 'ArrowRight', 'ArrowLeft'];
		if(fieldIndex < 4 && !validKeys.includes(event.key)) {
			event.preventDefault();
		}
		if(fieldIndex == 5 && !validKeys.includes(event.key) && event.key !== "/"){
			event.preventDefault();
		}

		const userInput = parseInt(event.key);
		if(isNaN(userInput)){
			return false;
		}
		const currField = fields[fieldIndex];

		if(currField.value.length < currField.getAttribute("size")){
			appState.cardDigits[fieldIndex][currField.value.length] = userInput;
			currField.value += userInput;

			if(fieldIndex == 0){
				const first4Digits = appState.cardDigits[0];
				detectCardType(first4Digits);
			}
		}

		if(fieldIndex < 3){
			setTimeout(() => {
				let inputMask = '';
				let firstDigit = '';
				for(i=0; i < currField.value.length; i++){
					inputMask += "#";
				}

				currField.value = inputMask;

			}, 500);
		}
	}
};

const uiCanInteract = () => {
	const firstCardNo = document.querySelector('[data-cc-digits] input:nth-child(1)').focus();
	const payNowBtn = document.querySelector('[data-pay-btn]').addEventListener('click', validatePayment);
	billHype();
	enableSmartTyping();
};

const displayCartTotal = ({results}) => {
	const [data] = results;
	const {itemsInCart, buyerCountry} = data;
	appState.items = itemsInCart;
	appState.country = buyerCountry;
	appState.bill = itemsInCart.reduce((total, item) => {
		return total + (item.price * item.qty)
	}, 0);
	appState.billFormatted = formatAsMoney(appState.bill, appState.country);
	document.querySelector("[data-bill]").textContent = appState.billFormatted;

	appState.cardDigits = [];
	appState.cardDigits[0] = [];
	appState.cardDigits[1] = [];
	appState.cardDigits[2] = [];
	appState.cardDigits[3] = [];

	uiCanInteract();
};
	
const fetchBill = () => {
	const apiHost = 'https://randomapi.com/api';
	const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
	const apiEndpoint = `${apiHost}/${apiKey}`;
		fetch(apiEndpoint).then(response => {
		return response.json()
	}).then(data => {
			displayCartTotal(data);
	}).catch(error => {
		console.log(error);
	});
};
	
const startApp = () => {
	fetchBill();
};

startApp();
