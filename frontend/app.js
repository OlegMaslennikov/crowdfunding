window.addEventListener("DOMContentLoaded", async () => {
  const contractAddress = "0x408CbCf94FD5810D1553839E7d1784aa46393E11";
  const abi = [
    "function projectName() view returns (string)",
    "function description() view returns (string)",
    "function goal() view returns (uint256)",
    "function totalFunds() view returns (uint256)",
    "function owner() view returns (address)",
    "function fund() payable",
    "function withdraw()",
    "function refund()",
    "function donors(uint256) view returns (address, uint256)",
    "function donorCount() view returns (uint256)"
  ];

  const connectBtn = document.getElementById("connectBtn");
  const fundBtn = document.getElementById("fundBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const refundBtn = document.getElementById("refundBtn");

  const projectNameEl = document.getElementById("projectName");
  const descriptionEl = document.getElementById("description");
  const goalEl = document.getElementById("goal");
  const totalFundsEl = document.getElementById("totalFunds");
  const ownerEl = document.getElementById("owner");
  const amountInput = document.getElementById("amount");
  const progressFill = document.getElementById("progress");
  const donationsList = document.getElementById("donationsList");

  let provider, signer, contract;

  connectBtn.onclick = async () => {
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
      connectBtn.innerText = "Подключено: " + account.slice(0,6) + "...";
      console.log("Подключено:", account);

      loadContractData();
    } catch (err) {
      console.error("Ошибка подключения:", err);
      alert("Ошибка подключения: " + err.message);
    }
  };

  async function loadContractData() {
    if (!contract) return;

    try {
      const name = await contract.projectName();
      const desc = await contract.description();
      const goal = await contract.goal();
      const total = await contract.totalFunds();
      const owner = await contract.owner();

      projectNameEl.textContent = name;
      descriptionEl.textContent = desc;
      goalEl.textContent = ethers.formatEther(goal);
      totalFundsEl.textContent = ethers.formatEther(total);
      ownerEl.textContent = owner;

      const progressPercent = Math.min(100, (Number(ethers.formatEther(total)) / Number(ethers.formatEther(goal))) * 100);
      progressFill.style.width = progressPercent + "%";

      donationsList.innerHTML = "";
      const donorCount = await contract.donorCount();
      for (let i = 0; i < donorCount; i++) {
        const donor = await contract.donors(i);
        const li = document.createElement("li");
        li.textContent = `${donor[0]}: ${ethers.formatEther(donor[1])} ETH`;
        donationsList.appendChild(li);
      }

    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    }
  }

  fundBtn.onclick = async () => {
    if (!contract) return alert("Сначала подключите MetaMask!");
    const ethAmount = amountInput.value;
    if (!ethAmount || Number(ethAmount) <= 0) return alert("Введите корректное количество ETH");

    try {
      const tx = await contract.fund({ value: ethers.parseEther(ethAmount) });
      await tx.wait();
      alert("Пожертвование отправлено!");
      loadContractData();
    } catch (err) {
      console.error("Ошибка пожертвования:", err);
      alert("Ошибка пожертвования: " + err.message);
    }
  };

  withdrawBtn.onclick = async () => {
    if (!contract) return alert("Сначала подключите MetaMask!");
    try {
      const tx = await contract.withdraw();
      await tx.wait();
      alert("Средства выведены!");
      loadContractData();
    } catch (err) {
      console.error("Ошибка вывода:", err);
      alert("Ошибка вывода: " + err.message);
    }
  };

  refundBtn.onclick = async () => {
    if (!contract) return alert("Сначала подключите MetaMask!");
    try {
      const tx = await contract.refund();
      await tx.wait();
      alert("Средства возвращены!");
      loadContractData();
    } catch (err) {
      console.error("Ошибка возврата:", err);
      alert("Ошибка возврата: " + err.message);
    }
  };
});
