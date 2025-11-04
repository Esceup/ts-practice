"use strict";
const modal = document.querySelector(".searchPopupModal");
const modalEdit = document.getElementById("modalEdit");
const modalTop = document.querySelector(".searchPopupModalEdit");
const inputName = document.getElementById("inputName");
const inputVacancy = document.getElementById("inputVacancy");
const inputPhone = document.getElementById("inputPhone");
const btnAdd = document.getElementById("btnAdd");
const btnClearList = document.getElementById("btnClearList");
const btnSearch = document.getElementById("btnSearch");
const firstColumn = document.getElementById("firstColumn");
const secondColumn = document.getElementById("secondColumn");
const table = document.getElementById("table");
const searchPopup = document.querySelector(".searchPopup");
const btnCloseModal = document.querySelectorAll('.btnCloseModal');
const nameEdit = document.getElementById("nameEdit");
const vacancyEdit = document.getElementById("vacancyEdit");
const phoneEdit = document.getElementById("phoneEdit");
const btnEditCandidate = document.getElementById("btnEditCandidate");
const searchCandidatesList = document.getElementById("searchCandidatesList");
const searchCandidatesListResult = document.getElementById("searchCandidatesListResult");
const showAllCandidates = document.getElementById("showAllCandidates");
const candidatesData = {
    allCandidates: {},
};
function saveToLocalStorage() {
    localStorage.setItem("candidatesData", JSON.stringify(candidatesData.allCandidates));
}
function loadFromLocalStorage() {
    const saveData = localStorage.getItem("candidatesData");
    if (saveData) {
        candidatesData.allCandidates = JSON.parse(saveData);
    }
}
function initCandidatesData() {
    loadFromLocalStorage();
    if (Object.keys(candidatesData.allCandidates).length === 0) {
        const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
        candidatesData.allCandidates = {};
        for (let letter of alphabet) {
            candidatesData.allCandidates[letter] = {};
        }
        saveToLocalStorage();
    }
}
function renderCandidates() {
    loadFromLocalStorage();
    const activeLetters = new Set();
    document.querySelectorAll(".candidatesList > li.active").forEach((item) => {
        if (item.textContent) {
            activeLetters.add(item.textContent[0]);
        }
    });
    if (!firstColumn || !secondColumn)
        return;
    firstColumn.innerHTML = "";
    secondColumn.innerHTML = "";
    const letters = Object.keys(candidatesData.allCandidates);
    const half = Math.ceil(letters.length / 2);
    letters.forEach((letter, index) => {
        const letterItem = document.createElement("li");
        letterItem.textContent = letter;
        const candidates = candidatesData.allCandidates[letter];
        const countCandidates = document.createElement("span");
        if (Object.keys(candidates).length > 0) {
            countCandidates.textContent = Object.keys(candidates).length.toString();
            countCandidates.classList.add("countCandidates");
            letterItem.appendChild(countCandidates);
        }
        if (Object.keys(candidates).length > 0) {
            const candidatesList = document.createElement("ul");
            Object.keys(candidates).forEach(key => {
                const candidate = candidates[parseInt(key)];
                if (!candidate)
                    return;
                const candidateItem = document.createElement("li");
                const itemName = document.createElement("span");
                const itemVacancy = document.createElement("span");
                const itemPhone = document.createElement("a");
                itemName.textContent = `Имя: ${candidate.name}`;
                itemVacancy.textContent = `Вакансия: ${candidate.vacancy}`;
                itemPhone.textContent = `Телефон: ${candidate.phone}`;
                candidateItem.appendChild(itemName);
                candidateItem.appendChild(itemVacancy);
                candidateItem.appendChild(itemPhone);
                const btnDelete = document.createElement("button");
                btnDelete.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                btnDelete.classList.add("btnDelete");
                btnDelete.onclick = () => deleteCandidate(candidate.id);
                const btnEdit = document.createElement("button");
                btnEdit.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                btnEdit.classList.add("btnEdit");
                btnEdit.onclick = () => editCandidate(candidate.id);
                candidateItem.appendChild(btnDelete);
                candidateItem.appendChild(btnEdit);
                candidatesList.appendChild(candidateItem);
            });
            letterItem.appendChild(candidatesList);
            if (activeLetters.has(letter)) {
                letterItem.classList.add("active");
            }
        }
        if (index < half) {
            firstColumn.appendChild(letterItem);
        }
        else {
            secondColumn.appendChild(letterItem);
        }
    });
}
if (table) {
    table.onclick = (e) => {
        const target = e.target;
        if (target.tagName === "LI" && target.children.length > 0) {
            target.classList.toggle("active");
        }
    };
}
if (btnAdd) {
    btnAdd.addEventListener("click", () => {
        if (!inputName || !inputVacancy || !inputPhone)
            return;
        const name = inputName.value.trim();
        const vacancy = inputVacancy.value.trim();
        const phone = inputPhone.value.trim();
        let hasError = false;
        if (!name || name.length <= 3) {
            showError(inputName, "Некорректное имя");
            hasError = true;
        }
        else {
            const firstLetter = name[0].toUpperCase();
            if (!candidatesData.allCandidates.hasOwnProperty(firstLetter)) {
                showError(inputName, "Используйте кириллицу");
                hasError = true;
            }
        }
        if (!vacancy || vacancy.length < 3) {
            showError(inputVacancy, "Некорректная вакансия");
            hasError = true;
        }
        if (!phone || phone.length < 11 || phone[0] !== "+") {
            showError(inputPhone, "Некорректный телефон");
            hasError = true;
        }
        if (hasError)
            return;
        const firstLetter = name[0].toUpperCase();
        if (candidatesData.allCandidates[firstLetter]) {
            const candidate = {
                id: Date.now(),
                name,
                vacancy,
                phone,
            };
            candidatesData.allCandidates[firstLetter][candidate.id] = candidate;
            saveToLocalStorage();
            renderCandidates();
            inputName.value = "";
            inputVacancy.value = "";
            inputPhone.value = "";
        }
    });
}
function showError(input, message) {
    input.classList.add("error");
    input.value = "";
    input.placeholder = message;
    setTimeout(() => {
        input.classList.remove("error");
        input.placeholder = input === inputPhone ? "Введите телефон +7..." : "Введите " + (input === inputName ? "имя" : "вакансию");
    }, 3000);
}
if (btnClearList) {
    btnClearList.addEventListener("click", deleteAllCandidates);
}
if (btnSearch) {
    btnSearch.addEventListener("click", () => {
        if (modal)
            modal.classList.add("active");
        if (searchPopup)
            searchPopup.classList.add("active");
    });
}
btnCloseModal.forEach(btn => {
    btn.addEventListener("click", () => {
        // Закрываем только modalEdit и modalTop, но не searchPopup
        if (modalEdit)
            modalEdit.classList.remove("active");
        if (modalTop)
            modalTop.classList.remove("active");
        if (modal)
            modal.classList.remove("active");
        // searchPopup закрывается только если не открыто окно редактирования
        if (!(modalEdit === null || modalEdit === void 0 ? void 0 : modalEdit.classList.contains("active")) && !(modalTop === null || modalTop === void 0 ? void 0 : modalTop.classList.contains("active"))) {
            if (searchPopup)
                searchPopup.classList.remove("active");
        }
    });
});
function deleteCandidate(candidateId) {
    for (let letter in candidatesData.allCandidates) {
        if (candidatesData.allCandidates[letter][candidateId]) {
            delete candidatesData.allCandidates[letter][candidateId];
            saveToLocalStorage();
            renderCandidates();
            return;
        }
    }
}
function editCandidate(candidateId) {
    let foundCandidate = null;
    let foundLetter = null;
    for (let letter in candidatesData.allCandidates) {
        if (candidatesData.allCandidates[letter][candidateId]) {
            foundCandidate = candidatesData.allCandidates[letter][candidateId];
            foundLetter = letter;
            break;
        }
    }
    if (!foundCandidate)
        return;
    // Добавляем active к searchPopupModalEdit при редактировании
    if (modalTop) {
        modalTop.classList.add("active");
    }
    if (modalEdit) {
        modalEdit.classList.add("active");
    }
    nameEdit.value = foundCandidate.name;
    vacancyEdit.value = foundCandidate.vacancy;
    phoneEdit.value = foundCandidate.phone;
    if (btnEditCandidate) {
        const editHandler = () => {
            const newName = nameEdit.value.trim();
            const newVacancy = vacancyEdit.value.trim();
            const newPhone = phoneEdit.value.trim();
            if (!newName || newName.length <= 3) {
                alert('Некорректное имя');
                return;
            }
            const newFirstLetter = newName[0].toUpperCase();
            if (!candidatesData.allCandidates.hasOwnProperty(newFirstLetter)) {
                alert('Используйте кириллицу');
                return;
            }
            if (!newVacancy || newVacancy.length <= 3) {
                alert("Некорректная вакансия");
                return;
            }
            if (!newPhone || newPhone.length < 11 || newPhone[0] !== '+') {
                alert("Некорректный телефон");
                return;
            }
            if (foundLetter !== newFirstLetter) {
                if (!foundLetter)
                    return;
                delete candidatesData.allCandidates[foundLetter][candidateId];
                foundCandidate.name = newName;
                foundCandidate.vacancy = newVacancy;
                foundCandidate.phone = newPhone;
                candidatesData.allCandidates[newFirstLetter][candidateId] = foundCandidate;
            }
            else {
                foundCandidate.name = newName;
                foundCandidate.vacancy = newVacancy;
                foundCandidate.phone = newPhone;
            }
            // Закрываем только окна редактирования
            if (modalEdit)
                modalEdit.classList.remove("active");
            if (modalTop)
                modalTop.classList.remove("active");
            saveToLocalStorage();
            renderCandidates();
            if (searchPopup && searchPopup.classList.contains('active') && searchCandidatesListResult) {
                renderSearchResults(searchCandidatesListResult.value);
            }
        };
        btnEditCandidate.onclick = editHandler;
    }
}
function deleteAllCandidates() {
    if (!confirm("Вы уверены, что хотите удалить всех кандидатов?"))
        return;
    for (let letter in candidatesData.allCandidates) {
        candidatesData.allCandidates[letter] = {};
    }
    saveToLocalStorage();
    renderCandidates();
}
function renderSearchResults(searchTerm = '') {
    if (!searchCandidatesList)
        return;
    searchCandidatesList.innerHTML = "";
    const allCandidates = getAllCandidates();
    const filteredCandidates = allCandidates.filter(candidate => candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.vacancy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filteredCandidates.length === 0) {
        const noResult = document.createElement('li');
        noResult.textContent = "Результаты не найдены";
        searchCandidatesList.appendChild(noResult);
        return;
    }
    filteredCandidates.forEach(candidate => {
        const candidateItem = document.createElement('li');
        const itemName = document.createElement("div");
        const itemVacancy = document.createElement("div");
        const itemPhone = document.createElement("a");
        itemName.textContent = `Имя: ${candidate.name}`;
        itemVacancy.textContent = `Вакансия: ${candidate.vacancy}`;
        itemPhone.textContent = `Телефон: ${candidate.phone}`;
        candidateItem.appendChild(itemName);
        candidateItem.appendChild(itemVacancy);
        candidateItem.appendChild(itemPhone);
        const btnDelete = document.createElement('button');
        btnDelete.classList.add("btnDelete");
        btnDelete.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        btnDelete.onclick = () => {
            deleteCandidate(candidate.id);
            saveToLocalStorage();
            renderCandidates();
            if (searchCandidatesListResult)
                renderSearchResults(searchCandidatesListResult.value);
        };
        const btnEdit = document.createElement("button");
        btnEdit.classList.add("btnEdit");
        btnEdit.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        btnEdit.onclick = () => {
            // При редактировании из поиска показываем оба модальных окна
            if (modal)
                modal.classList.add("active");
            editCandidate(candidate.id);
        };
        candidateItem.appendChild(btnDelete);
        candidateItem.appendChild(btnEdit);
        searchCandidatesList.appendChild(candidateItem);
    });
}
if (searchCandidatesListResult) {
    searchCandidatesListResult.addEventListener('input', function () {
        renderSearchResults(this.value);
    });
}
if (showAllCandidates) {
    showAllCandidates.addEventListener('click', () => {
        renderSearchResults();
    });
}
function getAllCandidates() {
    const allCandidates = [];
    for (let letter in candidatesData.allCandidates) {
        for (let candidateId in candidatesData.allCandidates[letter]) {
            allCandidates.push(candidatesData.allCandidates[letter][parseInt(candidateId)]);
        }
    }
    return allCandidates;
}
initCandidatesData();
renderCandidates();
