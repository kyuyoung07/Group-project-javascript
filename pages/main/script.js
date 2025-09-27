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
let selectedDate = null; //선택된 날짜를 저장할 변수
let isEditMode = false; //수정 모드 상태를 저장할 변수

//로컬저장소에서 일기 데이터 불러오기
const loadDiaries = () => {
  const saved = localStorage.getItem("diaries");
  return saved ? JSON.parse(saved) : {};
};

//로컬저장소에 일기 데이터 저장하기
const saveDiaries = (diaries) => {
  localStorage.setItem("diaries", JSON.stringify(diaries));
};

//특정 날짜에 일기 불러오기
const getDiary = (year, month, day) => {
  //기존 일기 불러오기
  const diaries = loadDiaries();
  //날짜 키 만들기
  const dateKey = `${year}-${month + 1}-${day}`;
  //해당 날짜에 일기가 있으면 반환, 없으면 빈 문자열
  return diaries[dateKey] || "";
};

//특정 날짜에 일기 저장하기
const saveDiaryData = (year, month, day, content) => {
  const diaries = loadDiaries();
  const dateKey = `${year}-${month + 1}-${day}`;
  if (content.trim() === "") {
    //내용이 없으면 삭제
    delete diaries[dateKey];
  } else {
    //내용이 있다면 저장
    diaries[dateKey] = content;
  }
  //변경된 데이터를 다시 저장
  saveDiaries(diaries);
};

//일기가 있는 날짜인지 확인
const hasDiary = (year, month, day) => {
  const diaries = loadDiaries();
  const dateKey = `${year}-${month + 1}-${day}`;
  return diaries[dateKey] && diaries[dateKey].trim() !== "";
};

//모달 안에 버튼 제어 함수
const showButtons=(buttonIds)=>{
  //닫기 버튼을 제외한 모든 모달 버튼 숨기기
  const allButtons=['editDiary','deleteDiary', 'saveDiary'];
  allButtons.forEach(btnId=>{
    const btn=document.getElementById(btnId);
    if(btn) btn.classList.add('hidden');
  });
  //필요한 버튼만 보이기
  buttonIds.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.remove('hidden');
  });
}

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
        //일기가 있는 날짜 표시
        if (hasDiary(year, month, date)) {
          cell.classList.add("has-diary");
          cell.title = "일기 쓴 날";
        }
        //오늘 날짜 표시
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
    currentYear--;
  }
  getCalendar(currentYear, currentMonth);
});

//다음달 버튼
document.getElementById("nextBtn").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  getCalendar(currentYear, currentMonth);
});

//모달&버튼 이벤트 관리
document.addEventListener("DOMContentLoaded", () => {
  const diaryBtn = document.getElementById("diaryBtn");
  const modal = document.getElementById("diaryModal");
  const editBtn=document.getElementById("editDiary");
  const deleteBtn = document.getElementById("deleteDiary");
  const saveDiaryBtn = document.getElementById("saveDiary");
  const closeModal = document.getElementById("closeModal");
  const diaryText = document.getElementById("diaryText");
  //모달 열기 함수
  const openModal = (year, month, day) => {
    //모달 제목 변수 선언
    const modalTitle=document.getElementById("modalTitle")
    if (year!=null && month!=null && day!=null) {
    //특정 날짜가 있다면
    //선택된 날짜를 객체로 저장
    selectedDate = { year, month, day };
    //기존 일기 불러오기
    const existingDiary=getDiary(year, month, day);
    //입력창에 기존 일기 내용 넣기
    diaryText.value=existingDiary;
    modalTitle.textContent = `${year}년 ${month + 1}월 ${day}일 일기`;

    if(existingDiary.trim()!== ""){
      //읽기모드: 쓰기 안됨+수정, 삭제버튼만
      isEditMode = false;
        diaryText.disabled = true;
        showButtons(['editDiary', 'deleteDiary']);
    }else{
      //수정모드: 쓰기 됨+저장 버튼만
      isEditMode = true;
        diaryText.disabled = false;
        showButtons(['saveDiary']);
      }
    } else {
      //특정 날짜가 없다면
      //오늘 날짜 구하기
      const today = new Date();
      selectedDate = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
      };
      const todayDiary = getDiary(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day
      );
      //오늘 일기 불러오기
      diaryText.value = todayDiary;
      modalTitle.textContent = "오늘의 일기";

      if(todayDiary.trim()!==""){
        //읽기모드: 쓰기 안됨+수정, 삭제 버튼만
        isEditMode = false;
        diaryText.disabled = true;
        showButtons(['editDiary', 'deleteDiary']);
      }else{
        //수정모드: 쓰기 됨+저장 버튼만
        isEditMode = true;
        diaryText.disabled = false;
        showButtons(['saveDiary']);
      }
    }
    //모달창 보여주기
    modal.style.display="flex";
    if(!diaryText.disabled){
    //입력창에 커서 놓기
    diaryText.focus();
    }
  };

  //달력 날짜 클릭 이벤트
  document.querySelector("#calendar").addEventListener("click", (e) => {
    if (e.target.tagName === "TD" && e.target.textContent.trim() !== "") {
      const day=parseInt(e.target.textContent);
      openModal(currentYear, currentMonth, day);
    }
  });

  //일기장 버튼 클릭(오늘 날짜)
  diaryBtn.addEventListener("click", () => {
    //오늘 날짜로 모달 열기
    openModal();
  });

  //수정 버튼
  editBtn.addEventListener("click",()=>{
    //수정모드: 쓰기 됨+저장 버튼만
    isEditMode=true;
    diaryText.disabled=false;
    showButtons(['saveDiary']);
    //입력창에 커서 놓기
    diaryText.focus();
  });

  //삭제 버튼
  deleteBtn.addEventListener("click",()=>{
    if(!selectedDate) return;

    const{year, month, day }=selectedDate;
    const confirmDelete=confirm(`${year}년 ${month+1}월 ${day}일 일기를 삭제하시겠습니까?`);

    if(confirmDelete){
      saveDiaryData(year, month, day, "");
      alert(`${year}년 ${month+1}월 ${day}일 일기가 삭제되었습니다`);

      modal.style.display="none";
      selectedDate=null;
      isEditMode=false;
      getCalendar(currentYear, currentMonth);
    }
  });

  //저장 버튼
  saveDiaryBtn.addEventListener("click", () => {
    //선택된 날짜 없으면 종료
    if(!selectedDate) return;
    //입력된 내용 공백 제거
    const content = diaryText.value.trim();
    //날짜 정보 추출
    const {year, month, day}=selectedDate;
    //일기 저장
    saveDiaryData(year, month, day, content);
    if (content) {
      //내용 있으면
      alert(`${year}년 ${month+1}월 ${day}일 일기가 저장되었습니다`);
      //저장 후 읽기 모드로 전환
      isEditMode = false;
      diaryText.disabled = true;
      showButtons(['editDiary', 'deleteDiary']);
    } else {
      //내용 없으면
      alert(`${year}년 ${month+1}월 ${day}일 일기가 삭제되었습니다`);
      //삭제 후 초기화
      modal.style.display = "none";
      selectedDate = null;
      isEditMode = false;
    }

    //달력 다시 그리기
    getCalendar(currentYear, currentMonth);
  });

  //닫기 버튼
  closeModal.addEventListener("click", () => {
    //초기화
    modal.style.display = "none";
    selectedDate=null;
    isEditMode = false;
  });
  
});

//getCalendar 함수 실행
getCalendar();
