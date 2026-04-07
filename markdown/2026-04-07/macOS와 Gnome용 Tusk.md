---
title: "macOS와 Gnome용 Tusk"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-04-07
aliases: []
---

> [!info] 원문
> [Show HN: Tusk for macOS and Gnome](https://shapemachine.xyz/tusk/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Tusk는 Electron, 텔레메트리, 구독 요금 없이 네이티브로 작성된 PostgreSQL 클라이언트입니다. macOS는 SwiftUI, Gnome은 GTK4로 개발되었습니다.

## 상세 내용

- macOS(SwiftUI)와 Gnome(GTK4 + libadwaita) 모두 완전 네이티브 구현으로 가볍고 빠름
- 스키마 브라우저, SQL 에디터, 데이터 그리드, 연결 관리 등 포괄적인 기능 제공
- 오픈소스이며 Electron 기반의 무거운 대안들과 달리 경량 설계

> [!tip] 왜 중요한가
> PostgreSQL 개발자에게 플랫폼별 최적화된 경량 도구를 제공하여 개발 생산성을 향상시킵니다.

## 전문 번역

# Tusk: macOS와 Linux를 위한 네이티브 PostgreSQL 클라이언트

Electron 없이, 원격 측정 추적도 없고, 구독료도 필요 없습니다.

## 주요 특징

### macOS 버전
**SwiftUI 기반 · macOS 14 이상**
- [다운로드 (.dmg)](https://github.com/kiyasov/Tusk/releases)
- 첫 실행 시 우클릭 → Open으로 Gatekeeper 우회
- [GitHub 저장소 보기](https://github.com/kiyasov/Tusk)

### GNOME 버전
**GTK4 + libadwaita · Python 3.11 이상**
- [다운로드](https://github.com/kiyasov/Tusk/releases)
- Flatpak, AppImage, .deb, .rpm 지원
- [GitHub 저장소 보기](https://github.com/kiyasov/Tusk)

---

## 기능 비교표

### 연결 관리
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 이름이 지정된 연결 프로필 | ✓ | ✓ |
| 비밀번호 / 키체인 저장 | ✓ | ✓ |
| SSH 터널 | ✓ | ✓ |
| 저장 전 연결 테스트 | ✓ | ✓ |
| 읽기 전용 모드 | ✓ | ✓ |
| PostgreSQL URI 가져오기 | ✓ | ✓ |
| SSL/TLS 토글 | ✓ | — |
| 동시 다중 연결 | ✓ | — |
| 연결별 색상 태그 | ✓ | — |
| .pgpass 가져오기 | — | ✓ |
| 연결을 URI로 복사 | — | ✓ |
| 슈퍼유저 역할 배지 | — | ✓ |

### 스키마 브라우저
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 스키마 → 테이블 트리 사이드바 | ✓ | ✓ |
| 뷰, 열거형, 시퀀스, 함수 | ✓ | ✓ |
| 테이블 크기 표시 | ✓ | ✓ |
| 데이터베이스 전환기 | ✓ | ✓ |
| 테이블 이름 변경 / 초기화 / 삭제 | ✓ | ✓ |
| 새 테이블 마법사 | ✓ | — |
| 실시간 필터 바 | — | ✓ |
| 스키마 생성 / 이름 변경 / 삭제 | — | ✓ |
| 역할 브라우저 | — | ✓ |

### 테이블 검사자
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 컬럼 탭 | ✓ | ✓ |
| 컬럼 추가 / 이름 변경 / 편집 / 삭제 | ✓ | ✓ |
| 키 / 제약조건 탭 | ✓ | ✓ |
| 관계 탭 | ✓ | ✓ |
| 인덱스 탭 | ✓ | ✓ |
| 트리거 탭 | ✓ | ✓ |
| DDL 탭 | ✓ | ✓ |
| 관계도 시각화 | ✓ | — |
| 제약조건 추가 | — | ✓ |
| 인덱스 유형 / CONCURRENTLY 옵션으로 생성 | — | ✓ |

### 데이터 브라우저
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 페이지네이션된 데이터 그리드 | ✓ | ✓ |
| 컬럼 텍스트 필터 | ✓ | ✓ |
| 정렬 가능한 컬럼 | ✓ | ✓ |
| 새 행 삽입 | ✓ | ✓ |
| 기존 행 편집 | ✓ | ✓ |
| 행 삭제 | ✓ | ✓ |
| CSV / JSON / INSERT로 복사 | ✓ | ✓ |
| 전체 테이블을 파일로 내보내기 | ✓ | ✓ |
| 컬럼 크기 조정 (저장됨) | ✓ | — |
| JSON/JSONB 트리 뷰 | ✓ | — |
| NULL 표시기 | — | ✓ |
| 고정 / 동결 컬럼 | — | ✓ |
| 설정 가능한 페이지 크기 | — | ✓ |

### SQL 에디터
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 문법 강조 | ✓ | ✓ |
| 전체 실행 | ✓ | ✓ |
| 선택 영역 / 커서 위치 실행 | ✓ | ✓ |
| EXPLAIN / EXPLAIN ANALYZE | ✓ | ✓ |
| 다중 쿼리 실행 및 로그 | ✓ | ✓ |
| 파일 기반 자동 저장 | ✓ | ✓ |
| 쿼리 히스토리 | ✓ | ✓ |
| 탭별 연결 선택기 | ✓ | — |
| 실행 중인 쿼리 취소 | — | ✓ |
| 줄 주석 토글 | — | ✓ |

### 파일 탐색기
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| .sql 파일용 파일 시스템 사이드바 | ✓ | ✓ |
| 인라인 생성 / 이름 변경 / 삭제 | ✓ | ✓ |
| 마지막 위치 기억 | ✓ | ✓ |

### 활동 모니터
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 활성 세션 보기 | ✓ | — |
| 쿼리 취소 / 백엔드 종료 | ✓ | — |

### 외관
| 기능 | macOS | GNOME |
|------|:-----:|:-----:|
| 폰트 패밀리 & 크기 설정 | ✓ | ✓ |
| 시스템 다크 / 라이트 모드 | — | ✓ |

---

## 지원하기

Tusk는 자유롭게 사용할 수 있는 오픈소스 프로젝트입니다. 만약 유용하게 사용하고 있다면, 개발을 지원해 주세요.

[Tusk 스폰서하기](https://github.com/sponsors/kiyasov)

## 참고 자료

- [원문 링크](https://shapemachine.xyz/tusk/)
- via Hacker News (Top)
- engagement: 57

## 관련 노트

- [[2026-04-07|2026-04-07 Dev Digest]]
