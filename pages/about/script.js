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
const searchInput =document.getElementById('searchInput')

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
searchInput.addEventListener('input', () => {
  //키워드라는 변수는 input값에 작성한걸 넣는건데 
  const keyword = searchInput.value.trim().toLowerCase();
  
  if (keyword === '') {
    // 검색어가 없으면 전체 목록 표시
    displayAllPosts();
  } else {
    // 검색어가 있으면 필터링된 결과 표시
    searchAndDisplayPosts(keyword);
  }
});

function searchAndDisplayPosts(keyword) {
  const userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
  
  // 제목 또는 내용에서 키워드 검색
  const filteredPosts = userAskList.filter(post => 
    post.title.toLowerCase().includes(keyword) ||
    post.detail.toLowerCase().includes(keyword)
  );
  
  displayPosts(filteredPosts, keyword);
}
//검색어를 일단 빈값으로 만들어서 따로 넘길 필요가없음
function displayPosts(posts, keyword = '') {
  //최종적으로 보여줄 HTMl문자열을 저장 빈문자열로 만든 이유는 나중에 +=로 추가할 예정
  let htmlContent = '';
  
  //표시할 글이 하나도 없으면
  if (posts.length === 0) {
    //일단 검색어가 있는지 확인
    htmlContent = keyword ? 
      //있으면 검색결과가 없다.
      `<p>"${keyword}" 검색 결과가 없습니다.</p>` : 
      //아예 내용자체가 없으면 글이 없다.
      '<p>작성된 글이 없습니다</p>';
    //만약에 글이 있으면
  } else {
    //돌면서 하이라이트 mark를 적용할건데
    posts.forEach((post) => {
      //있으면 그 검색어에 하이라이트 적용
      const highlightedTitle = keyword ? 
        //없으면 원래 제목 그대로 사용(내용과 겹치는 부분이 있을 수 있기 때문에)
        highlightKeyword(post.title, keyword) : post.title;
        
      //여기서 생성되는 HTML를 보여줄것 까봤더니 어 있네? 하면 그게 보여지는것
      htmlContent += `<div class="datail-List">
        <div class="listTitle detailModal" data-bs-toggle="modal"
          data-bs-target="#detailModal" onclick="showPostDetail(${post.id})">
          ${highlightedTitle}
        </div>
        <div class="list-RightBox">
          <div class="listAuthor">누군가</div>
          <div class="listTime">${getCalculateTime(post.date)}</div>
        </div>
      </div>`;
    });
  }
  //그렇게 추가가 된걸 디테일리스트에 추가
  detailList.innerHTML = htmlContent;
}

function displayAllPosts() {
  //가장 기본이 됨 일단 로컬스토리지에서 데이터를 가져와서
  const userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
  //보여줄 곳에 집어넣음(함수 리펙토링 한다고 생각하면 됨.)재사용성이 많은 코드이기에
  displayPosts(userAskList);
}

