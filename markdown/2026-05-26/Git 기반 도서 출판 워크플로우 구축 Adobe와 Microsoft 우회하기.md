---
title: "Git 기반 도서 출판 워크플로우 구축: Adobe와 Microsoft 우회하기"
tags: [dev-digest, insight]
type: study
tech:
  - frontend
level: ""
created: 2026-05-26
aliases: []
---

> [!info] 원문
> [I Bypassed Adobe and Microsoft to Build a Git-Tracked Book Production Pipeline](https://www.djspeckhals.com/posts/2026-05-22-how-i-bypassed-adobe-and-microsoft-to-build-a-git-tracked-book-production-pipeline/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> 개발자가 Microsoft Word, Adobe InDesign, Calibre 등의 상용 도구를 대체하여 Git으로 추적 가능한 자동화된 도서 출판 파이프라인을 구축한 경험을 공유합니다.

## 상세 내용

- 기존에는 Word → InDesign → Calibre → Kindle Create를 거치는 복잡한 다중 포맷 관리 프로세스가 필요했습니다.
- Standard Ebooks의 방식을 참고하여 DOCX → EPUB 변환 및 Git 기반 버전 관리로 통합했습니다.

> [!tip] 왜 중요한가
> 개발자가 출판 영역에 자동화 및 버전 관리를 도입하는 방법과 오픈소스 도구 활용 전략을 배울 수 있습니다.

## 전문 번역

# 소설 출판, 기술로 우아하게 만들기

소설 출판에서 가장 중요한 것은 이야기입니다. 매력적인 인물이 있는가? 흥미롭고 일관성 있는 플롯인가? 믿을 수 있는 스토리인가? 이와 함께 문법, 문장 구조, 맞춤법, 구두점 같은 글쓰기 품질이 중요하죠. 이런 부분에 엄청난 노력을 들이지 않으면 출판할 가치가 있는 책을 만들 수 없습니다.

그런데 소설을 포맷팅하고 조판하는 일은 흔히 뒷전으로 밀려나곤 합니다. 자비출판 과정에서 가장 기술적인 부분이거든요. 책을 폴리시된 형태로 독자들에게 전달하고 싶어 하는 저자들에게는 이 부분이 꽤 부담스러울 수 있죠. 제 포맷팅 프로세스가 최고거나 가장 간단하다고 주장하려는 건 아닙니다. 다만 저한테는 잘 맞고, 독립 소설가이면서 동시에 소프트웨어 개발자인 제 취향을 충족시킵니다.

## Word + InDesign + Calibre + Kindle Create

처음엔 안전하게 가기로 했습니다. 제 기독교 역사소설 세 권—《Heretics of Piedmont》, 《The Lord of Luserna》, 《Prince of Savoy》—과 단편 《The Outcast of Chivasso》는 모두 Microsoft Word 파일(DOCX)로 시작했거든요. 대부분의 편집자와 교정자는 Word의 변경 추적 기능을 사용하고, 거의 모든 최종 포맷팅 소프트웨어(Adobe InDesign, Kindle Create, Calibre, Atticus 등)는 DOCX 파일을 불러올 수 있으니까요. 좋은 습관처럼 저도 수동 포맷팅이 아닌 단락 스타일을 사용했습니다. "Heretics-of-Piedmont_revised-final-3.docx" 같은 이름의 Word 문서가 바로 제 기본 소스이자, 모든 최종 포맷의 공통 조상이 되었습니다.

다만 Word에서 인쇄용 책을 포맷팅하고 싶지는 않았습니다. 기술적으로 가능하냐고요? 물론입니다. 하지만 전문가 수준의 품질 기준을 만족시키는가는 따로 문제죠. Word의 하이픈 처리와 정렬 기능은 한계가 있고, 다른 여러 약점들도 있습니다. 제가 2026년 초에 마지막으로 확인했을 때만 해도 Word는 데스크톱 출판 소프트웨어처럼 마이크로타이포그래피 같은 기능을 갖추지 못했습니다.

다른 선택지들이 있지만, Adobe InDesign이 업계 표준입니다. 전문가들은 이 검증된 기능 모음으로 진정한 예술 수준의 작품을 만들어냅니다. 저도 제 책에서 그 정도 품질을 원했습니다. 그래서 정신 차리고 Adobe Creative Cloud의 세계로 뛰어들었죠. 처음엔 InDesign 사용법을 몰랐지만, 책을 읽고 YouTube 영상을 봤습니다. DOCX 스타일 매핑, 이음표 자동 줄바꿈 방지, 깔끔한 여백, 페이지 밸런싱, 멋진 드롭캡, 글자 간격, 광학 여백, 베이스라인 그리드 같은 것들을 배웠죠. 여기저기 전문 용어가 많지만, 이 작업은 꽤 만족스럽습니다. 특히 최종 결과물에서 이런 디테일을 눈여겨볼 때 더욱 그렇죠. (참고로 서점을 다닐 때마다 저는 대형 출판사들이 어떻게 책을 만드는지 살펴봅니다.) 시리즈 2부, 3부를 할 때도 InDesign을 선택했습니다.

전자책은 완전히 다른 이야기입니다. EPUB을 만드는 방법은 많지만, InDesign이 인쇄본 시장을 지배하는 것처럼 전자책 분야를 장악하는 도구는 없는 것 같습니다. Kovid Goyal은 소프트웨어 세계에서 잘 알려진 이름입니다. 그는 컴퓨터로 작업하는 우리 모두를 위해 일을 더 나아지게 만드는 재능 있는 개발자 중 한 명이죠. 아마 그의 가장 유명한 기여는 Calibre일 겁니다. 강력한 전자책 관리자인데, 거의 모든 형식의 전자책을 읽을 수 있을 뿐 아니라, 훌륭한 전자책 제작 툴셋도 포함되어 있습니다. Microsoft Word 문서를 불러오는 것도 간단하고, HTML과 CSS 지식이 좀 있으면 호환성 높은 EPUB을 만들 수 있습니다.

Kindle은 또 다른 문제였습니다. Kindle Direct Publishing(KDP)에 EPUB을 업로드하면 Amazon이 자신들의 독점 포맷인 KFX로 변환해줍니다. 하지만 제가 Calibre로 만든 EPUB을 업로드했을 때는 성공한 적이 없었습니다. Amazon이 제안하는 방법은 Kindle Create인데, 이건 그럭저럭 작동했지만 또 다른 포맷을 유지해야 했습니다. 소프트웨어 개발자로서의 제 내면이 비명을 지르고 있었습니다.

## 문제점들

조금만 수정해도 엄청난 번거로움이 생겼습니다.

- "기본" DOCX 파일 수정
- InDesign 파일 업데이트, PDF 내보내기, 배포처에 업로드
- Calibre에서 EPUB 수정, EPUB 내보내기, 배포처에 업로드
- Kindle Create에서 수정, KPF 내보내기, KDP에 업로드

저는 Linux 노트북을 주로 쓰는데, Kindle Create와 InDesign 모두 Linux에서는(Wine으로도) 작동하지 않습니다. 결국 가족 MacBook으로 전환해야 했죠. 첫 세계의 고민들이긴 하지만, 저는 늘 쓰던 환경을 선호합니다.

몇 년 전 Hacker News에서 Standard Ebooks라는 프로젝트를 발견했습니다. 그들의 목표를 읽고 몇 권의 출판물을 훑어봤는데, 깜짝 놀랐다는 표현이 모자랄 정도였습니다. 그들의 책들은 무료 전자책들보다 훨씬 수준이 높았거든요. 그 프로젝트를 눈여겨본 후로, 그들의 퍼블릭 도메인 저작물 라이브러리에서 최소 열 권 이상을 읽었습니다. (그런데 이 기관은 정말 후원할 가치가 있는 곳입니다.) 제 전자책도 그 정도 품질에 도달할 수 있으면 좋겠다고 생각했습니다.

## 방향 전환

2025년에 제 삼부작의 마지막 책 《Prince of Savoy》를 완성했고, 포맷팅을 시작할 준비가 되었습니다. 지금까지처럼 Word 문서를 InDesign으로 불러와 인쇄판을 포맷팅했죠. 그런데 그때 한 가지 생각이 들었습니다. 만약 Standard Ebooks(SE)의 프로세스를 따라가면 어떨까?

몇 가지 이유로, 저는 Calibre를 사용해 DOCX를 깔끔한 EPUB으로 변환했고, 나중에 SE의 상세한 전자책 제작 가이드를 따라 그들의 Manual of Style을 적용하기로 했습니다.

금새 깨달은 건 SE의 기준이 얼마나 엄격한지입니다.

## 참고 자료

- [원문 링크](https://www.djspeckhals.com/posts/2026-05-22-how-i-bypassed-adobe-and-microsoft-to-build-a-git-tracked-book-production-pipeline/)
- via Hacker News (Top)
- engagement: 139

## 관련 노트

- [[2026-05-26|2026-05-26 Dev Digest]]
