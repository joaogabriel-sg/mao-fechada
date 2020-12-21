const form = document.querySelector('form');
const transactionName = form.querySelector('input#transaction-name');
const transactionNumber = form.querySelector('input#transaction-value');

const transactionsResults = document.querySelector('.transactions-results');

const currentBalance = document.querySelector('.current-balance-value');
const incomeValue = document.querySelector('.income-value');
const expenseValue = document.querySelector('.expense-value');

const getTransactionsFromLocalStorage = () => 
  JSON.parse(localStorage.getItem('transactions')) || [];

const setTransactionsToLocalStorage = (transactions) => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

const renderTransactionsValuesOnScreen = ({ current, income, expense }) => {
  currentBalance.innerHTML = `R$ ${current.toFixed(2)}`;
  incomeValue.innerHTML = `R$ ${income.toFixed(2)}`;
  expenseValue.innerHTML = `R$ ${expense.toFixed(2)}`;
}

const getExpenseFinalValue = (acc, { value }) => {
  if (value < 0) return acc += value;
  return acc;
}

const getIncomeFinalValue = (acc, { value }) => {
  if (value > 0) return acc += value;
  return acc;
}

const updateFinances = () => {
  const transactions = getTransactionsFromLocalStorage();
  
  const income = transactions.reduce(getIncomeFinalValue, 0);
  const expense = transactions.reduce(getExpenseFinalValue, 0);
  const current = income + expense;
  
  renderTransactionsValuesOnScreen({ current, income, expense });
}

const generateTransactionsTemplate = (transactions) => ({ id, name, value }) => {
  const valueAbsolute = Math.abs(value);
  const symbol = value > 0 ? '+' : '-';
  const classForValue = value > 0 ? 'positive' : 'negative';

  return `
    <div class="transaction ${classForValue}" data-id="${id}">
      <h2 class="transaction-name">${name}</h2>
      <h3 class="transaction-value">
        <div class="symbol">${symbol}</div>
        <div class="value">R$ ${valueAbsolute.toFixed(2)}</div>
      </h3>
      <button class="delete" onclick="deleteTransactionFromLocalStorage(this)">x</button>
    </div>
  `;
}

const filterTransactionsById = (idDeleted) => 
  ({ id }) => Number(id) !== Number(idDeleted);

const defineTransactionId = () => {
  const transactions = getTransactionsFromLocalStorage();

  const lastTransaction = transactions[transactions.length - 1];
  return lastTransaction ? ++lastTransaction.id : 1;
}

const renderTransactionsOnScreen = () => {
  const transactions = getTransactionsFromLocalStorage();
  const template = transactions.map(generateTransactionsTemplate(transactions))
    .join('');

  transactionsResults.innerHTML = template;
}

const deleteTransactionFromLocalStorage = (transaction) => {
  const transactions = getTransactionsFromLocalStorage();

  const deletedTransactionId = transaction.parentNode.dataset.id;
  const newTransactions = transactions
    .filter(filterTransactionsById(deletedTransactionId));
  
  setTransactionsToLocalStorage(newTransactions);
  generalUpdate();
}

const addTransactionToLocalStorage = (name, value) => {
  const transactions = getTransactionsFromLocalStorage();

  const id = defineTransactionId();

  transactions.push({ id, name, value });
  setTransactionsToLocalStorage(transactions);

  generalUpdate();
}

const clearInputValues = () => {
  transactionName.value = '';
  transactionNumber.value = '';
}

const handleSubmitForm = (e) => {
  e.preventDefault();

  const nameValue = transactionName.value;
  const numberValue = Number(transactionNumber.value);

  const areAllFieldsFilledIn = nameValue.length != 0 
    && numberValue !== ''
    && numberValue !== 0;

  if (areAllFieldsFilledIn) {
    clearInputValues();
    addTransactionToLocalStorage(nameValue, numberValue);
  }
}

const generalUpdate = () => {
  renderTransactionsOnScreen();
  updateFinances();
}

form.addEventListener('submit', handleSubmitForm);
generalUpdate();