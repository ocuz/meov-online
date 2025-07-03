const patternSelect = document.getElementById("patternSelect");
const customPatternInput = document.getElementById("customPatternInput");
const fileInput = document.getElementById("fileInput");
const fileUpload = document.getElementById("fileUpload");
const countInput = document.getElementById("countInput");
const countWrapper = document.getElementById("countWrapper");
const resultsDiv = document.getElementById("results");

patternSelect.addEventListener("change", () => {
  const value = patternSelect.value;
  customPatternInput.classList.toggle("hidden", value !== "8");
  fileInput.classList.toggle("hidden", value !== "9");
  countWrapper.classList.toggle("hidden", value === "9");
});

const randChar = (c) => {
  if (c === "L") return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  if (c === "D") return Math.floor(Math.random() * 10);
  return c;
};

const genFromFormat = (fmt) => [...fmt].map(randChar).join("");

const patterns = {
  1: () => `${randChar("L")}_${randChar("L")}${randChar("L")}${randChar("L")}`,
  2: () => `${randChar("L")}${randChar("L")}_${randChar("L")}${randChar("L")}`,
  3: () => `${randChar("L")}${randChar("L")}${randChar("L")}_${randChar("L")}`,
  4: () => `${randChar("L")}_${randChar("L")}${randChar("D")}${randChar("L")}`,
  5: () => `${randChar("L")}${randChar("L")}_${randChar("D")}${randChar("L")}`,
  6: () => `${randChar("L")}${randChar("L")}${randChar("D")}_${randChar("L")}`,
  7: () => `${randChar("L")}${randChar("D")}${randChar("L")}${randChar("D")}${randChar("L")}`,
};

const checkUsername = async (username) => {
  const url = `https://auth.roblox.com/v1/usernames/validate?username=${username}&birthday=2001-09-11`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.code;
  } catch (err) {
    return -1;
  }
};

const validList = [];
const takenList = [];
const censoredList = [];

function downloadList(data, filename) {
  if (!data.length) {
    alert(`No ${filename.replace(".txt", "")} usernames to download.`);
    return;
  }
  const blob = new Blob([data.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("downloadValid").addEventListener("click", () => downloadList(validList, "valid.txt"));
document.getElementById("downloadTaken").addEventListener("click", () => downloadList(takenList, "taken.txt"));
document.getElementById("downloadCensored").addEventListener("click", () => downloadList(censoredList, "censored.txt"));

document.getElementById("startBtn").addEventListener("click", async () => {
  resultsDiv.innerHTML = "";
  validList.length = 0;
  takenList.length = 0;
  censoredList.length = 0;

  const choice = patternSelect.value;
  let count = parseInt(countInput.value) || 10;
  if (count < 1) count = 10;

  let usernames = [];

  if (choice === "9") {
    // Load from uploaded file
    const file = fileUpload.files[0];
    if (!file) {
      alert("Please upload a .txt file.");
      return;
    }
    const text = await file.text();
    usernames = text.split(/\r?\n/).filter(Boolean);
    count = usernames.length;
  } else if (choice === "8") {
    const pattern = document.getElementById("customPattern").value.toUpperCase();
    if (!pattern.match(/^[LD]+$/)) {
      alert("Custom pattern must only contain letters 'L' and 'D'");
      return;
    }
    usernames = Array.from({ length: count }, () => genFromFormat(pattern));
  } else if (patterns[choice]) {
    usernames = Array.from({ length: count }, patterns[choice]);
  } else {
    alert("Invalid pattern choice.");
    return;
  }

  for (const name of usernames) {
    const code = await checkUsername(name);
    const div = document.createElement("div");

    if (code === 0) {
      div.className = "text-green-400";
      div.textContent = `[VALID] ${name}`;
      validList.push(name);
    } else if (code === 1) {
      div.className = "text-white";
      div.textContent = `[TAKEN] ${name}`;
      takenList.push(name);
    } else if (code === 2) {
      div.className = "text-red-500";
      div.textContent = `[CENSORED] ${name}`;
      censoredList.push(name);
    } else {
      div.className = "text-yellow-400";
      div.textContent = `[ERROR] ${name}`;
    }

    resultsDiv.appendChild(div);
  }
});
