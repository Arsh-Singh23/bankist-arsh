
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-IN',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
let currentAccount;

accounts.forEach(acc => {
  acc.username = acc.owner.split(` `).map(name => name[0]).join(``).toLowerCase()
})

btnLogin.addEventListener(`click`, function (e) {
  e.preventDefault()
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value)
  if (!currentAccount) return
  if (currentAccount.pin !== +inputLoginPin.value) return
  containerApp.style.opacity = 100
  init()
  currentDate()
  generatorTimer()
})

const showMovements = function () {
  containerMovements.innerHTML = ``
  currentAccount.movements.forEach((mov, i) => {
    let markup = `
    <div class="movements__row">
    <div class="movements__type movements__type--${mov > 0 ? `deposit` : `withdrawal`}">${i + 1} deposit</div>
    <div class="movements__date">${new Intl.DateTimeFormat(currentAccount.locale).format(new Date(currentAccount.movementsDates[i]))}</div>
    <div class="movements__value">${new Intl.NumberFormat(currentAccount.locale, { style: `currency`, currency: currentAccount.currency }).format(mov)}</div>
  </div>`
    containerMovements.insertAdjacentHTML(`afterbegin`, markup)
  })
}

const showSummary = function () {
  const incoming = currentAccount.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0).toFixed(2)
  labelSumIn.textContent = new Intl.NumberFormat(currentAccount.locale, { style: `currency`, currency: currentAccount.currency }).format(incoming)
  const outgoing = currentAccount.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0).toFixed(2)
  labelSumOut.textContent = new Intl.NumberFormat(currentAccount.locale, { style: `currency`, currency: currentAccount.currency }).format(-outgoing)
  const interest = currentAccount.movements.filter(mov => mov > 0).map(mov => mov * ((currentAccount.interestRate) / 100)).reduce((acc, mov) => acc + mov, 0).toFixed(2)
  labelSumInterest.textContent = new Intl.NumberFormat(currentAccount.locale, { style: `currency`, currency: currentAccount.currency }).format(interest)
  const balance = currentAccount.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2)
  labelBalance.textContent = new Intl.NumberFormat(currentAccount.locale, { style: `currency`, currency: currentAccount.currency }).format(balance)
}

btnLoan.addEventListener(`click`, function (e) {
  e.preventDefault()
  if (+inputLoanAmount.value > currentAccount.movements.reduce((acc, mov) => acc + mov, 0) * 0.1 || +inputLoanAmount.value <= 0) {
    alert(`Amount exceeded limit`)
    inputLoanAmount.value = ``
    inputLoanAmount.blur()
    return
  }
  currentAccount.movements.push(+inputLoanAmount.value)
  currentAccount.movementsDates.push(new Date().toISOString())
  init()
  inputLoanAmount.value = ``
  inputLoanAmount.blur()
})

btnClose.addEventListener(`click`, function (e) {
  e.preventDefault()
  if (inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin) {
    console.log(`yoo`);
    const index = accounts.findIndex(acc => acc === currentAccount)
    console.log(index);
    accounts.splice(index, 1)
    containerApp.style.opacity = 0
    inputClosePin.value = inputCloseUsername.value = ``
  }
})

btnTransfer.addEventListener(`click`, function (e) {
  e.preventDefault()
  const transferToAccount = accounts.find(acc => acc.username === inputTransferTo.value)
  if (!transferToAccount) return
  const amountToTransfer = +inputTransferAmount.value
  if (amountToTransfer > currentAccount.movements.reduce((acc, mov) => acc + mov, 0)) return
  currentAccount.movements.push(-amountToTransfer)
  currentAccount.movementsDates.push(new Date().toISOString())
  transferToAccount.movements.push(amountToTransfer)
  transferToAccount.movementsDates.push(new Date().toISOString())
  init()
  inputTransferAmount.value = inputTransferTo.value = ``
  inputTransferAmount.blur()
})

let timer

const generatorTimer = function () {
  let time = 5 * 60
  if (timer) clearInterval(timer)
  timer = setInterval(function () {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    labelTimer.textContent = `${minutes < 9 ? `0` + minutes : minutes}:${seconds < 9 ? `0` + seconds : seconds}`
    time--
    if (time === -1) {
      clearInterval(timer)
      containerApp.style.opacity = 0
    }
  }, 1000)
}


const init = function () {
  labelWelcome.textContent = `Welcome ${currentAccount.owner.split(` `)[0]}`
  inputLoginPin.value = inputLoginUsername.value = ``
  inputLoginPin.blur()
  showMovements()
  showSummary()
  generatorTimer()
}

const currentDate = function () {
  const date = new Date()
  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale).format(date)
}

