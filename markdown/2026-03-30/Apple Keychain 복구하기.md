---
title: "Apple Keychain 복구하기"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-30
aliases: []
---

> [!info] 원문
> [Recover Apple Keychain](https://arkoinad.com/posts/apple_keychain_recovery.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> MacBook 비밀번호 재설정 후 암호화된 keychain 데이터가 손실된 문제를 해결한 경험담이다. 이전 keychain 파일로 복구하여 모든 저장된 비밀번호와 데이터를 복원할 수 있음을 보여준다.

## 상세 내용

- macOS 비밀번호 재설정 시 이전 keychain이 login_renamed_*.keychain-db로 백업되며 새 keychain 파일이 생성됨
- ~/Library/Keychains 디렉토리에서 파일을 교체하고 이전 비밀번호로 인증하면 데이터 복구 가능
- keychain 데이터는 사용자 비밀번호로 암호화되어 재설정 시 자동 재암호화되지 않음

> [!tip] 왜 중요한가
> macOS 시스템 보안 메커니즘과 데이터 복구 방법을 이해하는 데 도움이 되며, 시스템 관리자에게 유용한 문제해결 기법이다.

## 전문 번역

# macOS 잠금 해제 후 키체인 데이터 복구하기

**작성일:** 2026년 3월 28일  
**카테고리:** Apple  
**태그:** Apple, keychain, password, recovery, macOS

---

업무용 MacBook에 잠겨버렸습니다. 정말 어이없는 상황인데요.

"매일 쓰는 기기 아닌가?"라고 물으실 수 있겠죠. 맞습니다. 아마 필요 이상으로 자주 쓰고 있을 정도예요. 문제는 여러 가지였어요. 우선 Touch ID에만 의존하다 보니 손가락 인식이 안 되면 막혔거든요. 그리고 습관처럼 회사 Active Directory(AD) 비밀번호를 자꾸 입력했습니다. 뭔가 잘못됐다는 걸 깨달았을 땐 이미 너무 많이 실패한 후였어요.

그래서 흔한 직장인처럼 IT 팀에 연락했습니다. 그 결정이 얼마나 도움이 됐는지는... 자세히 언급하지 않겠습니다.

## 문제의 시작: 비밀번호 재설정

macOS 복구 옵션을 사용해서 노트북 비밀번호를 재설정했어요. 그때는 뭔가 이상할 줄 몰랐습니다. 새 비밀번호로 로그인했을 땐 깜짝 놀랐습니다. 키체인 데이터와 일부 로컬 사용자 데이터가 모두 사라졌거든요. 동기화도 멈춰 있었습니다.

알고 보니 이 데이터는 이전 비밀번호로 암호화되어 있었어요. 재설정 유틸리티는 그걸 해독하고 새 비밀번호로 다시 암호화하지 않습니다. 생각해보니 보안 관점에서는 맞는 동작이죠. 하지만 비밀번호 재설정할 때 자동으로 처리해주는 마스터 키 같은 게 있을 줄 알았거든요.

## 복구 불가능한 상황

재설정 후 macOS는 이전 데이터와 다시 동기화할 수 있다는 옵션을 제시했습니다. 그런데 이미 이전 비밀번호 입력 시도를 다 써버렸어요. 다시 동기화하려 할 때마다 "iCloud 데이터 삭제" 프롬프트만 나타났습니다.

```
delete_data
```

오래전부터 Linux(Arch Linux)를 만지작거려온 사람으로서 뭔가 방법이 있을 거라고 생각했어요. 실패한 로그인 시도 카운터를 리셋하거나, 아니면 데이터를 직접 복구하는 방법 말이죠. 다만 Apple이니 만큼 쉽진 않을 거라는 건 예상했습니다.

## 해결책 찾기

조사 결과, 키체인 데이터는 여기에 저장되어 있었어요:

```
~/Library/Keychains
```

핵심 파일은 이것입니다:

```
login.keychain-db
```

비밀번호 재설정 과정에서 macOS는 원본 키체인을 다음과 같이 옮겨놨습니다:

```
login_renamed_1.keychain-db
```

그리고 새로운 `login.keychain-db`를 만들었거든요.

## 의외로 간단한 복구 방법

결국 복구 방법은 생각보다 간단했습니다. 새 키체인 파일을 옛날 것으로 바꾸면 되는 거였어요.

### 키체인 데이터 복구 단계

**1단계:** 다음 위치로 이동합니다:

```
~/Library/Keychains
```

**2단계:** 새로 만들어진 키체인을 제거합니다 (중요한 데이터가 없는지 확인하고):

```bash
rm login.keychain-db
```

**3단계:** 이전 키체인 파일을 원래 이름으로 돌립니다:

```bash
mv login_renamed_1.keychain-db login.keychain-db
```

끝입니다. 데이터가 복구되었어요.

키체인 접근(Keychain Access) 앱을 열면 이전 비밀번호를 물었습니다. 입력하자 모든 게 제대로 동기화되고, 이후로는 새 비밀번호를 사용하도록 업데이트됐거든요.

## 참고 자료

- [원문 링크](https://arkoinad.com/posts/apple_keychain_recovery.html)
- via Hacker News (Top)
- engagement: 41

## 관련 노트

- [[2026-03-30|2026-03-30 Dev Digest]]
