//글쓰기 버튼 누르면 이동하는 것과 검색 기능, 동적으로 하단의 메뉴들 정보 저장
//로컬스토리지 함수를 사용하여 로컬에 값을 저장하고 그 값을 꺼내와 title이라는 객체로 저장해 그 title값을 제목란에 보여주기
//작성시간과 글쓴이는 어떻게 할지 고민중
const qTitle = document.getElementById('input-Title');
const qDetail = document.getElementById('input-Detail');
const writeSaveBtn = document.querySelector('.saveBtn');
const detailList = document.querySelector('#detail');
const AskModalBtn = document.querySelector('.listTitle');
const detailBtn = document.querySelector('.detailModal');
const modalBody = document.querySelector('.detailBody');

//로컬스토리지 겟 아이템은 항상 문자열을 반환하기에 우리가 쓸 수 있는 값으로 반환 parse를 사용
const userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];

function getCalculateTime(dateString) {
  // 날짜가 없거나 유효하지 않으면 "방금 전" 반환
  if (!dateString) return '방금 전';

  //현재 시간 저장
  const now = new Date();
  //과거 시간 저장
  const past = new Date(dateString);

  //두 개의 시간을 빼면 ms 단위의 차이가 나옴 그래서 나눠서 밀리초를 s로 변환
  //그런데 소수점을 버림 2.5초 라면 .5초를 버림
  const differntTime = Math.floor((now - past) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (differntTime < minute) {
    return '방금 전';
  } else if (differntTime < hour) {
    const minutes = Math.floor(differntTime / minute);
    return `${minutes}분전`;
  } else if (differntTime < day) {
    const hours = Math.floor(differntTime / hour);
    return `${hours}시간전`;
  } else {
    const days = Math.floor(differntTime / day);
    return `${days}일전`;
  }
}

if (userAskList.length > 0) {
  let htmlContent = '';
  userAskList.forEach((post) => {
    htmlContent += `<div class="datail-List" >
            <div class="listTitle detailModal" data-bs-toggle="modal"
          data-bs-target="#detailModal" onclick="showPostDetail(${post.id})">${
      post.title
    }</div>
            <div class="list-RightBox">
              <div class="listAuthor">누군가</div>
              <div class="listTime">${getCalculateTime(post.date)}</div>
            </div>
          </div>`;
  });
  detailList.innerHTML = htmlContent;
} else {
  detailList.innerHTML = '<p>작성된 글이 없습니다</p>';
}

writeSaveBtn.addEventListener('click', () => {
  if (qTitle.value.trim()) {
    let lastPost = JSON.parse(localStorage.getItem('userAskList')) || [];

    let userAsk = {
      id: Date.now(),
      title: qTitle.value,
      detail: qDetail.value,
      date: new Date().toISOString(),
    };
    //배열에 맨 앞에 요소를 추가
    lastPost.unshift(userAsk);

    //로컬 스토리지는 문자열만 저장가능하기에 그걸 집어넣어놓고
    localStorage.setItem('userAskList', JSON.stringify(lastPost));
    location.reload();
  } else {
    alert('제목과 내용을 입력해주세요');
  }
});

function showPostDetail(postId) {
  //로컬스토리지로 인해서 객체를 문자열로 반환해서 사용하는데
  //parse를 이용해 문자열을 객체로 다시 변환해 사용한다.
  const userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
  //내 객체들을 찾아라 post를 post는 배열의 각요소를 하나씩 받아오는 역할임.
  //그리고 그 객체들의 id값이 내가 받아온 id값과 같으면 변수에 저장해라.
  const selectedPost = userAskList.find((post) => post.id === postId);

  //그 변수에 저장이 됐다는거는 일치하는 아이디를 찾았다는 것
  //아이디를 찾았으면
  if (selectedPost) {
    //내가 원하는 부분을 고르고

    //그 곳에 innerHTML을 넣을건데
    //셀렉트 포스트가 들어가는 이유는 결국 맞는 값을 받아왔기에 if문이 생성되는거라
    //그냥 그 selectPost의 title과 date detail 객체를 받아와서 넣어라
    modalBody.innerHTML = `
      <div class="detail-title">${selectedPost.title}</div>
      <div class="detail-time-Author">
        <span>글쓴이: 누군가</span>
        <span>작성 시간: ${getCalculateTime(selectedPost.date)}</span>
      </div>
      <div class="detail-box">내용 : ${selectedPost.detail}</div>
      <div class="answerBox"></div>
      <div>
        <input type="text" placeholder="답변달기" class='answerInput'/>
        <button type="submit" class='answerBtn'>답변</button>
      </div>
    `;
    displayAnswers(postId);
  }
  const answerBtn = document.querySelector('.answerBtn');
  const answerInput = document.querySelector('.answerInput');

  answerBtn.addEventListener('click', () => {
    if (answerInput.value.trim()) {
      const answerList = JSON.parse(localStorage.getItem('answerList')) || [];

      const newAnswer = {
        id: Date.now(),
        postId: postId,
        content: answerInput.value,
        date: new Date().toISOString(),
      };
      answerList.push(newAnswer);
      localStorage.setItem('answerList', JSON.stringify(answerList));
      answerInput.value = '';
      displayAnswers(postId);
    } else {
      alert('답변을 입력해주세요');
    }
  });
}
function displayAnswers(postId) {
  const answerBox = document.querySelector('.answerBox');
  const answerList = JSON.parse(localStorage.getItem('answerList')) || [];

  //현재 게시글에 id값과 내 현재 작성하고 있는 id값이 같은지 확인 결국 id값이 같고 그 곳에 내가 작성 중인가 확인
  const postAnswers = answerList.filter((answer) => answer.postId === postId);
  //값이 들어갈 저장소
  let answerHtml = '';
  postAnswers.forEach((answer) => {
    answerHtml += `<div class="answer-item">
        <div class="answer-content">${answer.content}</div>
        <div class="answer-time">답글 작성: ${getCalculateTime(
          answer.date
        )}</div>
      </div>
    `;
  });
  answerBox.innerHTML = answerHtml;
}

//메인 페이지에서 수정 삭제. 
//질문 및 답변에서 질문, 답변 수정 삭제