---
title: "게으른 사람을 위한 GitHub에서 Codeberg로의 마이그레이션 가이드"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-03-26
aliases: []
---

> [!info] 원문
> [Moving from GitHub to Codeberg, for lazy people](https://unterwaditzer.net/2025/codeberg.html) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 GitHub 저장소를 Codeberg로 마이그레이션하는 과정을 정리한 가이드입니다. 저장소 임포트는 간단하지만 CI/CD 설정이 가장 복잡한 부분입니다.

## 상세 내용

- Codeberg의 저장소 임포트 기능은 이슈, PR, 릴리스를 자동으로 마이그레이션하며 매우 간편함
- GitHub Actions 대체로 Forgejo Actions 사용을 권장하며 YAML 문법이 유사하여 학습곡선이 낮음
- macOS 러너가 필요한 경우 GitHub Actions를 유지하고 미러링으로 동기화하는 하이브리드 방식 제안

> [!tip] 왜 중요한가
> 오픈소스 개발자가 GitHub 의존성을 줄이고 자유도 높은 플랫폼으로 전환할 때 실질적인 마이그레이션 전략을 제공합니다.

## 전문 번역

# GitHub에서 Codeberg로 옮기기 (게으른 사람을 위한 가이드)

오랫동안 마음먹고 있던 저장소 마이그레이션을 드디어 시작했습니다. Codeberg를 아직 준비가 덜 되었다고 생각했고, 마이그레이션 과정이 지루한 작업이라고 여겨서 계속 미루고만 있었거든요.

그런데 막상 해보니 생각보다 그렇지 않더라고요. 물론 프로젝트의 성격에 따라 다르긴 합니다. 저와 비슷한 상황이라면 이 글이 마이그레이션을 시작하는 데 좋은 동기부여와 출발점이 되길 바랍니다. 여기서 소개하는 방법들이 장기적으로 계속 유지할 최선의 방식은 아니지만, GitHub에서 옮기려는 초기 단계에서 가장 간편한 선택지들을 정리했습니다.

## 이슈, PR, 릴리스 옮기기

가장 먼저 고민할 이슈, PR, 릴리스를 포함한 데이터 마이그레이션은 사실 가장 쉬운 부분입니다. Codeberg가 제공하는 GitHub 저장소 import 기능이 정말 잘 되어 있거든요. 이슈 번호, 라벨, 작성자 정보가 모두 보존되며, UI도 GitHub과 거의 동일합니다. 다른 이슈 트래커에서 GitHub으로 옮기던 어색한 과정과는 차원이 다릅니다.

## 정적 웹사이트 호스팅

GitHub Pages를 사용하고 계셨다면 codeberg.page로 대체할 수 있습니다. 공식적인 가동 시간 보장(SLO)이 없다는 경고는 있지만, 제 경험상 다운타임을 거의 본 적이 없습니다. 현재로서는 충분히 신뢰할 수 있습니다. 사용 방식도 과거의 GitHub Pages처럼 HTML을 특정 브랜치에 push하는 식입니다.

**참고:** grebedoc.dev나 statichost.eu도 좋은 대안이 될 수 있습니다.

## CI/CD 설정 – 가장 까다로운 부분

여기가 정말 골치 아픈 부분입니다. GitHub가 무료 macOS 러너와 공개 저장소에 대한 무제한 빌드 용량으로 많은 개발자를 끌어들였는데, Codeberg로 옮기면 이 두 가지를 포기해야 합니다.

프로그래밍 언어별로 크로스 컴파일 방식을 검토하거나, Forgejo Actions용 러너를 직접 호스팅하는 방식을 추천합니다.

### Forgejo Actions를 선택한 이유

Woodpecker CI도 있지만, GitHub Actions에서 오신 분이라면 Forgejo Actions가 훨씬 편할 겁니다. UI와 YAML 문법이 거의 동일하고, GitHub의 기존 action 생태계도 대부분 그대로 작동합니다.

예를 들어 GitHub Actions에서 이렇게 쓰던 것:

```yaml
uses: dtolnay/rust-toolchain
```

Forgejo Actions에서는 이렇게만 변경하면 됩니다:

```yaml
uses: https://github.com/dtolnay/rust-toolchain
```

### macOS 빌드가 꼭 필요한 경우

macOS 러너가 필수적이라면 GitHub에 저장소를 유지하면서, Codeberg에서 모든 커밋을 GitHub으로 미러링하고, Forgejo Actions가 GitHub API를 폴링해서 CI 상태를 다시 Codeberg로 동기화하는 방식을 추천합니다. 아직 직접 시도해보지는 않았지만, macOS 빌드를 제공하는 다른 CI 서비스들도 Codeberg 통합이 훨씬 복잡한 편입니다.

## 기존 GitHub 저장소 처리하기

저는 README를 업데이트하고 저장소를 아카이빙했습니다.

Codeberg에서 새 커밋을 GitHub으로 push하도록 설정할 수도 있지만, 그러면 사용자들이 여전히 PR을 열거나 이슈에 댓글을 달 수 있다는 문제가 있습니다. 어떤 프로젝트들은 이를 해결하기 위해 GitHub 저장소에서 이슈를 비활성화했는데, 이건 정말 좋지 못한 방법입니다. 기존 이슈가 모두 404 에러가 되기 때문입니다. PR은 비활성화할 수도 없고요.

libvirt/libvirt 같은 일부 저장소는 모든 PR을 자동으로 종료하는 GitHub Action을 작성해서 대응하고 있습니다. 하지만 이 방식도 문제가 있긴 합니다. 개발자들에게 빌드 최적화나 릴리스 다운로드 방식 개선의 동기가 없어져서, 결국 자체 호스팅을 하거나 전체 소프트웨어 생태계에 좋지 않은 영향을 미칠 수 있기 때문입니다.

따라서 전환 기간 동안 읽기 전용 미러를 유지하거나, 계속 GitHub Pages와 GitHub Actions를 병행하는 것도 합리적인 선택지입니다.

## 참고 자료

- [원문 링크](https://unterwaditzer.net/2025/codeberg.html)
- via Hacker News (Top)
- engagement: 485

## 관련 노트

- [[2026-03-26|2026-03-26 Dev Digest]]
