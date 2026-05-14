---
title: "Tesla Wall Connector 부트로더의 펌웨어 다운그레이드 방지 우회"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-14
aliases: []
---

> [!info] 원문
> [Tesla Wall Connector bootloader bypasses the firmware downgrade ratchet](https://www.synacktiv.com/en/publications/exploiting-the-tesla-wall-connector-from-its-charge-port-connector-part-2-bypassing) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Tesla Wall Connector Gen 3의 보안 래칫 메커니즘을 우회하는 방법을 설명합니다. 2025 Pwn2Own Automotive 이후 추가된 안티다운그레이드 보호를 분할 테이블 쓰기와 슬롯 삭제 순서의 취약점으로 우회합니다.

## 상세 내용

- UDS 프로토콜을 통한 충전 케이블상 공격으로 디버그 셸 확보 가능
- 버전 래칫(ratchet) 검증은 부트로더가 아닌 업데이트 함수에서만 수행되는 설계 결함
- partition table 쓰기와 slot erase 사이의 실행 순서 문제로 인한 우회 가능

> [!tip] 왜 중요한가
> 임베디드 펌웨어 보안 개발자들이 순서 의존성과 이중 검증의 중요성을 이해할 수 있습니다.

## 전문 번역

# Tesla Wall Connector 충전 포트 해킹 - Part 2: 안티다운그레이드 우회

**작성: David Berard | 2026년 12월 5일**

## 이전 이야기

지난 글에서 우리는 Pwn2Own Automotive 2025에서 발표한 Tesla Wall Connector Gen 3 공격 방법을 소개했습니다. 그 당시의 핵심은 단순했거든요. 안티다운그레이드 메커니즘이 없었던 거죠. 충전 케이블을 통해 UDS 통신만 가능하면, 기존의 취약한 펌웨어를 패시브 슬롯에 써넣고 재부팅해서 디버그 셸에 접근할 수 있었던 겁니다.

Tesla는 업데이트 루틴에 안티다운그레이드 검사를 추가한 펌웨어를 출시했습니다. 이제 모든 펌웨어 이미지에는 보안 래칫(security ratchet) 값이 포함되고, 업데이터는 기기에 저장된 값보다 낮은 래칫을 가진 이미지를 거부합니다.

이 글에서는 안티다운그레이드가 어떻게 작동하는지, 그리고 파티션 테이블 쓰기와 슬롯 삭제 사이의 작업 순서를 악용해 이를 우회하는 방법을 설명하겠습니다. 완전히 최신 펌웨어로 업데이트된 충전기에서 기존의 Pwn2Own 공격을 다시 성공시킨 것이죠.

이건 커피 한 잔, IDA 윈도우, 그리고 AI의 도움 없이 수작업으로 찾아낸 취약점입니다. 옛날 그 좋던 시절 기억하시나요?

## 업데이트 절차 복습

Single-Wire CAN을 통한 전체 업데이트 흐름은 첫 번째 글에서 자세히 다뤘습니다. 간단히 정리하면:

1. UDS 세션 열기 (타입 2)
2. 보안 액세스 인증 (레벨 5, XOR-0x35 알고리즘)
3. 루틴 0xFF00 실행해서 패시브 슬롯 준비 및 삭제
4. 0x0E을 식별자 0x102에 쓰기해서 슬롯을 "UDS를 통해 설정 가능"으로 표시
5. Request Download / Transfer Data / Request Transfer Exit로 펌웨어 전송
6. 루틴 0x201 실행해서 새로 쓰여진 이미지 검증 및 슬롯 전환
7. 루틴 0x202 실행해서 재부팅

참고로 AW-CU300은 두 개의 펌웨어 슬롯을 사용합니다. 하나는 활성(현재 실행 중)이고, 하나는 패시브(업데이트 대상)입니다. 업데이트가 성공하면 슬롯이 전환되고 새 펌웨어가 다음 부팅 시 활성화됩니다.

## 24.44.3 버전에서 달라진 점

구 펌웨어와 24.44.3을 비교 분석한 결과, UDS 루틴 0x201을 처리하는 `switch_to_new_firmware()` 함수에 주목했습니다.

```c
int switch_to_new_firmware()
{
...
if ( settable_via_uds != 14 || !passive_firmware )
    return 1;
if ( passive <= 0
    || passive > passive_firmware->size
    || (v2 = check_signature(passive_firmware->start, passive)) != 0
    || !check_image_and_antidowngrade(nullptr) )
{
    part_erase(flash_drv, passive_firmware->start, 0x14u);
    v2 = 4;
}
else
{
    part_write_layout(passive_firmware);
}
flash_drv_close(flash_drv);
passive_firmware = nullptr;
return v2;
}
```

`check_image_and_antidowngrade()`는 새로 추가된 함수입니다. 펌웨어 세그먼트를 파싱해서 CRC를 재계산한 다음, 래칫 비교를 위해 `verify_firmware_segments_platform()`을 호출하죠.

```c
int verify_firmware_segments_platform(int flash_drv, u32_t *segments, ...)
{
...
// 0x100000 .. 0x100010 범위로 끝나는 세그먼트에서
// 버전 디스크립터를 찾기 위해 세그먼트 탐색
...
if ( buffer.next != (netif *)'NSRV' /* "VRSN" */ )
    goto next_segment;
major = LOBYTE(buffer.ip_addr.addr);
minor = BYTE1(buffer.ip_addr.addr);
if ( buffer.netmask.addr == '2SRV' /* "VRS2" */
    && LOBYTE(buffer.gw.addr) > 1u )
    firmware_ratchet = BYTE2(buffer.gw.addr);
else
    firmware_ratchet = 0;
...
sub_1F04866C(&current_ratchet); // PSM에서 래칫 읽기
if ( current_ratchet <= firmware_ratchet
    || !call_psm_wrapper(...) )
{
    return 0; // 수락
}
log("Failure: Security ratchet downgrade prevented %d < %d",
    firmware_ratchet, current_ratchet);
return -1;
}
```

버전 정보는 펌웨어 세그먼트에 내장되어 있습니다(버전용 VRSN, 래칫용 VRS2). 특히 0x100000 근처에 로드되는 세그먼트에 들어있죠. 업데이터만 이것을 파싱하고, 부트로더는 그렇지 않습니다.

기기 쪽에서 래칫은 PSM(Persistent Storage Manager)에 저장되며, 더 높은 래칫 이미지가 활성화될 때마다 증가합니다.

따라서 24.44.3 기기에서 구 버전인 0.8.58 펌웨어를 보내고 루틴 0x201을 호출하면:

```
ERROR verify_firmware_segments_platform:145
Failure: Security ratchet downgrade prevented 0 < N
```

슬롯이 즉시 삭제되어 버립니다. 공식 경로를 통해서는 구 이미지를 플래시에 유지할 방법이 없는 거죠.

## 부트로더는 신경 쓰지 않음

빌드 아티팩트에서 `boot2`라고 불리는 부트로더는 플래시의 고정 주소에 있으며 Tesla가 배포하는 펌웨어 업데이트에 포함되지 않습니다. 우리는 원래의 Pwn2Own 공격으로 이미 루팅한 충전기에서 플래시를 덤프해서 분석할 수 있었습니다.

부트로더는 활성 펌웨어에 점프하기 전에 여러 검사를 수행합니다:

- 매직 헤더(SBFH)
- 세그먼트별 CRC32
- 키스토어의 키에 대한 RSA 서명

그런데 보안 래칫은 전혀 검사하지 않습니다. 유효한 서명과 올바른 CRC를 가진 모든 펌웨어 이미지는 버전과 무관하게 실행됩니다. `boot2`와 부트롬 모두 보안 부트를 구현하지 않은 거네요.

결국 안티다운그레이드는 오직 한 코드, 한 순간에만 강제됩니다. 바로 루틴 0x201이 호출될 때 `switch_to_new_firmware()` 함수에서입니다.

그렇다면: 구 펌웨어를 플래시에 남겨둘 수 있을까요?

## 참고 자료

- [원문 링크](https://www.synacktiv.com/en/publications/exploiting-the-tesla-wall-connector-from-its-charge-port-connector-part-2-bypassing)
- via Hacker News (Top)
- engagement: 39

## 관련 노트

- [[2026-05-14|2026-05-14 Dev Digest]]
