//id
// 1. 아이디 입력창 정보 가져오기
let elInputUsername = document.querySelector('#username'); // input#username
// 2. 성공 메시지 정보 가져오기
let elSuccessMessage = document.querySelector('.success-message'); // div.success-message.hide
// 3. 실패 메시지 정보 가져오기 (글자수 제한 4~12글자)
let elFailureMessage = document.querySelector('.failure-message'); // div.failure-message.hide
// 4. 실패 메시지2 정보 가져오기 (영어 또는 숫자)
let elFailureMessageTwo = document.querySelector('.failure-message2'); // div.failure-message2.hide

//password
// 1. 비밀번호 입력창 정보 가져오기
let elInputPassword = document.querySelector('#password'); // input#password
// 2. 비밀번호 확인 입력창 정보 가져오기
let elInputPasswordRetype = document.querySelector('#password-retype'); // input#password-retype
// 3. 실패 메시지 정보 가져오기 (비밀번호 불일치)
let elMismatchMessage = document.querySelector('.mismatch-message'); // div.mismatch-message.hide
// 4. 실패 메시지 정보 가져오기 (8글자 이상, 영문, 숫자, 특수문자 미사용)
let elStrongPasswordMessage = document.querySelector('.strongPassword-message'); // div.strongPassword-message.hide

//id : 4 ~ 12 글자수 제한
function idLength(value) {
    return value.length >= 4 && value.length <= 12;
}

//id: 영어 또는 숫자만
function onlyNumberAndEnglish(str) {
    return /^[A-Za-z0-9][A-Za-z0-9]*$/.test(str);
}

//password : 8글자 이상, 영문, 숫자, 특수문자 사용
function strongPassword(str) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(str);
}

//password : 비밀번호와 비밀번호 확인 일치
function isMatch(password1, password2) {
    return password1 === password2;
}

//id 이벤트 (4~12글자 사이, 영어 또는 숫자만 사용)
elInputUsername.onkeyup = function () {
    // 값을 입력한 경우
    if (elInputUsername.value.length !== 0) {
        // 영어 또는 숫자 외의 값을 입력했을 경우
        if (onlyNumberAndEnglish(elInputUsername.value) === false) {
            elSuccessMessage.classList.add('hide');
            elFailureMessage.classList.add('hide');
            elFailureMessageTwo.classList.remove('hide'); // 영어 또는 숫자만 가능합니다
        }
        // 글자 수가 4~12글자가 아닐 경우
        else if (idLength(elInputUsername.value) === false) {
            elSuccessMessage.classList.add('hide'); // 성공 메시지가 가려져야 함
            elFailureMessage.classList.remove('hide'); // 아이디는 4~12글자이어야 합니다
            elFailureMessageTwo.classList.add('hide'); // 실패 메시지2가 가려져야 함
        }
        // 조건을 모두 만족할 경우
        else if (idLength(elInputUsername.value) || onlyNumberAndEnglish(elInputUsername.value)) {
            elSuccessMessage.classList.remove('hide'); // 사용할 수 있는 아이디입니다
            elFailureMessage.classList.add('hide'); // 실패 메시지가 가려져야 함
            elFailureMessageTwo.classList.add('hide'); // 실패 메시지2가 가려져야 함
        }
    }
    // 값을 입력하지 않은 경우 (지웠을 때)
    // 모든 메시지를 가린다.
    else {
        elSuccessMessage.classList.add('hide');
        elFailureMessage.classList.add('hide');
        elFailureMessageTwo.classList.add('hide');
    }
};

//password 이벤트(8글자 이상, 영문, 숫자, 특수문자 사용)
elInputPassword.onkeyup = function () {
    // console.log(elInputPassword.value);
    // 값을 입력한 경우
    if (elInputPassword.value.length !== 0) {
        if (strongPassword(elInputPassword.value)) {
            elStrongPasswordMessage.classList.add('hide'); // 실패 메시지가 가려져야 함
        } else {
            elStrongPasswordMessage.classList.remove('hide'); // 실패 메시지가 보여야 함
        }
    }
    // 값을 입력하지 않은 경우 (지웠을 때)
    // 모든 메시지를 가린다.
    else {
        elStrongPasswordMessage.classList.add('hide');
    }
};

//password 이벤트
elInputPasswordRetype.onkeyup = function () {
    // console.log(elInputPasswordRetype.value);
    if (elInputPasswordRetype.value.length !== 0) {
        if (isMatch(elInputPassword.value, elInputPasswordRetype.value)) {
            elMismatchMessage.classList.add('hide'); // 실패 메시지가 가려져야 함
        } else {
            elMismatchMessage.classList.remove('hide'); // 실패 메시지가 보여야 함
        }
    } else {
        elMismatchMessage.classList.add('hide'); // 실패 메시지가 가려져야 함
    }
};
