const goodsList = [
  { id: 1, title: "Миша дротова", cost: 350 },
  { id: 2, title: "Миша бездротова", cost: 650 },
  { id: 3, title: "Навушники", cost: 1200 },
  { id: 4, title: "Клавіатура", cost: 950 },
  { id: 5, title: "Окуляри для ПК", cost: 500 },
]

function calcBaseAmount(cost, count) {
  return cost * count
}

const evalDiscount = function (sum, hasLoyalty) {
  let percent = 0

  if (sum >= 3000) {
    percent = 15
  } else if (sum >= 1000) {
    percent = 10
  } else if (sum >= 500) {
    percent = 5
  }

  percent += hasLoyalty ? 5 : 0
  return percent
}

function calcDeliveryFee(needDelivery, sumAfterDiscount) {
  if (!needDelivery) return 0
  return sumAfterDiscount >= 1500 ? 0 : 100
}

const calcFinalPayable = (goodsTotal, deliveryFee) => goodsTotal + deliveryFee

const catalogTableBody = document.querySelector("#catalogBody")
const productSelector = document.querySelector("#productSelect")

const nameInput = document.querySelector("#customerName")
const qtyInput = document.querySelector("#productQty")
const deliveryCheck = document.querySelector("#needsShipping")
const paymentSelect = document.querySelector("#paymentType")
const statusRadios = document.querySelectorAll('input[name="clientStatus"]')

const calculateBtn = document.querySelector("#calculate")
const resetBtn = document.querySelector("#resetBtn")
const errorBox = document.querySelector("#error")
const resultBox = document.querySelector("#result")

function initCatalog() {
  const catalogTableBody = document.querySelector("#catalogBody")
  const productSelector = document.querySelector("#productSelect")

  if (!catalogTableBody || !productSelector) return

  let tableRows = ""
  let selectOptions = `<option value="" disabled selected>Оберіть позицію...</option>`

  goodsList.forEach(item => {
    tableRows += `
      <tr>
        <td>${item.id}</td>
        <td>${item.title}</td>
        <td>${item.cost} грн</td>
      </tr>
    `

    selectOptions += `<option value="${item.id}">${item.title} (${item.cost} грн)</option>`
  })

  catalogTableBody.innerHTML = tableRows
  productSelector.innerHTML = selectOptions
}

function toggleFormLock(isLocked) {
  productSelector.disabled = isLocked
  qtyInput.disabled = isLocked
  deliveryCheck.disabled = isLocked
  paymentSelect.disabled = isLocked
  calculateBtn.disabled = isLocked

  statusRadios.forEach(radio => {
    radio.disabled = isLocked
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initCatalog()
  toggleFormLock(true)
})

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initCatalog()
  toggleFormLock(true)
}

function clearFeedback() {
  errorBox.textContent = ""
  nameInput.classList.remove("invalid")
  const statusGroup = document.querySelector("#statusGroup")
  if (statusGroup) statusGroup.classList.remove("invalid-group")
  resultBox.classList.remove("success")
  resultBox.innerHTML = ""
}

const informalNamesPattern =
  /^[А-ЩЬЮЯЇІЄҐ][а-щьюяїієґ]*(?:ша|ик|чик|очка|енька)$/iu

// Список поширених російських форм імен
const russianNamesPattern =
  /^(Никита|Николай|Александр|Александра|Андрей|Алексей|Сергей|Михаил|Владимир|Евгений|Дмитрий|Артем|Даниил|Кирилл|Глеб|Илья|Павел|Антон|Денис|Филипп|Тимофей|Матвей|Наташа|Маша|Даша|Саша|Паша|Миша)$/i

