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
let currentImages = []; //현재 편집 중인 이미지들

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
  const diaries = loadDiaries();
  const dateKey = `${year}-${month + 1}-${day}`;
  return diaries[dateKey] || { content: "", images: [] };
};

//특정 날짜에 일기 저장하기
const saveDiaryData = (year, month, day, content, images = []) => {
  const diaries = loadDiaries();
  const dateKey = `${year}-${month + 1}-${day}`;
  if (content.trim() === "" && images.length === 0) {
    delete diaries[dateKey];
  } else {
    diaries[dateKey] = { content, images };
  }
  saveDiaries(diaries);
};

//일기가 있는 날짜인지 확인
const hasDiary = (year, month, day) => {
  const diary = getDiary(year, month, day);
  return (
    (diary.content && diary.content.trim() !== "") ||
    (diary.images && diary.images.length > 0)
  );
};

//이미지가 있는 일기만링
const getDiariesWithImages = () => {
  const diaries = loadDiaries();
  const diariesWithImages = {};

  Object.entries(diaries).forEach(([dateKey, diary]) => {
    if (diary.images && diary.images.length > 0) {
      diariesWithImages[dateKey] = diary;
    }
  });

  return diariesWithImages;
};

//이미지 파일을 base64로 변환
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

//이미지 미리보기 렌더링
const renderImagePreview = (images, isReadOnly = false) => {
  const previewContainer = document.getElementById("imagePreview");
  previewContainer.innerHTML = "";

  images.forEach((image, index) => {
    const previewItem = document.createElement("div");
    previewItem.className = "image-preview-item";

    const img = document.createElement("img");
    img.src = image;
    img.alt = "Diary Image";

    if (!isReadOnly) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "image-preview-remove";
      removeBtn.innerHTML = "×";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        currentImages.splice(index, 1);
        renderImagePreview(currentImages, false);
      };
      previewItem.appendChild(removeBtn);
    }

    previewItem.appendChild(img);
    previewContainer.appendChild(previewItem);
  });
};

//이미지 확대 모달
const openImageModal = (imageSrc) => {
  let imageModal = document.getElementById("imageModal");
  if (!imageModal) {
    imageModal = document.createElement("div");
    imageModal.id = "imageModal";
    imageModal.className = "image-modal";
    imageModal.onclick = () => (imageModal.style.display = "none");
    document.body.appendChild(imageModal);
  }

  imageModal.innerHTML = `<img src="${imageSrc}" alt="Expanded Image" />`;
  imageModal.style.display = "flex";
};

//모달 안에 버튼 제어 함수
const showButtons = (buttonIds) => {
  const allButtons = ["editDiary", "deleteDiary", "saveDiary", "addImageBtn"];
  allButtons.forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add("hidden");
  });
  buttonIds.forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.remove("hidden");
  });
};

