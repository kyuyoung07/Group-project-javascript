document.querySelector("#joinMember").addEventListener("submit", e => {
    e.preventDefault();

    // 입력값 존재 검사 함수
    function validateInput(selector, errorSelector, message) {
        const value = document.querySelector(selector).value.trim();
        if (value.length === 0) {
            document.querySelector(errorSelector).textContent = message;
            return false;
        } else {
            document.querySelector(errorSelector).textContent = ""; // 에러 없을 때 초기화
            return true;
        }
    }

    // 각 필드별로 호출
    const isIdValid = validateInput("#userId", ".errorMessage-id", "* 아이디를 입력해 주세요.");
    const isPwValid = validateInput("#userPassword", ".errorMessage-pw", "* 비밀번호를 입력해 주세요.");
    const isReValid = validateInput("#userPassword-Re", ".errorMessage-re", "* 비밀번호를 입력해 주세요.");
    const isEmailValid = validateInput("#userEmail", ".errorMessage-email", "* 이메일을 입력해 주세요.");
    const isTelValid = validateInput("#userTel", ".errorMessage-tel", "* 연락처를 입력해 주세요.");

    //성별 체크 검사
  function validateGender() {
        const genderValue = document.querySelector("#gender").value;
        if (genderValue === "male" || genderValue === "female") {
            document.querySelector(".errorMessage-gender").textContent = "";
            return true;
        } else {
            document.querySelector(".errorMessage-gender").textContent = "* 성별을 선택해 주세요.";
            return false;
        }
    }
    const isGenderValid = validateGender();


//비밀번호 확인 검사 함수
    function confirmPw() {
    let pw = document.querySelector("#userPassword").value.trim();
    console.log(pw);
    let pwRe = document.querySelector("#userPassword-Re").value.trim();
    console.log(pwRe);

    if (pw !== pwRe) {
        document.querySelector(".errorMessage-re").textContent = "* 비밀번호가 일치하지 않습니다.";
        return false;
    } else {
        document.querySelector(".errorMessage-re").textContent = "";
        return true;
    }
  }
  const isConfirmPwValid = confirmPw();

  //아이디 영어, 숫자, 특수문자 형식 검사
  function regExpId(regExp) {
     if(!regExp.test(document.querySelector("#userId").value.trim())) {
        document.querySelector(".errorMessage-id").textContent = "* 영어, 숫자, 특수문자 조합으로 작성해 주세요."
        return false;
    } else {
          document.querySelector(".errorMessage-id").textContent = "";
          return true;
    }
  }
  const regExpIdValid = regExpId(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]+$/);


  //핸드폰 번호 형식 검사
  function regExpCellphone (regExp) {
    const value = document.querySelector("#userTel").value.trim();
    // 먼저 빈 값 확인
    if (value.length === 0) {
        return false; // validateInput에서 이미 메시지를 처리했으므로 그대로 리턴
    }

    if(!regExp.test(document.querySelector("#userTel").value.trim())) {
        document.querySelector(".errorMessage-tel").textContent = "* 핸드폰 번호 형식이 아닙니다."
        return false;
    } else {
          document.querySelector(".errorMessage-tel").textContent = "";
          return true;
    }

  }
  const regExpCellValid = regExpCellphone(/^01[016789]-\d{3,4}-\d{4}$/);




    //체크박스 검사 : 가장 나중에 해야 함, 전송막는 return 이 있기 때문에
    if (!checkBox.checked) {
    document.querySelector(".errorMessage-check").textContent = "* 체크해 주세요";
    return; // 전송 막음
  }
 

    // 모두 통과했을 때만 처리
    if (isIdValid && isPwValid && isReValid && isEmailValid && isTelValid && isGenderValid
        && isConfirmPwValid && regExpCellValid && regExpIdValid
    ) {
       e.curentTarget.submit();
    }
});



//입력창에 focus했을때 에러메세지 지우기
function focus(selector, errorSelector) {
    document.querySelector(selector).addEventListener("focus", () => {
        document.querySelector(errorSelector).textContent = "";
    })
}
focus("#userId", ".errorMessage-id");
focus("#userPassword", ".errorMessage-pw");
focus("#userPassword-Re", ".errorMessage-re");
focus("#userEmail", ".errorMessage-email");
focus("#userTel", ".errorMessage-tel");
focus("#gender", ".errorMessage-gender");

//체크 박스에 change이벤트
const checkBox = document.querySelector("#check1");
checkBox.addEventListener("change", () => {
  if (checkBox.checked) {
    document.querySelector(".errorMessage-check").textContent = "";   
  } else {
    document.querySelector(".errorMessage-check").textContent = "* 체크해 주세요"; 
  }
});
