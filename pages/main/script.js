//tooltip 나타내는 거
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);
//햔재 년도와 월을 저장할 변수
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
//달력 불러오는 함수
const getCalendar = async (year = currentYear, month = currentMonth) => {
  currentYear = year;
  currentMonth = month;
  //달력 화면 구성
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  document.getElementById("monthYear").textContent = `${year}년 ${month + 1}월`;
  const calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = "";

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      if (i === 0 && j < firstDay) {
        cell.textContent = "";
      } else if (date > lastDate) {
        cell.textContent = "";
      } else {
        cell.textContent = date;
        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          cell.classList.add("today");
        }
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
};
//이전달 버튼
document.getElementById("prevBtn").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentMonth--;
  }
  getCalendar(currentYear, currentMonth);
});
//다음달 버튼
document.getElementById("nextBtn").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentMonth++;
  }
  getCalendar(currentYear, currentMonth);
});
//모달 띄우는 함수
document.addEventListener("DOMContentLoaded", () => {
  const diaryBtn = document.getElementById("diaryBtn");
  const modal = document.getElementById("diaryModal");
  const closeModal = document.getElementById("closeModal");
  const saveDiary = document.getElementById("saveDiary");
  const diaryText = document.getElementById("diaryText");
  //달력 날짜 클릭 이벤트
  document.querySelector("#calendar").addEventListener("click", (e) => {
    if (e.target.tagName === "TD" && e.target.textContent.trim() !== "") {
      modal.style.display = "flex";
    }
  });
  //일기장 버튼 클릭
  diaryBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  //닫기 버튼
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  //저장 버튼
  saveDiary.addEventListener("click", () => {
    const content = diaryText.value.trim();
    if (content) {
      alert("일기가 저장되었습니다: " + content);
      diaryText.value = "";
      modal.style.display = "none";
    } else {
      alert("내용을 입력해주세요!");
    }
  });
});
//getCalendar 함수 실행
getCalendar();
