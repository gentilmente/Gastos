//
let payments = []

/* payments = [
  { id: 1, done: true, name: "Bufarra", pay: 40 },
  { id: 2, done: true, name: "Martin", pay: 600 },
  { id: 3, done: true, name: "Joni", pay: 150 },
  { id: 4, done: true, name: "Pedro", pay: 0 },
  { id: 5, done: true, name: "Cachi", pay: 0 },
  { id: 6, done: true, name: "Gisela", pay: 200 },
  { id: 7, done: true, name: "Eze", pay: 0 }
] */

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
      pay: pago === "" ? 0 : parseInt(pago)
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
  const output = { total, individualPayment: 0, result: [] }
  let balance = arrangeInitialConditions(output)
  let { creditors, debtors } = devideList(balance)

  output.result = creditors.map((creditor) => {
    debtors.map((debtor) => {
      if (debtor.pay > 0 && creditor.pay < 0) {
        const payment = getDebtorPayment(debtor, creditor.pay)
        debtor.pay -= payment
        creditor.pay += payment
        composeOutputObj(creditor, debtor, payment)
      }
    })
    return creditor
  })

  console.log(output)
  generateOutput(output)
  return output
}

function arrangeInitialConditions(output) {
  let payers = payments.filter(t => t.done)
  output.total = payers.reduce((acc, curr) => acc + (curr.pay || 0), 0)
  output.individualPayment = Math.round(output.total / payers.length)
  return payers.map(payment => {
    return {
      ...payment, //spread all props to new object except the one you need to change
      pay: output.individualPayment - payment.pay
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

function getDebtorPayment(debtor, yetToPay) {
  const willCreditorStillOwed = debtor.pay + yetToPay < 0
  return willCreditorStillOwed ? debtor.pay : yetToPay * -1
}

function composeOutputObj(creditor, debtor, payment) {
  const obj = { payment: Math.round(payment), ...debtor }
  if (creditor.hasOwnProperty("debtors")) {
    creditor.debtors.push(obj)
  } else {
    creditor["debtors"] = [obj]
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

