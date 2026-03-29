---
title: "HN에 공개: '프로그래밍 언어'를 만들었습니다 (피드백 요청)"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-03-29
aliases: []
---

> [!info] 원문
> [Show HN: I made a "programming language" looking for feedback](https://github.com/alonsovm44/glupe) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Glupe는 인간의 의도를 시맨틱 수준에서 캡처하여 40개 이상의 프로그래밍 언어로 컴파일할 수 있는 메타프로그래밍 언어입니다. AI 생성 코드의 신뢰성 문제를 해결하기 위해 $$ {} $$ 블록 내에서만 AI가 작동하도록 격리하는 방식을 제공합니다.

## 상세 내용

- Docker가 환경을 패키징하듯이 Glupe는 알고리즘 의도를 패키징하여 언어 독립적 코드 생성을 실현합니다.
- AI 코드 블록을 격리 컨테이너로 관리하여 기존 코드의 안전성을 보장하고 구조적 제어를 유지합니다.
- LLM을 활용한 자동 에러 수정과 캐싱을 통해 AI를 재작성 도구에서 정밀 구현 도구로 전환합니다.

> [!tip] 왜 중요한가
> 개발자는 장기적으로 언어 변화에 관계없이 코드를 유지할 수 있으며, AI 생성 코드의 신뢰성 문제를 구조적으로 해결할 수 있습니다.

## 전문 번역

# Glupe: AI 코드를 안전하게 격리하는 메타프로그래밍 언어

시작하기 전에 이 저장소를 클론하세요:
https://github.com/alonsovm44/glupe-tutorial

## Glupe가 뭔가요?

Glupe는 의도 기반의 메타프로그래밍 언어입니다. 기존 메타프로그래밍은 C++ 템플릿이나 Lisp 매크로처럼 단일 언어 안에서만 동작하는데, Glupe는 다릅니다. 개발자의 의도를 읽고 40개 이상의 프로그래밍 언어나 네이티브 실행 파일로 변환할 수 있죠.

한 문장으로 말하면 이렇습니다:

> "Glupe는 AI 로직을 격리된 컨테이너에 담아두고, 우리가 작성한 수동 코드는 안전하게 보호한다."

다시 말해 "로직을 위한 Docker"라고 보면 됩니다.

### Docker와 Glupe의 유사성

Docker는 실행 환경을 패킹해서 소프트웨어가 어디서나 동일하게 작동하도록 하죠. 똑같이 Glupe는 알고리즘을 패킹합니다. 즉, 오늘 C++로 컴파일한 코드를 2030년엔 Rust로, 2050년엔 미래의 어떤 언어로든 컴파일할 수 있다는 뜻입니다.

- **Docker**: 운영체제를 고정 → 공간 문제 해결
- **Glupe**: 알고리즘을 고정 → 시간 문제 해결

더 좋은 점은 이 둘이 함께 동작한다는 겁니다. .glp 청사진을 Docker 컨테이너에 저장하면, 환경과 로직 모두에서 영구적인 소프트웨어를 만들 수 있어요.

## 사용 예시

```
% 이건 주석입니다
$$ include {
standard io library
vector library
}$$

$$ABSTRACT rules{
every printed message must end with "!"
}$$

$$ABSTRACT rules2{
every printed message must begin with "?"
}$$

$$ main -> rules, rules2 {
let v = vector[1,2,3]
print v
}$$
```

실행 결과:
```
? 1,2,3 !
```

이 코드는 40개 이상의 지원 언어나 네이티브 실행 파일로 컴파일됩니다.

## AI 생성 코드의 위험성

모든 개발자가 알고 있는 두려움이 있습니다. AI에게 파일을 수정하도록 하는 건 마치 주니어 개발자에게 프로덕션 서버의 루트 접근 권한을 주는 것과 같다는 거죠. 버그를 고칠 수도 있지만, 정상 코드를 리팩토링해버리거나 중요한 주석을 삭제할 수도 있습니다.

Glupe는 이 신뢰 문제를 해결하기 위해 만들어졌습니다.

호스트 시스템 대신 우리는 소스 코드 파일을 갖습니다. 런타임을 격리하는 대신, Glupe는 코드 블록을 격리하죠. `$${}`으로 감싼 구역이 바로 컨테이너입니다.

AI는 블록 밖의 맥락을 이해합니다. 프로그램의 전체 로직도 알죠. 하지만 그 부분에는 손을 댈 수 없도록 제한됩니다. 컨테이너 안에서는 복잡한 로직을 맘껏 생성할 수 있지만, 호스트 코드는 절대 건드릴 수 없는 거예요.

또한 Glupe는 컨테이너 해싱을 통해 증분 빌드를 지원합니다. 변경되지 않은 컨테이너는 캐시된 코드를 사용하므로 LLM 호출을 건너뜁니다.

이렇게 하면 AI가 무질서한 '처음부터 다시 쓰는 도구'에서 '정밀한 도구'로 변신합니다. 건축 전체를 통제하면서도 구현 세부사항은 AI에게 맡길 수 있다는 뜻이죠.

## 설치

### Windows (추천)

1. Win + R을 누르고 cmd를 입력하거나 cmd.exe를 엽니다
2. Powershell을 입력합니다
3. 다음 명령어를 실행합니다:

```powershell
irm https://raw.githubusercontent.com/alonsovm44/glupe/master/install.ps1 | iex
```

Ollama를 설치하면 모든 팝업을 승인하세요. 설치 프로그램이 자동으로 최신 버전의 Glupe를 설치합니다.

### Linux/macOS

bash 터미널을 열고 다음 명령어를 실행하세요:

```bash
curl -fsSL https://raw.githubusercontent.com/alonsovm44/glupe/master/install.sh | bash
```

### 수동 빌드

```bash
g++ glupec.cpp -o glupe -std=c++17 -lstdc++fs
```

## 빠른 시작

```bash
glupe --init
glupe hello.glp -o hello.exe -cpp -local
.\hello
```

## Glupe를 컴파일러처럼 사용하기

전통적인 컴파일러(GCC, Clang, rustc)는 문법을 기반으로 코드를 번역할 뿐, 에러를 고쳐주지는 않습니다. 빌드가 실패하면 컴파일러 메시지를 해석하고, 문서를 찾아보고, 직접 디버깅해야 하죠.

Glupe는 다릅니다. 명령줄 도구로서 의도(평문이나 의사코드로 작성된)와 기존 빌드 도구 사이에 위치합니다. 설정된 언어 모델(로컬 또는 클라우드)을 사용해 소스 코드를 생성하고, 출력을 디스크에 쓴 뒤, 선택적으로 컴파일러나 빌드 스크립트를 실행합니다.

빌드가 실패하면 Glupe는 컴파일러 에러 메시지를 모델에 다시 입력해서 문제를 수정하려고 시도할 수 있습니다. 재시도 횟수는 설정으로 조정 가능합니다.

중요한 점은 Glupe가 확정적인 컴파일러나 형식적인 트랜스파일러는 아니라는 겁니다. 외부 컴파일러와 언어 모델의 품질에 의존하는 오케스트레이터일 뿐입니다.

## 주요 기능

### AI 기반 코드 생성

자연어, 혼합 언어, 기존 파일에서 실행 가능한 코드를 생성합니다:

```bash
glupe utils.py myalgorithm.c -o myprogram.exe -cpp -cloud
```

Python, C, 의도를 조합해서 네이티브 C++ 바이너리를 얻을 수 있어요.

### 다중 파일 프로젝트 생성

`EXPORT:` 블록을 사용해 하나의 .glp 파일로 전체 프로젝트를 정의하세요:

```
EXPORT: "mylib.h"
$$ myfunc { define a function 'myfunction()' that returns square of a number }$$
EXPORT: END

EXPORT: "myprogram.cpp"
#include <iostream>
#include <vector>
#include "mylib.h"

int main(){
int x = 3;
$$ main {
make a vector and populate with squares from 1 to x
}$$
}
EXPORT: END
```

## 참고 자료

- [원문 링크](https://github.com/alonsovm44/glupe)
- via Hacker News (Top)
- engagement: 21

## 관련 노트

- [[2026-03-29|2026-03-29 Dev Digest]]
