---
title: "부팅된 Linux 커널"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-06-15
aliases: []
---

> [!info] 원문
> [Boot Naked Linux](https://nick.zoic.org/art/boot-naked-linux/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 전체 OS 대신 단일 프로세스만 실행하는 최소화된 Linux 커널을 1초 이내에 부팅하는 방법을 설명합니다. 정적으로 컴파일된 init 프로그램을 포함한 간단한 initrd를 만들어 부팅 시간을 극적으로 단축합니다.

## 상세 내용

- C로 작성된 간단한 init 프로그램과 정적 컴파일을 통해 최소 initrd 구성
- cpio와 gzip을 이용해 단일 파일만 포함하는 초경량 initramfs 생성
- QEMU를 이용한 가상 환경에서 1초 이내 부팅 달성

> [!tip] 왜 중요한가
> 부팅 성능 최적화, 컨테이너화, 임베디드 시스템 개발에 필요한 Linux 커널 경량화 기법 습득

## 전문 번역

# 리눅스를 알몸으로 부팅하기

2026-05-19

Linux 커널만 남기고 나머지는 모두 걷어내서 1초도 안 되는 시간에 부팅하는 방법을 소개합니다.

## 시작하며

어릴 때 컴퓨터는 지금처럼 계속 켜져있지 않았어요. 쓸 때만 켜고 다 쓰면 꺼버렸는데, 다시 켤 때는 1초 정도면 디스크 드라이브에 있던 걸 로드하곤 했습니다.

2000년대 초 SSD가 나오면서 잠깐 부팅이 빨라졌던 시절이 있었어요. 그런데 기술 업계가 그 시간을 모두 먹어버렸거든요. 지금은 16코어 CPU에 고속 SSD를 달아도 여전히 1분 정도 걸립니다.

그래서 다른 방식을 시도해보고 싶었어요. Linux 커널은 살리되, 나머지는 최대한 전부 걷어내는 거죠.

> **업데이트**: 혹시 모르니 말인데, 이 글을 쓰면서 비슷한 내용을 다루는 "Building a tiny Linux from scratch"를 발견했는데요, Rust로 작성됐고 1년 전 글이라고 합니다. 그것도 한번 봐볼 만합니다.

## Hello, World!

Linux 시스템이 부팅되면 가장 먼저 "init"라고 부르는 프로그램이 실행됩니다. 이 프로그램이 다른 프로세스들과 설정값들을 로드하는 거죠. 

특별할 건 없어요. 그냥 일반적인 실행 파일이나 스크립트일 뿐이고, 역사적으로 여러 방식이 있어왔습니다.

그럼 C로 새로운 init을 만들어볼까요:

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/reboot.h>

int main(int argc, char **argv) {
    fprintf(stderr, "Hello from init.c!");
    reboot(RB_POWER_OFF);
}
```

간단하지 죠? 메시지를 출력하고 컴퓨터를 재부팅할 뿐입니다.

Init 프로세스가 종료되면 커널이 패닉 상태에 빠지거든요. 그래서 바쁜 대기나 영원히 잠들기 같은 짓 대신 `reboot(RB_POWER_OFF)`로 가상머신을 깔끔하게 종료합니다.

## initrd 만들기

현대의 Linux는 꽤 복잡한 다단계 부팅 과정을 거칩니다. 인터넷에 많은 자료가 있지만, 대부분 20년 전 것들이라 많이 바뀌었어요. 2026년 기준 Linux 6.8 정도에서의 동작 방식을 정리해보면 이렇습니다:

1. 부트로더가 커널과 'initrd'라고 불리는 더미 파일시스템을 실행합니다.
2. 커널이 'initrd' 파일을 'initramfs'(RAM에 있는 루트 파일시스템)로 압축 해제합니다.
3. 커널은 `/init` 파일을 찾습니다 (또는 `rdinit=` 커널 파라미터로 지정된 파일).
4. 그 파일이 존재하면 실행하고, 그 프로세스가 초기화를 맡습니다.
5. 없으면 대신 다음을 합니다:
   - `root=` 커널 파라미터로 지정된 루트 파티션을 마운트
   - `/dev`에 devtmpfs 파일시스템을 마운트
   - `init=` 파라미터로 지정된 프로세스를 실행
6. 만약 init 프로세스가 종료되면 커널이 패닉합니다.

대부분의 현대 배포판은 첫 번째 방식을 씁니다. 모듈과 펌웨어를 로드할 수 있도록 꽤 큰 initrd 파일시스템을 제공하는 거죠. 제 PC의 initrd는 73MB이고 lsintramfs에 따르면 2163개 파일이 들어있어요!

다른 init으로 대체하는 예시들이 있긴 하지만, 저는 더 극단적으로 가기로 했어요. initrd 전체를 바꾸는 겁니다.

예제 코드를 정적으로 컴파일하면(즉, 필요한 라이브러리를 모두 포함하면) 파일 1개짜리 initrd를 만들 수 있습니다:

```bash
gcc -static init.c -o init
echo 'init' | cpio -o --format=newc | gzip -c > initrd
```

### cpio에 대해

cpio는 정말 이상하고 오래된 프로그램이에요. 명령어 옵션이 tar보다도 더 불친절합니다.

지금은 자세히 넘어가도록 하고, 나중에 이런 커널 메시지가 나오면:

```
Initramfs unpacking failed: no cpio magic
```

이건 cpio 포맷이나 압축이 커널과 맞지 않다는 뜻입니다. 커널이 계속 진행을 시도하긴 하는데, 이런 메시지가 나오면:

```
check access for rdinit=/init failed: -2, ignoring
```

initramfs가 제대로 안 됐거나 바이너리가 잘못된 위치에 있다는 뜻입니다. (-2는 -ENOENT, 즉 파일을 찾을 수 없다는 의미)

아키텍처가 맞지 않는다는 메시지도 볼 수 있어요. 부팅 초기에 나타나는 메시지라서 계속 진행을 시도하므로 화면을 꼼꼼히 봐야 합니다.

반대로 이 메시지가 보이면:

```
Trying to unpack rootfs image as initramfs...
```

그 다음 아무것도 안 나오면 좋은 신호예요. 성공했다고 로그에 남기지 않다가, 나중에 이렇게 나올 겁니다:

```
Run /init as init process
```

참고로 cpio 아카이브에 많은 파일을 넣으려면 이렇게 하면 됩니다:

```bash
(cd $SOURCE_DIR; find . | cpio -o -H newc) | gzip -c > $OUTPUT_FILE
```

파일 목록을 파이프로 보내는 방식이 좀 이상하게 느껴질 수 있는데, cpio가 tar보다도 오래되고, 심지어 셸의 파일명 확장(globbing)보다도 먼저 나온 거라서 그런 겁니다.

## QEMU로 가상화하기

실제 하드웨어로 이걸 시도하려면 USB 키를 계속 바꿔 끼워야 해서 짜증나거든요. 대신 QEMU로 가상 시스템을 만들어서 실험했어요.

QEMU는 커널과 파일시스템 이미지만 있으면 부팅할 수 있게 해줍니다.

## 참고 자료

- [원문 링크](https://nick.zoic.org/art/boot-naked-linux/)
- via Hacker News (Top)
- engagement: 77

## 관련 노트

- [[2026-06-15|2026-06-15 Dev Digest]]