function isValidRealName(name) {
  if (/[ыэъёЫЭЪЁ]/i.test(name)) return false

  const ukrOrLatinPattern =
    /^(?:[А-ЩЬЮЯЇІЄҐ][а-щьюяїієґ'-]{2,}|[A-Z][a-z'-]{2,})$/u
  if (!ukrOrLatinPattern.test(name)) return false

  if (informalNamesPattern.test(name)) return false

  const russianEndingsPattern = /(?:[бвгґджзклмнпрстфхцчшщ]ий|[вдст]ей)$/i
  if (russianEndingsPattern.test(name)) return false

  if (/(?:[кп]сандр|етр)$/i.test(name)) return false

  if (!/[аеєиіїоуюяaeiouy]/i.test(name)) return false

  if (/[^аеєиіїоуюяaeiouy'-]{4,}/i.test(name)) return false

  return true
}

function validateCustomerName() {
  const customerName = nameInput.value.trim()

  if (!customerName) {
    errorBox.textContent = "Поле повинно бути обов'язково заповнено!"
    nameInput.classList.add("invalid")
    toggleFormLock(true)
    return false
  }

  if (informalNamesPattern.test(customerName)) {
    errorBox.textContent =
      "Будь ласка, введіть повне офіційне ім'я (наприклад: Наталія замість Наташа)!"
    nameInput.classList.add("invalid")
    toggleFormLock(true)
    return false
  }

  if (
    /[ыэъёЫЭЪЁ]/i.test(customerName) ||
    russianNamesPattern.test(customerName) ||
    /(?:[бвгґджзклмнпрстфхцчшщ]ий|[вдст]ей)$/i.test(customerName) ||
    /(?:[кп]сандр|етр)$/i.test(customerName)
  ) {
    errorBox.textContent =
      "Будь ласка, введіть ім'я українською мовою (наприклад: Наталія, Микита, Олександр, Василь, Андрій)!"
    nameInput.classList.add("invalid")
    toggleFormLock(true)
    return false
  }

  if (!isValidRealName(customerName)) {
    errorBox.textContent =
      "Введіть коректне повне ім'я з великої літери (наприклад: Наталія, Андрій, David)!"
    nameInput.classList.add("invalid")
    toggleFormLock(true)
    return false
  }

  errorBox.textContent = ""
  nameInput.classList.remove("invalid")
  toggleFormLock(false)
  return true
}

nameInput.addEventListener("input", function () {
  validateCustomerName()
})

nameInput.addEventListener("blur", function () {
  if (!validateCustomerName()) {
    setTimeout(() => {
      nameInput.focus()
    }, 10)
  }
})

function renderReceipt(data) {
  const deliveryStatus = data.needsShipping
    ? data.deliveryCost === 0
      ? "Безкоштовна"
      : `${data.deliveryCost} грн`
    : "Самовивіз"

  resultBox.innerHTML = `
    <div class="receipt-header">Чек замовлення</div>
    <div class="receipt-item"><span>Клієнт:</span> <strong>${data.name}</strong></div>
    <div class="receipt-item"><span>Товар:</span> <span>${data.productTitle} (${data.qty} шт.)</span></div>
    <div class="receipt-item"><span>Вартість товарів:</span> <span>${data.baseSum} грн</span></div>
    <div class="receipt-item"><span>Знижка:</span> <span>${data.discountPercent}% (-${data.discountMoney} грн)</span></div>
    <div class="receipt-item"><span>Доставка:</span> <span>${deliveryStatus}</span></div>
    <div class="receipt-item"><span>Спосіб оплати:</span> <span>${data.paymentMethod}</span></div>
    <div class="receipt-item receipt-total"><span>До сплати:</span> <span>${data.totalPayable} грн</span></div>
  `

  resultBox.classList.add("success")
}

calculateBtn.addEventListener("click", function () {
  clearFeedback()

  if (!validateCustomerName()) {
    nameInput.focus()
    return
  }

  const customerName = nameInput.value.trim()
  const selectedId = Number(productSelector.value)
  const qty = Number(qtyInput.value)

  if (!selectedId) {
    errorBox.textContent = "Будь ласка, оберіть товар зі списку."
    productSelector.focus()
    return
  }

  if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
    errorBox.textContent = "Кількість повинна бути цілим числом від 1."
    qtyInput.focus()
    return
  }

  const statusGroup = document.querySelector("#statusGroup")
  const selectedStatus = document.querySelector(
    'input[name="clientStatus"]:checked',
  )
  if (!selectedStatus) {
    errorBox.textContent = "Будь ласка, оберіть, чи купували ви у нас раніше!"
    if (statusGroup) statusGroup.classList.add("invalid-group")
    return
  }

  const activeProduct = goodsList.find(item => item.id === selectedId)
  const isRegular = selectedStatus.value === "regular"
  const needsShipping = deliveryCheck.checked
  const paymentMethod = paymentSelect.options[paymentSelect.selectedIndex].text

  const baseSum = calcBaseAmount(activeProduct.cost, qty)
  const discountPercent = evalDiscount(baseSum, isRegular)
  const discountMoney = (baseSum * discountPercent) / 100
  const sumAfterDiscount = baseSum - discountMoney
  const deliveryCost = calcDeliveryFee(needsShipping, sumAfterDiscount)
  const totalPayable = calcFinalPayable(sumAfterDiscount, deliveryCost)

  renderReceipt({
    name: customerName,
    productTitle: activeProduct.title,
    qty,
    baseSum,
    discountPercent,
    discountMoney,
    needsShipping,
    deliveryCost,
    paymentMethod,
    totalPayable,
  })
})

resetBtn.addEventListener("click", function () {
  nameInput.value = ""
  productSelector.selectedIndex = 0
  qtyInput.value = "1"
  deliveryCheck.checked = false

  const checkedRadio = document.querySelector(
    'input[name="clientStatus"]:checked',
  )
  if (checkedRadio) {
    checkedRadio.checked = false
  }

  paymentSelect.selectedIndex = 0
  clearFeedback()
  toggleFormLock(true)
})
