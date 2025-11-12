// Адрес деплоя контракта
const contractAddress = "0xDEADBEEF1234567890abcdef1234567890abcdef"; // замени своим

// ABI контракта
const abi = [
  "function fund() payable",
  "function totalFunds() view returns (uint)"
];

let provider, signer, contract;

// Подключение MetaMask
async function connect() {
  if (!window.ethereum) {
    alert("Установите MetaMask!");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const account = await signer.getAddress();
    console.log("MetaMask подключен:", account);
    document.getElementById("connectBtn").innerText = "Подключено: " + account.slice(0,6) + "...";

    // сразу загружаем текущий баланс
    updateTotalFunds();
  } catch (err) {
    console.error(err);
    alert("Ошибка подключения: " + err.message);
  }
}

// Обновление общего баланса проекта
async function updateTotalFunds() {
  if (!contract) return;
  const total = await contract.totalFunds();
  document.getElementById("totalFunds").innerText = ethers.formatEther(total);
}

// Отправка пожертвования
async function fundProject() {
  if (!contract) {
    alert("Сначала подключите MetaMask!");
    return;
  }

  const input = document.getElementById("amount").value;
  if (!input || Number(input) <= 0) {
    alert("Введите корректное количество ETH");
    return;
  }

  try {
    const tx = await contract.fund({
      value: ethers.parseEther(input)
    });

    console.log("Транзакция отправлена:", tx.hash);
    alert("Транзакция отправлена. Подтверждение в блокчейне...");

    await tx.wait();
    alert("Пожертвование успешно отправлено!");
    updateTotalFunds();
  } catch (err) {
    console.error(err);
    alert("Ошибка при отправке: " + err.message);
  }
}

// Привязка кнопок
document.getElementById("connectBtn").addEventListener("click", connect);
document.getElementById("fundBtn").addEventListener("click", fundProject);
