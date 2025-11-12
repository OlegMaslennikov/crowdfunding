const contractAddress = "0x408CbCf94FD5810D1553839E7d1784aa46393E11";
const abi = [
  "function projectName() view returns (string)",
  "function description() view returns (string)",
  "function goal() view returns (uint)",
  "function totalFunds() view returns (uint)",
  "function owner() view returns (address)",
  "function fund() payable",
  "function withdraw()",
  "function refund()"
];

let provider, signer, contract;

async function connect() {
  if (!window.ethereum) return alert("Установите MetaMask!");

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    const account = await signer.getAddress();
    document.getElementById("connectBtn").innerText = "Подключено: " + account.slice(0,6) + "...";
    console.log("Подключено:", account);

    loadData();
  } catch (err) {
    console.error(err);
    alert("Ошибка подключения: " + err.message);
  }
}

async function loadData() {
  if (!contract) return;

  try {
    const name = await contract.projectName();
    const desc = await contract.description();
    const goal = await contract.goal();
    const total = await contract.totalFunds();
    const owner = await contract.owner();

    document.getElementById("projectName").innerText = name;
    document.getElementById("description").innerText = desc;
    document.getElementById("goal").innerText = ethers.formatEther(goal);
    document.getElementById("totalFunds").innerText = ethers.formatEther(total);
    document.getElementById("owner").innerText = owner;
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
}

async function fundProject() {
  if (!contract) return alert("Сначала подключите MetaMask!");

  const ethAmount = document.getElementById("amount").value;
  if (!ethAmount || Number(ethAmount) <= 0) return alert("Введите корректное количество ETH");

  try {
    const tx = await contract.fund({ value: ethers.parseEther(ethAmount) });
    await tx.wait();
    alert("Пожертвование успешно отправлено!");
    loadData();
  } catch (err) {
    console.error(err);
    alert("Ошибка при отправке пожертвования: " + err.message);
  }
}

async function withdrawFunds() {
  if (!contract) return alert("Сначала подключите MetaMask!");
  try {
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Средства выведены!");
    loadData();
  } catch (err) {
    alert("Ошибка при выводе средств: " + err.message);
  }
}

async function refundFunds() {
  if (!contract) return alert("Сначала подключите MetaMask!");
  try {
    const tx = await contract.refund();
    await tx.wait();
    alert("Возврат выполнен!");
    loadData();
  } catch (err) {
    alert("Ошибка при возврате: " + err.message);
  }
}

document.getElementById("connectBtn").addEventListener("click", connect);
document.getElementById("fundBtn").addEventListener("click", fundProject);
document.getElementById("withdrawBtn").addEventListener("click", withdrawFunds);
document.getElementById("refundBtn").addEventListener("click", refundFunds);
