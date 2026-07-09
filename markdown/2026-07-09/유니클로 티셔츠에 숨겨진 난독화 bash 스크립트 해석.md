---
title: "유니클로 티셔츠에 숨겨진 난독화 bash 스크립트 해석"
tags: [dev-digest, tech]
type: study
tech:
  - frontend
level: ""
created: 2026-07-09
aliases: []
---

> [!info] 원문
> [Decoding the obfuscated bash script on a Uniqlo t-shirt](https://tris.sherliker.net/blog/obfuscated-self-evaluating-bash-script-by-cdn-akamai-being-supplied-to-consumers-via-retail-stores/) · Hacker News (Top)

## 핵심 개념

> [!abstract]
> Akamai의 'Peace for All' 캠페인으로 유니클로에서 판매된 티셔츠 뒷면에 Base64 인코딩된 bash 스크립트가 인쇄되어 있으며, 디코딩하면 평화 메시지를 화려한 터미널 애니메이션으로 출력하는 이스터 에그가 나타난다.

## 상세 내용

- 티셔츠 텍스트는 Base64로 인코딩된 자가평가 bash 스크립트로, 한국어, 일본어, 영어 축하 메시지 포함
- 스크립트는 터미널의 '♥PEACE♥FOR♥ALL♥' 텍스트를 사인 함수로 파동 애니메이션하며 색상 그래디언트 적용

> [!tip] 왜 중요한가
> 개발자 커뮤니티의 창의성과 보안 인식을 다루며, 난독화 코드 분석과 문자 인식(OCR) 기술의 실제 활용 사례를 보여준다.

## 전문 번역

# 유니클로 티셔츠에 숨겨진 bash 스크립트 이스터에그

아내가 "내가 본 티셔츠 한번 봐"라고 했을 때, 솔직히 뭘 기대해야 할지 몰랐어요. 그런데 뒷면에 이스터에그 메시지를 출력하도록 설계된 난독화된 bash 스크립트가 인쇄되어 있다니까요. 한 번에 반했죠.

## 무엇이 인쇄되어 있었을까?

정확히 말하자면 이건 아카마이(Akamai)에서 '평화를 위한 캠페인' 지원 목적으로 디자인하고, 유니클로 오프라인 매장을 통해 배포한 이스터에그거든요. 정말 멋있어요.

앞면에는 중괄호 안의 하트가 있고:

```
❤️
```

뒷면에는 큰 영숫자 블록이 있습니다:

```
IyEvYmluL2Jhc2gKCiMgQ29uZ3JhdHVsYXRpb25zISBZb3UgZm91bmQgdGhlIGVhc3RlciBlZ2chIOKdpO+4jwojIOOBiuOCgeOBp+OBqOOBhuOBlOOBluOBhOOBvuOBme+8gemaoOOBleOCjOOBn+OCteODl+ODqeOCpOOCuuOCkuimi+OBpOOBkeOBvuOBl+OBn++8geKdpO+4jwoKIyBEZWZpbmUgdGhlIHRleHQgdG8gYW5pbWF0ZQp0ZXh0PSLimaVQRUFDReKZpUZPUuKZpUFMTOKZpVBFQUNF4pmlRk9S4pmlQUxM4pmlUEVBQ0XimaVGT1LimaVBTEzimaVQRUFDReKZpUZPUuKZpUFMTOKZpVBFQUNF4pmlRk9S4pmlQUxM4pmlIgoKIyBHZXQgdGVybWluYWwgZGltZW5zaW9ucwpjb2xzPSQodHB1dCBjb2xzKQpsaW5lcz0kKHRwdXQgbGluZXMpCgojIENhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIHRoZSB0ZXh0CnRleHRfbGVuZ3RoPSR7I3RleHR9CgojIEhpZGUgdGhlIGN1cnNvcgp0cHV0IGNpdmlzCgojIFRyYXAgQ1RSTCtDIHRvIHNob3cgdGhlIGN1cnNvciBiZWZvcmUgZXhpdGluZwp0cmFwICJ0cHV0IGNub3JtOyBleGl0IiBTSUdJTlQKCiMgU2V0IGZyZXF1ZW5jeSBzY2FsaW5nIGZhY3RvcgpmcmVxPTAuMgoKIyBJbmZpbml0ZSBsb29wIGZvciBjb250aW51b3VzIGFuaW1hdGlvbgpmb3IgKCggdD0wOyA7IHQrPTEgKSk7IGRvCiAgICAjIEV4dHJhY3Qgb25lIGNoYXJhY3RlciBhdCBhIHRpbWUKICAgIGNoYXI9IiR7dGV4dDp0ICUgdGV4dF9sZW5ndGg6MX0iCiAgICAKICAgICMgQ2FsY3VsYXRlIHRoZSBhbmdsZSBpbiByYWRpYW5zCiAgICBhbmdsZT0kKGVjaG8gIigkdCkgKiAkZnJlcSIgfCBiYyAtbCkKCiAgICAjIENhbGN1bGF0ZSB0aGUgc2luZSBvZiB0aGUgYW5nbGUKICAgIHNpbmVfdmFsdWU9JChlY2hvICJzKCRhbmdsZSkiIHwgYmMgLWwpCgogICAgIyBDYWxjdWxhdGUgeCBwb3NpdGlvbiB1c2luZyB0aGUgc2luZSB2YWx1ZQogICAgeD0kKGVjaG8gIigkY29scyAvIDIpICsgKCRjb2xzIC8gNCkgKiAkc2luZV92YWx1ZSIgfCBiYyAtbCkKICAgIHg9JChwcmludGYgIiUuMGYiICIkeCIpCgogICAgIyBFbnN1cmUgeCBpcyB3aXRoaW4gdGVybWluYWwgYm91bmRzCiAgICBpZiAoKCB4IDwgMCApKTsgdGhlbiB4PTA7IGZpCiAgICBpZiAoKCB4ID49IGNvbHMgKSk7IHRoZW4geD0kKChjb2xzIC0gMSkpOyBmaQoKICAgICMgQ2FsY3VsYXRlIGNvbG9yIGdyYWRpZW50IGJldHdlZW4gMTIgKGN5YW4pIGFuZCAyMDggKG9yYW5nZSkKICAgIGNvbG9yX3N0YXJ0PTEyCiAgICBjb2xvcl9lbmQ9MjA4CiAgICBjb2xvcl9yYW5nZT0kKChjb2xvcl9lbmQgLSBjb2xvcl9zdGFydCkpCiAgICBjb2xvcj0kKChjb2xvcl9zdGFydCArIChjb2xvcl9yYW5nZSAqIHQgL
```

잠깐, 이게... shebang이야?!

네, 맞습니다. 정말로 shebang이 있어요. 게다가 거리의 소매점에서 판매되는 티셔츠에요. 더 자세히 보면, 이건 base64로 인코딩된 here string을 `base64 --decode`로 디코딩해서 `eval`로 실행하는 구조네요. 흥미로워요. 아내에게 "이건 바이러스 배포 방식이랑 똑같아"라고 했다가 그 자리에서 바로 샀어요.

## OCR 작업은 생각보다 까다로웠어요

좋은 소식과 나쁜 소식이 있었습니다.

**나쁜 소식**: base64는 에러 정정 기능이 없어요. 따라서 한 글자도 틀리면 안 되거든요. 한숨이 나왔어요.

**좋은 소식**: 문자열이 온전히 남아있었어요. 최소한 끝에 예상대로 패딩이 있고, 따옴표와 중괄호도 쌍을 이루고 있었습니다.

다행스럽게도 같은 라인업의 다른 디자인 티셔츠는 텍스트가 잘려있거든요. 예를 들어 import가 절반이고 "return" 대신 "retu"로 끝나는 식이죠. 정말 아쉬운데, 그건 색감 조합이 정말 좋고 누구나 공감할 만한 `go doStuff(msg, work...` 같은 코드가 있거든요.

## 디코딩 과정

OCR을 여러 방식으로 시도했어요.

- 안드로이드의 Circle to Search 내장 OCR 사용 (꽤 좋아요)
- Tesseract를 여러 옵션으로 실행
- Claude에 처리 요청

세 결과물을 비교해서 틀린 부분을 찾고, Claude가 빠르게 확인할 수 있도록 위치 테이블을 출력하게 했어요. 그 다음엔 나머지를 손으로 정리했는데, 시간이 꽤 걸렸지만 결국 완성된 문자열을 얻을 수 있었습니다:

```
IyEvYmluL2Jhc2gKCiMgQ29uZ3JhdHVsYXRpb25zISBZb3UgZm91bmQgdGhlIGVhc3RlciBlZ2chIOKdpO+4jwojIOOBiuOCgeOBp+OBqOOBhuOBlOOBluOBhOOBvuOBme+8gemaoOOBleOCjOOBn+OCteODl+ODqeOCpOOCuuOCkuimi+OBpOOBkeOBvuOBl+OBn++8geKdpO+4jwoKIyBEZWZpbmUgdGhlIHRleHQgdG8gYW5pbWF0ZQp0ZXh0PSLimaVQRUFDReKZpUZPUuKZpUFMTOKZpVBFQUNF4pmlRk9S4pmlQUxM4pmlUEVBQ0XimaVGT1LimaVBTEzimaVQRUFDReKZpUZPUuKZpUFMTOKZpVBFQUNF4pmlRk9S4pmlQUxM4pmlIgoKIyBHZXQgdGVybWluYWwgZGltZW5zaW9ucwpjb2xzPSQodHB1dCBjb2xzKQpsaW5lcz0kKHRwdXQgbGluZXMpCgojIENhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIHRoZSB0ZXh0CnRleHRfbGVuZ3RoPSR7I3RleHR9CgojIEhpZGUgdGhlIGN1cnNvcgp0cHV0IGNpdmlzCgojIFRyYXAgQ1RSTCtDIHRvIHNob3cgdGhlIGN1cnNvciBiZWZvcmUgZXhpdGluZwp0cmFwICJ0cHV0IGNub3JtOyBleGl0IiBTSUdJTlQKCiMgU2V0IGZyZXF1ZW5jeSBzY2FsaW5nIGZhY3RvcgpmcmVxPTAuMgoKIyBJbmZpbml0ZSBsb29wIGZvciBjb250aW51b3VzIGFuaW1hdGlvbgpmb3IgKCggdD0wOyA7IHQrPTEgKSk7IGRvCiAgICAjIEV4dHJhY3Qgb25lIGNoYXJhY3RlciBhdCBhIHRpbWUKICAgIGNoYXI9IiR7dGV4dDp0ICUgdGV4dF9sZW5ndGg6MX0iCiAgICAKICAgICMgQ2FsY3VsYXRlIHRoZSBhbmdsZSBpbiByYWRpYW5zCiAgICBhbmdsZT0kKGVjaG8gIigkdCkgKiAkZnJlcSIgfCBiYyAtbCkKCiAgICAjIENhbGN1bGF0ZSB0aGUgc2luZSBvZiB0aGUgYW5nbGUKICAgIHNpbmVfdmFsdWU9JChlY2hvICJzKCRhbmdsZSkiIHwgYmMgLWwpCgogICAgIyBDYWxjdWxhdGUgeCBwb3NpdGlvbiB1c2luZyB0aGUgc2luZSB2YWx1ZQogICAgeD0kKGVjaG8gIigkY29scyAvIDIpICsgKCRjb2xzIC8gNCkgKiAkc2luZV92YWx1ZSIgfCBiYyAtbCkKICAgIHg9JChwcmludGYgIiUuMGYiICIkeCIpCgogICAgIyBFbnN1cmUgeCBpcyB3aXRoaW4gdGVybWluYWwgYm91bmRzCiAgICBpZiAoKCB4IDwgMCApKTsgdGhlbiB4PTA7IGZpCiAgICBpZiAoKCB4ID49IGNvbHMgKSk7IHRoZW4geD0kKChjb2xzIC0gMSkpOyBmaQoKICAgICMgQ2FsY3VsYXRlIGNvbG9yIGdyYWRpZW50IGJldHdlZW4gMTIgKGN5YW4pIGFuZCAyMDggKG9yYW5nZSkKICAgIGNvbG9yX3N0YXJ0PTEyCiAgICBjb2xvcl9lbmQ9MjA4CiAgICBjb2xvcl9yYW5nZT0kKChjb2xvcl9lbmQgLSBjb2xvcl9zdGFydCk

## 참고 자료

- [원문 링크](https://tris.sherliker.net/blog/obfuscated-self-evaluating-bash-script-by-cdn-akamai-being-supplied-to-consumers-via-retail-stores/)
- via Hacker News (Top)
- engagement: 1291

## 관련 노트

- [[2026-07-09|2026-07-09 Dev Digest]]
