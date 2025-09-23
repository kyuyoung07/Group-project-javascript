//tooltip 나타내는 거
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);
//달력api
const API_KEY = `AIzaSyCwvL765tm73jvp8l3Nln1XCMWATMcUH8s`;
const CALENDAR_ID = "ko.south_korea#holiday@group.v.calendar.google.com"; // 한국 공휴일 캘린더
const timeMin = new Date().toISOString(); // 현재 시간 이후 일정만 가져오기
const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  CALENDAR_ID
)}/events?key=${API_KEY}`;
//달력 불러오는 함수
const getCalendar = async () => {
  try {
    // 1. API 호출
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
    const data = await response.json();
    console.log("API 호출 성공:", data); //데이터 확인용

    // 2. 달력 화면 구성
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    document.getElementById("monthYear").textContent = `${year}년 ${month + 1}월`;
    const calendarBody = document.getElementById("calendar-body");
    calendarBody.innerHTML = "";

    let date = 1;
    for (let i = 0; i < 6; i++) { // 최대 6주
      const row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (date > lastDate) {
          cell.textContent = "";
        } else {
          cell.textContent = date;
          if (date === today.getDate()) cell.classList.add("today");
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }

  } catch (error) {
    console.error("달력api 불러오기 실패:", error);
  }
};

getCalendar();