//달력 불러오는 함수
const getCalendar = async (year = currentYear, month = currentMonth) => {
  currentYear = year;
  currentMonth = month;
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
        if (hasDiary(year, month, date)) {
          cell.classList.add("has-diary");
          cell.title = "일기 쓴 날";
        }
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

//일기 리스트 렌더링 함수
const renderDiaryList = () => {
  const diaryListContainer = document.getElementById("diary-list");
  const diaries = loadDiaries();
  const entries = Object.entries(diaries);

  if (entries.length === 0) {
    diaryListContainer.innerHTML =
      '<div class="no-diary-message">작성한 일기가 없습니다.</div>';
    return;
  }

  entries.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  let html = "";
  entries.forEach(([dateKey, diary]) => {
    const [year, month, day] = dateKey.split("-");
    const displayDate = `${year}년 ${month}월 ${day}일`;
    const content = typeof diary === "string" ? diary : diary.content || "";
    const preview =
      content.length > 20 ? content.substring(0, 20) + "..." : content;

    html += `
            <div class="diary-item" onclick="openDiaryModal('${dateKey}')">
              <div class="diary-item-date">${displayDate}</div>
              <div class="diary-item-preview">${preview || "내용 없음"}</div>
            </div>
          `;
  });

  diaryListContainer.innerHTML = html;
};

//사진첩 렌더링 함수
const renderGallery = () => {
  const galleryContainer = document.getElementById("gallery-list");
  const diariesWithImages = getDiariesWithImages();
  const entries = Object.entries(diariesWithImages);

  const totalImages = entries.reduce(
    (total, [, diary]) => total + diary.images.length,
    0
  );
  document.querySelector(".counter span").textContent = totalImages;

  if (entries.length === 0) {
    galleryContainer.innerHTML =
      '<li><div style="text-align: center; color: #666; padding: 50px;">이미지가 있는 일기가 없습니다.</div></li>';
    return;
  }

  entries.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  let html = "";
  entries.forEach(([dateKey, diary]) => {
    if (diary.images && diary.images.length > 0) {
      const [year, month, day] = dateKey.split("-");
      const displayDate = `${year}년 ${month}월 ${day}일`;
      const content = diary.content || "";
      const preview =
        content.length > 20
          ? content.substring(0, 20) + "..."
          : content || "내용 없음";

      diary.images.forEach((image) => {
        html += `
                <li class="gallery-item" onclick="openDiaryModal('${dateKey}')">
                  <figure>
                    <img class="gallery-img" src="${image}" alt="Diary Image" />
                    <figcaption>
                      <p>${preview}</p>
                      <p>${displayDate}</p>
                    </figcaption>
                  </figure>
                </li>
              `;
      });
    }
  });

  galleryContainer.innerHTML = html;
  updateGallerySearch();
};

//갤러리 검색 기능 업데이트
const updateGallerySearch = () => {
  const searchInput = document.querySelector('input[type="search"]');
  const photosCounter = document.querySelector(".toolbar .counter span");

  searchInput.onkeyup = function () {
    const imageListItems = document.querySelectorAll(".image-list li");
    const captions = document.querySelectorAll(
      ".image-list figcaption p:first-child"
    );
    const dNone = "d-none";

    for (const item of imageListItems) {
      item.classList.add(dNone);
    }

    const keywords = this.value.toLowerCase();
    let visibleCount = 0;

    captions.forEach((caption, index) => {
      if (caption.textContent.toLowerCase().includes(keywords)) {
        const listItem = caption.closest("li");
        if (listItem) {
          listItem.classList.remove(dNone);
          visibleCount++;
        }
      }
    });

    photosCounter.textContent = visibleCount;
  };
};

//특정 일기를 모달로 여는 함수
const openDiaryModal = (dateKey) => {
  const [year, month, day] = dateKey.split("-");
  const modal = document.getElementById("diaryModal");
  const modalTitle = document.getElementById("modalTitle");
  const diaryText = document.getElementById("diaryText");

  selectedDate = {
    year: parseInt(year),
    month: parseInt(month) - 1,
    day: parseInt(day),
  };
  const diary = getDiary(
    selectedDate.year,
    selectedDate.month,
    selectedDate.day
  );

  const diaryData =
    typeof diary === "string" ? { content: diary, images: [] } : diary;

  diaryText.value = diaryData.content || "";
  currentImages = [...(diaryData.images || [])];
  modalTitle.textContent = `${year}년 ${month}월 ${day}일 일기`;

  if (
    (diaryData.content && diaryData.content.trim() !== "") ||
    (diaryData.images && diaryData.images.length > 0)
  ) {
    isEditMode = false;
    diaryText.disabled = true;
    renderImagePreview(currentImages, true);
    showButtons(["editDiary", "deleteDiary"]);
  } else {
    isEditMode = true;
    diaryText.disabled = false;
    currentImages = [];
    renderImagePreview(currentImages, false);
    showButtons(["saveDiary", "addImageBtn"]);
  }

  const modalContent = modal.querySelector(".modal-content");
  if (currentImages.length > 0) {
    modalContent.classList.add("modal-content-with-image");
  } else {
    modalContent.classList.remove("modal-content-with-image");
  }

  modal.style.display = "flex";
  if (!diaryText.disabled) {
    diaryText.focus();
  }
};

//이전 버튼
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
  const calendarContent = document.getElementById("calendar-content");
  const diaryContent = document.getElementById("diary-content");
  const galleryContent = document.getElementById("gallery-content");
  const calendarBtn = document.getElementById("calendarBtn");
  const diaryBtn = document.getElementById("diaryBtn");
  const galleryBtn = document.getElementById("galleryBtn");
  const navIcons = document.querySelectorAll(".nav-icon");
  const modal = document.getElementById("diaryModal");
  const editBtn = document.getElementById("editDiary");
  const deleteBtn = document.getElementById("deleteDiary");
  const saveDiaryBtn = document.getElementById("saveDiary");
  const closeModal = document.getElementById("closeModal");
  const diaryText = document.getElementById("diaryText");
  const addImageBtn = document.getElementById("addImageBtn");
  const imageUpload = document.getElementById("imageUpload");

  addImageBtn.addEventListener("click", () => {
    imageUpload.click();
  });

  imageUpload.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        try {
          const base64 = await convertToBase64(file);
          currentImages.push(base64);
          renderImagePreview(currentImages, false);
        } catch (error) {
          console.error("이미지 변환 실패:", error);
          alert("이미지 변환에 실패했습니다.");
        }
      }
    }

    e.target.value = "";
  });

  const openModal = (year, month, day) => {
    const modalTitle = document.getElementById("modalTitle");
    if (year != null && month != null && day != null) {
      selectedDate = { year, month, day };
      const diary = getDiary(year, month, day);
      const diaryData =
        typeof diary === "string" ? { content: diary, images: [] } : diary;

      diaryText.value = diaryData.content || "";
      currentImages = [...(diaryData.images || [])];
      modalTitle.textContent = `${year}년 ${month + 1}월 ${day}일 일기`;

      if (
        (diaryData.content && diaryData.content.trim() !== "") ||
        (diaryData.images && diaryData.images.length > 0)
      ) {
        isEditMode = false;
        diaryText.disabled = true;
        renderImagePreview(currentImages, true);
        showButtons(["editDiary", "deleteDiary"]);
      } else {
        isEditMode = true;
        diaryText.disabled = false;
        currentImages = [];
        renderImagePreview(currentImages, false);
        showButtons(["saveDiary", "addImageBtn"]);
      }
    } else {
      const today = new Date();
      selectedDate = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
      };
      const diary = getDiary(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day
      );
      const diaryData =
        typeof diary === "string" ? { content: diary, images: [] } : diary;

      diaryText.value = diaryData.content || "";
      currentImages = [...(diaryData.images || [])];
      modalTitle.textContent = "오늘의 일기";

      if (
        (diaryData.content && diaryData.content.trim() !== "") ||
        (diaryData.images && diaryData.images.length > 0)
      ) {
        isEditMode = false;
        diaryText.disabled = true;
        renderImagePreview(currentImages, true);
        showButtons(["editDiary", "deleteDiary"]);
      } else {
        isEditMode = true;
        diaryText.disabled = false;
        currentImages = [];
        renderImagePreview(currentImages, false);
        showButtons(["saveDiary", "addImageBtn"]);
      }
    }

    const modalContent = modal.querySelector(".modal-content");
    if (currentImages.length > 0) {
      modalContent.classList.add("modal-content-with-image");
    } else {
      modalContent.classList.remove("modal-content-with-image");
    }

    modal.style.display = "flex";
    if (!diaryText.disabled) {
      diaryText.focus();
    }
  };

  //사이드 네비게이션 이벤트
  calendarBtn.addEventListener("click", () => {
    galleryContent.classList.add("hidden");
    diaryContent.classList.add("hidden");
    calendarContent.classList.remove("hidden");
    navIcons.forEach((icon) => icon.classList.remove("active"));
    calendarBtn.classList.add("active");
  });

  diaryBtn.addEventListener("click", () => {
    calendarContent.classList.add("hidden");
    galleryContent.classList.add("hidden");
    diaryContent.classList.remove("hidden");
    navIcons.forEach((icon) => icon.classList.remove("active"));
    diaryBtn.classList.add("active");
    renderDiaryList();
  });

  galleryBtn.addEventListener("click", () => {
    calendarContent.classList.add("hidden");
    diaryContent.classList.add("hidden");
    galleryContent.classList.remove("hidden");
    navIcons.forEach((icon) => icon.classList.remove("active"));
    galleryBtn.classList.add("active");
    renderGallery();
  });

  //달력 날짜 클릭 이벤트
  document.querySelector("#calendar").addEventListener("click", (e) => {
    if (e.target.tagName === "TD" && e.target.textContent.trim() !== "") {
      const day = parseInt(e.target.textContent);
      openModal(currentYear, currentMonth, day);
    }
  });

  //수정버튼
  editBtn.addEventListener("click", () => {
    isEditMode = true;
    diaryText.disabled = false;
    renderImagePreview(currentImages, false);
    showButtons(["saveDiary", "addImageBtn"]);
    diaryText.focus();
  });

  //삭제버튼
  deleteBtn.addEventListener("click", () => {
    if (!selectedDate) return;

    const { year, month, day } = selectedDate;
    const confirmDelete = confirm(
      `${year}년 ${month + 1}월 ${day}일 일기를 삭제하시겠습니까?`
    );

    if (confirmDelete) {
      saveDiaryData(year, month, day, "", []);
      alert(`${year}년 ${month + 1}월 ${day}일 일기가 삭제되었습니다`);

      modal.style.display = "none";
      selectedDate = null;
      isEditMode = false;
      currentImages = [];
      getCalendar(currentYear, currentMonth);
      renderDiaryList();
      renderGallery();
    }
  });

  //저장버튼
  saveDiaryBtn.addEventListener("click", () => {
    if (!selectedDate) return;
    const content = diaryText.value.trim();
    const { year, month, day } = selectedDate;
    saveDiaryData(year, month, day, content, currentImages);

    if (content || currentImages.length > 0) {
      alert(`${year}년 ${month + 1}월 ${day}일 일기가 저장되었습니다`);
      isEditMode = false;
      diaryText.disabled = true;
      renderImagePreview(currentImages, true);
      showButtons(["editDiary", "deleteDiary"]);
    } else {
      alert(`${year}년 ${month + 1}월 ${day}일 일기가 삭제되었습니다`);
      modal.style.display = "none";
      selectedDate = null;
      isEditMode = false;
      currentImages = [];
    }

    getCalendar(currentYear, currentMonth);
    renderDiaryList();
    renderGallery();
  });

  //닫기버튼
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    selectedDate = null;
    isEditMode = false;
    currentImages = [];
    const modalContent = modal.querySelector(".modal-content");
    modalContent.classList.remove("modal-content-with-image");
  });
});

getCalendar();

//사진첩 뷰 옵션
const imageList = document.querySelector(".image-list");
const btns = document.querySelectorAll(".view-options button");
const active = "active";
const listView = "list-view";
const gridView = "grid-view";
const dNone = "d-none";

//버튼을 클릭 시 그 버튼에 active를 줌
for (const btn of btns) {
  btn.addEventListener("click", function () {
    const parent = this.parentElement;
    document.querySelector(".view-options .active").classList.remove(active);
    parent.classList.add(active);

    if (parent.classList.contains("show-list")) {
      parent.previousElementSibling.previousElementSibling.classList.add(dNone);
      imageList.classList.remove(gridView);
      imageList.classList.add(listView);
    } else {
      parent.previousElementSibling.classList.remove(dNone);
      imageList.classList.remove(listView);
      imageList.classList.add(gridView);
    }
  });
}

//리스트 너비 조절 범위
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.addEventListener("input", function () {
  document.documentElement.style.setProperty(
    "--minRangeValue",
    `${this.value}px`
  );
});
