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
  if (typeof window.ethereum === 'undefined') {
    alert("Metamask не найден. Установи расширение!");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log("Подключено:", account);
    document.getElementById("connectBtn").innerText = "Подключено: " + account.slice(0, 6) + "...";
  } catch (error) {
    console.error(error);
    alert("Ошибка при подключении: " + error.message);
  }
}

document.getElementById("connectBtn").addEventListener("click", connect);

async function loadData() {
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
}

async function fundProject() {
  const ethAmount = document.getElementById("amount").value;
  const tx = await contract.fund({ value: ethers.parseEther(ethAmount) });
  await tx.wait();
  alert("Пожертвование успешно отправлено!");
  loadData();
}

async function withdrawFunds() {
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
