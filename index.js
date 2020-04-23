//pre refactor (important and good)
let payments = []
let total
let individualPayment = 0
let result = []

payments = [
  { id: 1, done: true, name: "Bufarra", pay: 40 },
  { id: 2, done: true, name: "Martin", pay: 600 },
  { id: 3, done: true, name: "Joni", pay: 150 },
  { id: 4, done: true, name: "Pedro", pay: 0 },
  { id: 5, done: true, name: "Cachi", pay: 0 },
  { id: 6, done: true, name: "Gisela", pay: 200 }
  //,{ id: 7, done: true, name: "Eze", pay: 0 }
]

/* let result = [
  {
    id: 2,
    name: "Martin",
    debtors: [
      { id: 3, name: "Bufarra", pay: 101, payment: 33 },
      { id: 3, name: "Pedro", pay: 141, payment: 33 },
      { id: 3, name: "Cachi", pay: 141, payment: 33 },
      { id: 3, name: "Eze", pay: 76, payment: 33 }
    ]
  },
  {
    name: "Gisela",
    debtors: [{ name: "Eze", pay: 54, payment: 33 }]
  },

  {
    name: "Joni",
    debtors: [{ name: "Eze", pay: 11, payment: 33 }]
  }
] */

function add() {
  const nombre = document.form.nombre.value.trim()
  const pago = document.form.pago.value.trim()

  if (validate(nombre)) {
    let uid = payments.length + 1
    const payment = {
      id: uid++,
      done: true,
      name: nombre,
      pay: pago === "" ? 0 : pago
    }
    payments = [...payments, payment]

    document.getElementById("myForm").reset()

    clearResults()
    calculate()
  }
}

function validate(nombre) {
  if (nombre === "") {
    document.form.nombre.focus()
    return false
  } else {
    return true
  }
}

function clearResults() {
  document.getElementById("result").innerHTML = ""
  document.getElementById("payments").innerHTML = ""
  document.getElementById("total").innerHTML = ""
  document.getElementById("individual").innerHTML = ""
}

function remove(payment) {
  payments = payments.filter(t => t !== payment)
}

function calculate() {
  let balance = prepareDataSet()
  let { creditors, debtors } = devideList(balance)

  result = creditors.map((creditor) => {
    debtPayments(creditor, debtors)
    return creditor
  })

  console.log(result)
  const output = { total, individualPayment, result }
  generateOutput(output)
  return output
}

function debtPayments(creditor, debtors) {
  let yetToPay = creditor.pay
  debtors.map((debtor) => {
    yetToPay = collect(debtor, yetToPay, creditor)
  })
}

function collect(debtor, yetToPay, creditor) {
  let payment
  if (debtor.pay > 0 && yetToPay < 0) {
    if (debtor.pay + creditor.pay <= 0) {
      payment = debtor.pay
      debtor.pay = 0
      yetToPay = setBalance(yetToPay, creditor, payment, debtor)
    }
    else {
      payment = yetToPay * -1
      debtor.pay -= payment
      yetToPay = setBalance(yetToPay, creditor, payment, debtor)
    }
  }
  return yetToPay
}

function setBalance(yetToPay, creditor, payment, debtor) {
  yetToPay = creditor.pay
  creditor.pay += payment
  setOutputData(creditor, payment, debtor)
  return yetToPay
}

function setOutputData(creditor, payment, debtor) {
  if (creditor.hasOwnProperty("debtors")) {
    creditor.debtors.push({ payment: Math.round(payment), ...debtor })
  }
  else {
    creditor["debtors"] = [{ payment: Math.round(payment), ...debtor }]
  }
}

function prepareDataSet() {
  let payers = payments.filter(t => t.done)
  total = payers.reduce((acc, curr) => acc + (curr.pay || 0), 0)
  individualPayment = Math.round(total / payers.length)
  return payers.map(payment => {
    return {
      ...payment, //spread all props to new object except the one you need to change
      pay: individualPayment - payment.pay
    }
  })
}

function devideList(balance) {
  return {
    creditors: balance
      .filter(e => e.pay < 0)
      .sort((a, b) => (a.pay > b.pay ? 1 : -1)),
    debtors: balance
      .filter(e => e.pay >= 0)
      .sort((a, b) => (a.pay > b.pay ? -1 : 1))
  }
}

function generateOutput(output) {
  const totalDiv = document.getElementById("total")
  totalDiv.innerHTML = "Total: $" + output.total

  const individualDiv = document.getElementById("individual")
  individualDiv.innerHTML = "A cada uno le toca aportar: $" + output.individualPayment

  const resultListDiv = document.getElementById("result")
  if (resultListDiv.innerHTML === "") {
    createList(resultListDiv, output.result)
  }

  const originalInputListDiv = document.getElementById("payments")
  if (originalInputListDiv.innerHTML === "") {
    payments.map(payer => {
      originalInputListDiv.innerHTML += payer.name + ": $" + payer.pay + "<br/>"
    }
    )
  }
}

function createList(parent, array) {
  array.forEach(o => {
    const credMsg = o.name + " cobra de:"
    const debMsg = o.name + " $" + o.payment

    const li = document.createElement("li")
    li.textContent = o.payment ? debMsg : credMsg
    parent.appendChild(li)

    if (o.debtors) {
      parent.appendChild(document.createElement("hr"))
      const ul = document.createElement("ul")
      li.appendChild(ul)
      createList(ul, o.debtors)
    }
  })
}

