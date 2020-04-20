
let payments = [];
let total;
let individualPayment = 0;

let debtorss = [];
let credAccum;
let actualCreditorAmount;
let result = [];

payments = [
  {
    id: 1,
    done: true,
    name: "Bufarra",
    pay: 40
  },
  {
    id: 2,
    done: true,
    name: "Martin",
    pay: 600
  },
  {
    id: 3,
    done: true,
    name: "Joni",
    pay: 150
  },
  {
    id: 4,
    done: true,
    name: "Pedro",
    pay: 0
  },
  {
    id: 5,
    done: true,
    name: "Cachi",
    pay: 0
  },
  {
    id: 6,
    done: true,
    name: "Gisela",
    pay: 200
  }
  /*     {
    id: 7,
    done: true,
    name: "Eze",
    pay: 0
  } */
];

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
]; */

function add() {
  const nombre = document.form.nombre.value.trim()
  const pago = document.form.pago.value.trim()

  if (validate(nombre)) {
    let uid = payments.length + 1;
    const payment = {
      id: uid++,
      done: true,
      name: nombre,
      pay: pago === "" ? 0 : parseInt(pago)
    };
    payments = [...payments, payment];

    document.getElementById("myForm").reset();

    clearResults();
    calculate();
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
  document.getElementById("result").innerHTML = "";
  document.getElementById("payments").innerHTML = "";
  document.getElementById("total").innerHTML = "";
  document.getElementById("individual").innerHTML = "";
}

function remove(payment) {
  payments = payments.filter(t => t !== payment);
}

let output = {
  total,
  individualPayment,
  result
}

function calculate() {
  let balance = prepareDataSet();
  let { creditors, debtors } = devideList(balance);

  result = creditors.map(cred => collect(cred, debtors));
  console.log(result);
  return output;
}

function prepareDataSet() {
  let payers = payments.filter(t => t.done);
  total = payers.reduce((a, b) => a + (b["pay"] || 0), 0);
  individualPayment = Math.round(total / payers.length);
  return payers.map(payment => {
    return {
      ...payment, //spread all props to new object except the one you need to change
      pay: individualPayment - payment.pay
    };
  });
}

function devideList(balance) {
  return {
    creditors: balance
      .filter(e => e.pay < 0)
      .sort((a, b) => (a.pay > b.pay ? 1 : -1)),
    debtors: balance
      .filter(e => e.pay >= 0)
      .sort((a, b) => (a.pay > b.pay ? -1 : 1))
  };
}

function collect(creditor, debtors) {
  actualCreditorAmount = creditor.pay;
  credAccum = 0;
  debtors.map(debtor => toPay(debtor, creditor));
  return creditor; //construir un objeto custom para 
}

function toPay(debtor, creditor) {
  const credAmount = creditor.pay;
  if (debtor.pay > 0 && actualCreditorAmount < 0) {
    credAccum += debtor.pay;
    let yetToPay = credAccum + credAmount;
    if (yetToPay > 0 && yetToPay < individualPayment) {
      let payment = debtor.pay - yetToPay;
      setBalance(creditor, debtor, payment);
    } else if (debtor.pay < individualPayment) {
      setBalance(creditor, debtor, debtor.pay);
    } else if (yetToPay <= 0) {
      setBalance(creditor, debtor, individualPayment);
    }
  }
}

function setBalance(creditor, debtor, payment) {
  creditor.pay += payment;
  actualCreditorAmount = creditor.pay;
  generateOutput(creditor, debtor, payment);
}

function generateOutput(creditor, debtor, payment) {
  let resultListDiv = document.getElementById("result");
  let totalDiv = document.getElementById("total");
  let individualDiv = document.getElementById("individual");

  const payListDiv = document.getElementById("payments");
  if (payListDiv.innerHTML === "") {
    payments.map(payer => {
      payListDiv.innerHTML += payer.name + ": $" + payer.pay + "<br/>"
    }
    )
  }

  if (creditor.hasOwnProperty("debtors")) {
    creditor.debtors.push({ ...debtor, payment: payment });
  } else {
    creditor["debtors"] = [{ ...debtor, payment: payment }];
  }

  resultListDiv.innerHTML += creditor.name + ": $" + creditor.pay + "<br/>"

  totalDiv.innerHTML = "Total: $" + total
  individualDiv.innerHTML = "A cada uno le toca aportar: $" + individualPayment

}