// 검색어 하이라이트 함수
function highlightKeyword(text, keyword) {
  //정규식 객체를 만들어서 그 안에 사용자가 입력한 값을 집어넣고
  //텍스트 전체(g)에서 대소문자 구분(i)없이 찾기
  const regex = new RegExp(`(${keyword})`, 'gi');
  //찾게 되면 HTML의 하이라이트 태그인 mark를 집어넣을건데 상단 정규식 
  //Keyword에 들어가있는 내용($1)을 찾겠다.
  return text.replace(regex, '<mark>$1</mark>');
  
}




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
      <div class="detail-box">내용 : ${selectedPost.detail}
      <div class="post-buttons">
        <button onclick="editPost(${selectedPost.id})" class="btn-modify">수정</button>
        <button onclick="deletePost(${selectedPost.id})" class="btn-delete">삭제</button>
      </div></div>
      
      <div class="answerBox"></div>
      <div class='answer-btn-Input'>
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
    <div class="answer-time">답글 작성: ${getCalculateTime(answer.date)}</div>
    <div class="answer-buttons">
      <button onclick="editAnswer(${answer.id}, ${postId})" class="btn-modify">수정</button>
      <button onclick="deleteAnswer(${answer.id}, ${postId})" class="btn-delete">삭제</button>
    </div>
  </div>`;
  });
  answerBox.innerHTML = answerHtml;
}

//메인 페이지에서 수정 삭제.
//질문 및 답변에서 질문, 답변 수정 삭제
//검색 할 때 관련 Q&A 서치할 수 있게 이벤트리스너 click으로 확인

function deletePost(postId) {
  if (confirm('정말로 삭제하시겠습니까?')) {
    // 질문 삭제
    let userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
    userAskList = userAskList.filter(post => post.id !== postId);
    localStorage.setItem('userAskList', JSON.stringify(userAskList));
    
    // 해당 질문의 답변들도 함께 삭제
    let answerList = JSON.parse(localStorage.getItem('answerList')) || [];
    answerList = answerList.filter(answer => answer.postId !== postId);
    localStorage.setItem('answerList', JSON.stringify(answerList));
    
    // 모달 닫고 페이지 새로고침
    bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    location.reload();
  }
}
let editingPostId = null; // 수정 중인 포스트 ID 저장

function editPost(postId) {
  const userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
  const post = userAskList.find(p => p.id === postId);
  
  if (post) {
    // 기존 값으로 채우기
    document.getElementById('input-Title').value = post.title;
    document.getElementById('input-Detail').value = post.detail;
    
    // 수정 모드 설정
    editingPostId = postId;
    document.querySelector('#exampleModalLabel').textContent = '질문 수정';
    document.querySelector('.saveBtn').textContent = '수정';
    
    // detailModal 닫고 writeModal 열기
    bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    new bootstrap.Modal(document.getElementById('writeModal')).show();
  }
}

writeSaveBtn.addEventListener('click', () => {
  if (qTitle.value.trim()) {
    let userAskList = JSON.parse(localStorage.getItem('userAskList')) || [];
    
    if (editingPostId) {
      // 수정 모드
      const postIndex = userAskList.findIndex(post => post.id === editingPostId);
      if (postIndex !== -1) {
        userAskList[postIndex].title = qTitle.value;
        userAskList[postIndex].detail = qDetail.value;
        userAskList[postIndex].editDate = new Date().toISOString();
      }
      editingPostId = null; // 수정 모드 해제
    } else {
      // 새 글 작성 모드
      let userAsk = {
        id: Date.now(),
        title: qTitle.value,
        detail: qDetail.value,
        date: new Date().toISOString(),
      };
      userAskList.unshift(userAsk);
    }
    
    localStorage.setItem('userAskList', JSON.stringify(userAskList));
    
    // 폼 초기화
    qTitle.value = '';
    qDetail.value = '';
    document.querySelector('#exampleModalLabel').textContent = '질문 작성';
    document.querySelector('.saveBtn').textContent = '저장';
    
    location.reload();
  }
});

function editAnswer(answerId, postId) {
  const answerList = JSON.parse(localStorage.getItem('answerList')) || [];
  const answer = answerList.find(a => a.id === answerId);
  
  if (answer) {
    const newContent = prompt('답변 수정:', answer.content);
    
    if (newContent && newContent.trim()) {
      // 배열에서 해당 답변 찾아서 수정
      const answerIndex = answerList.findIndex(a => a.id === answerId);
      answerList[answerIndex].content = newContent;
      answerList[answerIndex].editDate = new Date().toISOString();
      
      localStorage.setItem('answerList', JSON.stringify(answerList));
      displayAnswers(postId); // 답변 목록 다시 로드
    }
  }
}

function deleteAnswer(answerId, postId) {
  if (confirm('답변을 삭제하시겠습니까?')) {
    let answerList = JSON.parse(localStorage.getItem('answerList')) || [];
    answerList = answerList.filter(answer => answer.id !== answerId);
    
    localStorage.setItem('answerList', JSON.stringify(answerList));
    displayAnswers(postId); // 답변 목록 다시 로드
  }
}
function resetWriteModal() {
  editingPostId = null;
  document.getElementById('input-Title').value = '';
  document.getElementById('input-Detail').value = '';
  document.querySelector('#exampleModalLabel').textContent = '질문 작성';
  document.querySelector('.saveBtn').textContent = '저장';
}

// 글쓰기 버튼 클릭 시 모달 초기화
document.querySelector('.writeBtn').addEventListener('click', resetWriteModal);